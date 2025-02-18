import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { SongFormDialog } from "./components/SongFormDialog";
import SongTable from "./components/TableComponents/SongTable";
import SongCard from "./components/TableComponents/SongCard";
import SongControls from "./components/TableComponents/SongControls";
import { DeleteDialog, ResolveDialog } from "./components/DialogComponents/SongDialogs";
import { sortSongs, filterSongs, exportSongsToCSV, importSongsFromCSV, handleSingleDuplicate, processRemainingImports } from "./utils/songUtils";
import {
  Box,
  Container,
  LinearProgress,
  TablePagination,
  CircularProgress,
  Snackbar,
  Alert,
  Fab,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useMediaQuery,
  useTheme,
  Checkbox,
} from "@mui/material";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import { firestore } from "./firebase";
import firebase from 'firebase/compat/app';

const ListSong = () => {
  // State declarations
  const [songs, setSongs] = useState([]);
  const [selectedSongIds, setSelectedSongIds] = useState([]);
  const [reports, setReports] = useState([]);
  const [collectionList, setCollectionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [songFormOpen, setSongFormOpen] = useState(false);
  const [songFormMode, setSongFormMode] = useState("new");
  const [songFormInitialData, setSongFormInitialData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolveReportId, setResolveReportId] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showGoToTop, setShowGoToTop] = useState(false);
  const [duplicatesDialogOpen, setDuplicatesDialogOpen] = useState(false);
  const [duplicateSongs, setDuplicateSongs] = useState([]);
  const [importFile, setImportFile] = useState(null);

  const [currentDuplicate, setCurrentDuplicate] = useState(null);
  const [remainingImports, setRemainingImports] = useState(null);
  const [importProgress, setImportProgress] = useState({ processed: 0, total: 0 });
  const [singleDuplicateDialogOpen, setSingleDuplicateDialogOpen] = useState(false);
  const [applyToAll, setApplyToAll] = useState(false);
  const [savedAction, setSavedAction] = useState(null);

  const navigate = useNavigate();
  const { collectionName } = useParams();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Data fetching
  const fetchStaticData = useCallback(async () => {
    try {
      const collectionSnapshot = await firestore.collection("collections").get();
      setCollectionList(collectionSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching static data:", error);
    }
  }, []);

  const fetchDynamicData = useCallback(async () => {
    if (!selectedCollection) return;
    try {
      const songSnapshot = await firestore.collection(selectedCollection).get();
      const reportSnapshot = await firestore.collection("reports").get();
      
      // Map song data ensuring all fields are included
      const songData = songSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          artistName: data.artistName || '',
          content: data.content || '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          order: data.order || '',
          youtube: data.youtube || '',
          newFlag: Boolean(data.newFlag),
          newTts: Boolean(data.newTts),
          tirthankarId: data.tirthankarId || '',
          publishDate: data.publishDate || null
        };
      });
      
      setSongs(songData);
      setReports(reportSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching dynamic data:", error);
    }
  }, [selectedCollection]);

  // Effects
  useEffect(() => {
    if (collectionName) {
      setSelectedCollection(collectionName);
    }
    
    // Handle suggestion data if coming from suggestion page
    if (location.state?.suggestion && location.state?.fromSuggestions) {
      const suggestion = location.state.suggestion;
      
      // Set the collection based on suggestion's collection
      setSelectedCollection(suggestion.collection);
      
      // Format the data for the form
      const formData = {
        ...suggestion,
        // Preserve the artist field as is
        artist: suggestion.artist,
        // Ensure tags is an array
        tags: Array.isArray(suggestion.tags) ? suggestion.tags : suggestion.tags ? suggestion.tags.split(',').map(t => t.trim()) : [],
        // Convert order to string if it exists
        order: suggestion.order?.toString() || "",
        youtube: suggestion.youtube || "",
        newFlag: Boolean(suggestion.newFlag),
        newTts: Boolean(suggestion.newTts),
        tirthankarId: suggestion.tirthankarId || ""
      };

      // Delay opening the form slightly to ensure collection is set
      setTimeout(() => {
        setSongFormMode("new");
        setSongFormInitialData(formData);
        setSongFormOpen(true);
      }, 100);

      // Clear the navigation state after processing
      navigate(`/list-song/${suggestion.collection}`, { replace: true });
    }
  }, [collectionName, location.state, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchStaticData();
      await fetchDynamicData();
      setLoading(false);
    };
    if (selectedCollection) {
      fetchData();
    }
  }, [selectedCollection, fetchStaticData, fetchDynamicData]);

  useEffect(() => {
    const handleScroll = () => {
      setShowGoToTop(window.pageYOffset > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handlers
  const handleCollectionChange = (e) => {
    const newCollection = e.target.value;
    setSelectedCollection(newCollection);
    setPage(0); // Reset to first page when changing collection
    navigate(`/list-song/${newCollection}`);
  };

  const handleAddNewClick = () => {
    setSongFormMode("new");
    setSongFormInitialData(null);
    setSongFormOpen(true);
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMessage("Starting import...");
    
    try {
      const result = await importSongsFromCSV(
        file,
        selectedCollection,
        setImportMessage
      );

      if (result.duplicateFound) {
        setCurrentDuplicate({
          songData: result.songData,
          existingDoc: result.existingDoc
        });
        setRemainingImports(result.remainingSongs);
        setImportProgress({
          processed: result.processedCount || 0,
          total: result.remainingSongs.length + 1
        });
        setSingleDuplicateDialogOpen(true);
        return;
      }

      setImportMessage(`Successfully imported ${result.count} song(s).`);
      await fetchDynamicData();
    } catch (error) {
      console.error("Error during import:", error);
      setImportMessage("Error during import. Please try again.");
    } finally {
      if (!currentDuplicate) {
        setImporting(false);
        setSnackbarOpen(true);
      }
    }
  };

  const handleSingleDuplicateAction = async (action, shouldApplyToAll = false) => {
    setSingleDuplicateDialogOpen(false);
    
    try {
      let processedCount = importProgress.processed;

      // If applying to all, process current and all remaining songs at once
      if (shouldApplyToAll) {
        const allRemainingFiles = [currentDuplicate.songData, ...remainingImports.map(song => ({
          title: song.Title,
          artistName: song.Artist,
          tags: song.Tags?.split(",").map((tag) => tag.trim().toLowerCase()) || [],
          order: song.Order ? Number(song.Order) : null,
          youtube: song.YouTube,
          publishDate: firebase.firestore.Timestamp.now(),
          content: song.Content,
        }))];

        if (action === 'skip') {
          // Skip all remaining songs immediately
          setImportMessage(`Skipped ${allRemainingFiles.length} songs with duplicates.`);
        } else {
          // Process all files with the chosen action
          for (const songData of allRemainingFiles) {
            setImportMessage(`Processing: ${songData.title}`);
            
            const existing = await firestore.collection(selectedCollection)
              .where("title", "==", songData.title)
              .get();

            if (!existing.empty) {
              await handleSingleDuplicate(action, songData, existing.docs[0], selectedCollection);
            } else {
              await firestore.collection(selectedCollection).add(songData);
            }
            processedCount++;
          }
          setImportMessage(`Successfully processed ${processedCount} songs.`);
        }

        await fetchDynamicData();
        setImporting(false);
        setCurrentDuplicate(null);
        setRemainingImports(null);
        setImportProgress({ processed: 0, total: 0 });
        setApplyToAll(false);
        setSavedAction(null);
        setSnackbarOpen(true);
        return;
      }

      // Handle single item action
      if (action !== 'skip') {
        await handleSingleDuplicate(
          action, 
          currentDuplicate.songData, 
          currentDuplicate.existingDoc, 
          selectedCollection
        );
      }
      processedCount++;

      if (remainingImports && remainingImports.length > 0) {
        const result = await processRemainingImports(
          remainingImports,
          selectedCollection,
          setImportMessage
        );

        if (result.duplicateFound) {
          setCurrentDuplicate({
            songData: result.songData,
            existingDoc: result.existingDoc
          });
          setRemainingImports(result.remainingSongs);
          setImportProgress({ processed: processedCount, total: processedCount + result.remainingSongs.length + 1 });
          setSingleDuplicateDialogOpen(true);
          return;
        }

        processedCount += result.count;
      }

      setImportMessage(`Import completed. Processed ${processedCount} songs.`);
      await fetchDynamicData();
      setImporting(false);
      setCurrentDuplicate(null);
      setRemainingImports(null);
      setImportProgress({ processed: 0, total: 0 });
      
    } catch (error) {
      console.error("Error handling duplicates:", error);
      setImportMessage("Error during import. Please try again.");
      setImporting(false);
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleImportWithDuplicateAction = async (action) => {
    setDuplicatesDialogOpen(false);
    if (action === 'skip') {
      setImportMessage("Import cancelled.");
      setSnackbarOpen(true);
      return;
    }

    setImporting(true);
    setImportMessage("Starting import...");

    try {
      const result = await importSongsFromCSV(
        importFile,
        selectedCollection,
        setImportMessage,
        action
      );

      setImportMessage(`Successfully imported ${result.count} song(s).`);
      await fetchDynamicData();
    } catch (error) {
      console.error("Error during import:", error);
      setImportMessage("Error during import. Please try again.");
    } finally {
      setImporting(false);
      setSnackbarOpen(true);
      setImportFile(null);
    }
  };

  const handleFormSubmit = async (data, mode, collectionInfo) => {
    try {
      // No need to handle the Firestore operations here as they're now handled in SongFormDialog
      setSongFormOpen(false);
      setSongFormInitialData(null);

      // If collection was changed, fetch data for both collections
      if (collectionInfo && collectionInfo.previousCollection !== collectionInfo.newCollection) {
        setSelectedCollection(collectionInfo.newCollection);
        await fetchDynamicData();
        // Navigate to new collection URL
        navigate(`/list-song/${collectionInfo.newCollection}`);
      } else {
        await fetchDynamicData();
      }
      
      setImportMessage(mode === "new" ? "Song added successfully" : "Song updated successfully");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error in form submission:", error);
      setImportMessage("Error submitting the form");
      setSnackbarOpen(true);
    }
  };

  // Handle edit click with proper data passing
  const handleEditClick = (song) => {
    setSongFormMode("edit");
    // First set the song data
    const formData = {
      id: song.id,
      title: song.title || "",
      artist: song.artistName || "",  // Map artistName to artist for form
      content: song.content || "",
      tags: Array.isArray(song.tags) ? song.tags : song.tags ? song.tags.split(',').map(t => t.trim()) : [],
      order: song.order?.toString() || "",
      youtube: song.youtube || "",
      newFlag: Boolean(song.newFlag),
      newTts: Boolean(song.newTts),
      tirthankarId: song.tirthankarId || "",
      collection: selectedCollection // Add collection to form data
    };
    setSongFormInitialData(formData);
    // Then open the form
    setSongFormOpen(true);
  };

  const handleSelectSong = (id) => {
    setSelectedSongIds((prev) =>
      prev.includes(id)
        ? prev.filter((songId) => songId !== id)
        : [...prev, id]
    );
  };

  // Computed values
  const sortedSongs = sortSongs(songs, reports);
  const filteredSongs = filterSongs(sortedSongs, searchInput);
  const paginatedSongs = filteredSongs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const hasAnyReport = filteredSongs.some((song) =>
    reports.some((r) => r.lyricsId === song.id)
  );

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Song Management
        </Typography>
      </Box>

      <SongControls
        selectedCollection={selectedCollection}
        handleCollectionChange={handleCollectionChange}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        setPage={setPage}
        exportData={() => exportSongsToCSV(songs, selectedCollection)}
        handleImport={handleImport}
        handleAddNewClick={handleAddNewClick}
        selectedSongIds={selectedSongIds}
        setDeleteDialogOpen={setDeleteDialogOpen}
        collectionList={collectionList}
      />

      {importing && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            {importMessage}
          </Typography>
        </Box>
      )}

      {isMobile ? (
        // Mobile card view
        <Box>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Checkbox
              checked={paginatedSongs.length > 0 && selectedSongIds.length === paginatedSongs.length}
              indeterminate={selectedSongIds.length > 0 && selectedSongIds.length < paginatedSongs.length}
              onChange={(event) => {
                if (event.target.checked) {
                  setSelectedSongIds(paginatedSongs.map((song) => song.id));
                } else {
                  setSelectedSongIds([]);
                }
              }}
            />
            <Typography variant="body1">
              Select All ({selectedSongIds.length}/{paginatedSongs.length})
            </Typography>
          </Box>
          {paginatedSongs.map((song) => {
            const report = reports.find((r) => r.lyricsId === song.id);
            const isItemSelected = selectedSongIds.includes(song.id);
            return (
              <SongCard
                key={song.id}
                song={song}
                report={report}
                isItemSelected={isItemSelected}
                handleSelectSong={handleSelectSong}
                handleEditClick={handleEditClick}
                handleDeleteClick={(id) => {
                  setSelectedSongIds([id]);
                  setDeleteDialogOpen(true);
                }}
                handleResolveClick={(reportId) => {
                  setResolveReportId(reportId);
                  setResolveDialogOpen(true);
                }}
              />
            );
          })}
        </Box>
      ) : (
        // Desktop table view
        <SongTable
          hasAnyReport={hasAnyReport}
          paginatedSongs={paginatedSongs}
          selectedSongIds={selectedSongIds}
          reports={reports}
          handleSelectAll={(event) => {
            if (event.target.checked) {
              setSelectedSongIds(paginatedSongs.map((song) => song.id));
            } else {
              setSelectedSongIds([]);
            }
          }}
          handleSelectSong={(id) => {
            setSelectedSongIds((prev) =>
              prev.includes(id)
                ? prev.filter((songId) => songId !== id)
                : [...prev, id]
            );
          }}
          handleEditClick={handleEditClick}
          handleDeleteClick={(id) => {
            setSelectedSongIds([id]);
            setDeleteDialogOpen(true);
          }}
          handleResolveClick={(reportId) => {
            setResolveReportId(reportId);
            setResolveDialogOpen(true);
          }}
        />
      )}

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, { label: "All", value: filteredSongs.length }]}
        component="div"
        count={filteredSongs.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />

      <SongFormDialog
        open={songFormOpen}
        onClose={() => {
          setSongFormOpen(false);
          setSongFormInitialData(null); // Clear form data when closing
        }}
        mode={songFormMode}
        initialData={songFormInitialData}
        collectionName={selectedCollection}
        collectionList={collectionList}
        onSubmit={handleFormSubmit}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={async () => {
          try {
            const batch = firestore.batch();
            selectedSongIds.forEach((id) => {
              const docRef = firestore.collection(selectedCollection).doc(id);
              batch.delete(docRef);
            });
            await batch.commit();
            setSongs((prev) => prev.filter((song) => !selectedSongIds.includes(song.id)));
            setSelectedSongIds([]);
            setDeleteDialogOpen(false);
          } catch (error) {
            console.error("Error deleting documents:", error);
            alert("Error deleting the song. Please try again.");
          }
        }}
      />

      <ResolveDialog
        open={resolveDialogOpen}
        onClose={() => setResolveDialogOpen(false)}
        onConfirm={async () => {
          try {
            await firestore.collection("reports").doc(resolveReportId).delete();
            setReports((prev) => prev.filter((report) => report.id !== resolveReportId));
            setResolveDialogOpen(false);
          } catch (error) {
            console.error("Error resolving report:", error);
          }
        }}
      />

      <Dialog open={duplicatesDialogOpen} onClose={() => setDuplicatesDialogOpen(false)}>
        <DialogTitle>Duplicate Songs Found</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {duplicateSongs.length} song(s) with the same titles were found in the collection:
            <Box component="ul" sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
              {duplicateSongs.map((song, idx) => (
                <li key={idx}>{song.title}</li>
              ))}
            </Box>
            What would you like to do with these duplicates?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleImportWithDuplicateAction('skip')}>Skip All</Button>
          <Button onClick={() => handleImportWithDuplicateAction('replace')} color="warning">Replace All</Button>
          <Button onClick={() => handleImportWithDuplicateAction('add')} color="primary">Add All as New</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={singleDuplicateDialogOpen} 
        onClose={() => setSingleDuplicateDialogOpen(false)}
      >
        <DialogTitle>Duplicate Song Found ({importProgress.processed + 1} of {importProgress.total})</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A song with the title "{currentDuplicate?.songData.title}" already exists in this collection. What would you like to do?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => handleSingleDuplicateAction('skip')}>
              Skip This
            </Button>
            <Button onClick={() => handleSingleDuplicateAction('replace')} color="warning">
              Replace Existing
            </Button>
            <Button onClick={() => handleSingleDuplicateAction('add')} color="primary">
              Add as New
            </Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, borderTop: 1, pt: 1, borderColor: 'divider' }}>
            <Button onClick={() => handleSingleDuplicateAction('skip', true)}>
              Skip All
            </Button>
            <Button onClick={() => handleSingleDuplicateAction('replace', true)} color="warning">
              Replace All
            </Button>
            <Button onClick={() => handleSingleDuplicateAction('add', true)} color="primary">
              Add All as New
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={importMessage.includes("Error") ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {importMessage}
        </Alert>
      </Snackbar>

      {showGoToTop && (
        <Fab
          color="primary"
          size="small"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}
        >
          <ArrowUpward />
        </Fab>
      )}
    </Container>
  );
};

export default ListSong;
