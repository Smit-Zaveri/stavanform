import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { SongFormDialog } from "./components/SongFormDialog";
import SongTable from "./components/TableComponents/SongTable";
import SongControls from "./components/TableComponents/SongControls";
import { DeleteDialog, ResolveDialog } from "./components/DialogComponents/SongDialogs";
import { sortSongs, filterSongs, exportSongsToCSV, importSongsFromCSV } from "./utils/songUtils";
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
} from "@mui/material";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import { firestore } from "./firebase";

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

  const navigate = useNavigate();
  const { collectionName } = useParams();
  const location = useLocation();

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
      setSongs(songSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
      const successCount = await importSongsFromCSV(
        file,
        selectedCollection,
        setImportMessage
      );
      setImportMessage(`Successfully imported ${successCount} song(s).`);
      await fetchDynamicData();
    } catch (error) {
      console.error("Error during import:", error);
      setImportMessage("Error during import. Please try again.");
    } finally {
      setImporting(false);
      setSnackbarOpen(true);
    }
  };

  const handleFormSubmit = async (data, mode) => {
    try {
      const collectionRef = firestore.collection(selectedCollection);

      // Format data to use artistName when saving to database
      const formattedData = {
        ...data,
        artistName: data.artist || "",
      };
      delete formattedData.artist;

      if (mode === "new") {
        await collectionRef.add(formattedData);
        // If this came from suggestions, delete the original suggestion
        if (location.state?.suggestionId) {
          await firestore.collection("suggestions_new").doc(location.state.suggestionId).delete();
          navigate(location.pathname, { replace: true });
        }
      } else if (mode === "edit") {
        const { id, ...updateData } = formattedData;
        await collectionRef.doc(id).update(updateData);
      }
      
      setSongFormOpen(false);
      setSongFormInitialData(null);
      await fetchDynamicData();
      
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
    // Convert the song data to match the form fields
    const formData = {
      ...song,
      // Map artistName back to artist for the form
      artist: song.artistName || "",
      tags: Array.isArray(song.tags) ? song.tags : song.tags ? song.tags.split(',').map(t => t.trim()) : [],
      order: song.order?.toString() || "",
      youtube: song.youtube || "",
      newFlag: Boolean(song.newFlag),
      newTts: Boolean(song.newTts),
      tirthankarId: song.tirthankarId || ""
    };
    delete formData.artistName; // Remove artistName as we're using artist in the form
    setSongFormInitialData(formData);
    setSongFormOpen(true);
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
