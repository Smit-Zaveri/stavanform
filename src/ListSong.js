import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SongFormDialog } from "./components/SongFormDialog";
import {
  Box,
  Button,
  Container,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  TablePagination,
  CircularProgress,
  Snackbar,
  Alert,
  Fab,
} from "@mui/material";
import { Delete, FileUpload, Save, Add } from "@mui/icons-material";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import Papa from "papaparse";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import { firestore } from "./firebase";

const SongList = () => {
  // State declarations
  const [songs, setSongs] = useState([]);
  const [artistOptions, setArtistOptions] = useState([]);
  const [selectedSongIds, setSelectedSongIds] = useState([]);
  const [reports, setReports] = useState([]);
  const [collectionList, setCollectionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  // For TablePagination, page is zero-indexed.
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [songFormOpen, setSongFormOpen] = useState(false);
  const [songFormMode, setSongFormMode] = useState("new"); // "new" or "edit"
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

  // Toggle selection for a single song
  const handleSelectSong = (id) => {
    setSelectedSongIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((songId) => songId !== id)
        : [...prevSelected, id]
    );
  };

  // Toggle selection for all songs in the current page
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelecteds = paginatedSongs.map((song) => song.id);
      setSelectedSongIds(newSelecteds);
    } else {
      setSelectedSongIds([]);
    }
  };

  // Fetch static data: artists and collections
  const fetchStaticData = useCallback(async () => {
    try {
      const artistSnapshot = await firestore.collection("artists").get();
      const collectionSnapshot = await firestore.collection("collections").get();
      setArtistOptions(
        artistSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setCollectionList(
        collectionSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error("Error fetching static data:", error);
    }
  }, []);

  // Fetch dynamic data: songs and reports
  const fetchDynamicData = useCallback(async () => {
    try {
      const songSnapshot = await firestore.collection(selectedCollection).get();
      const reportSnapshot = await firestore.collection("reports").get();
      setSongs(songSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setReports(reportSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching dynamic data:", error);
    }
  }, [selectedCollection]);

  // Set initial collection from URL params
  useEffect(() => {
    if (collectionName) setSelectedCollection(collectionName);
  }, [collectionName]);

  // Fetch data whenever selectedCollection changes
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
      if (window.pageYOffset > 200) {
        setShowGoToTop(true);
      } else {
        setShowGoToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Sorting songs ---
  // - Songs with a report come first.
  // - Then sorted by order if available; otherwise alphabetically by title.
  const sortedSongs = [...songs].sort((a, b) => {
    const aReported = reports.some((r) => r.lyricsId === a.id);
    const bReported = reports.some((r) => r.lyricsId === b.id);
    if (aReported && !bReported) return -1;
    if (!aReported && bReported) return 1;

    if (a.order != null && b.order != null) {
      return a.order - b.order;
    } else if (a.order != null) {
      return -1;
    } else if (b.order != null) {
      return 1;
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  // Filter songs by search input (title or tags)
  const filteredSongs = sortedSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchInput.toLowerCase()) ||
      (song.tags &&
        song.tags.some((tag) =>
          tag.toLowerCase().includes(searchInput.toLowerCase())
        ))
  );

  // --- Pagination: calculate the songs to display ---
  const paginatedSongs = filteredSongs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Check if any song (in the filtered list) has a report.
  const hasAnyReport = filteredSongs.some((song) =>
    reports.some((r) => r.lyricsId === song.id)
  );

  // --- Handlers ---
  const handleCollectionChange = (e) => {
    const newCollection = e.target.value;
    setSelectedCollection(newCollection);
    navigate(`/list-song/${newCollection}`);
  };

  // CSV Export
  const exportData = () => {
    const exportData = songs.map((song) => ({
      Title: song.title,
      Artist: song.artist,
      Tags: song.tags ? song.tags.join(", ") : "",
      Order: song.order,
      YouTube: song.youtube,
      Content: song.content,
    }));
    const csv = Papa.unparse({
      fields: ["Title", "Artist", "Tags", "Order", "YouTube", "Content"],
      data: exportData,
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${selectedCollection}-songs-export-${Date.now()}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import with progress
  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMessage("Starting import...");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const collectionRef = firestore.collection(selectedCollection);
          const incomingSongs = results.data;
          let successCount = 0;
          for (let i = 0; i < incomingSongs.length; i++) {
            const row = incomingSongs[i];
            setImportMessage(`Importing: ${row.Title}`);
            const existing = await collectionRef
              .where("title", "==", row.Title)
              .where("artist", "==", row.Artist)
              .get();
            if (existing.empty) {
              await collectionRef.add({
                title: row.Title,
                artist: row.Artist,
                tags:
                  row.Tags?.split(",")
                    .map((tag) => tag.trim().toLowerCase()) || [],
                order: row.Order ? Number(row.Order) : null,
                youtube: row.YouTube,
                publishDate: firebase.firestore.Timestamp.now(),
                content: row.Content,
              });
              successCount++;
            }
          }
          setImportMessage(`Successfully imported ${successCount} song(s).`);
          await fetchDynamicData();
          setSnackbarOpen(true);
        } catch (error) {
          console.error("Error during import:", error);
          setImportMessage("Error during import. Please try again.");
          setSnackbarOpen(true);
        } finally {
          setImporting(false);
        }
      },
      error: (err) => {
        console.error("CSV parsing error:", err);
        setImportMessage("Error parsing CSV file. Please check the file format.");
        alert("Error parsing CSV file. Please check the file format.");
        setImporting(false);
      },
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Delete song handlers
  const handleDeleteClick = (id) => {
    setSelectedSongIds([id]);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const batch = firestore.batch();
      selectedSongIds.forEach((id) => {
        const docRef = firestore.collection(selectedCollection).doc(id);
        batch.delete(docRef);
      });
      await batch.commit();

      setSongs((prev) =>
        prev.filter((song) => !selectedSongIds.includes(song.id))
      );
      setSelectedSongIds([]);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting documents:", error);
      alert("Error deleting the song. Please try again.");
    }
  };

  // Report resolution
  const handleResolveClick = (reportId) => {
    setResolveReportId(reportId);
    setResolveDialogOpen(true);
  };

  const confirmResolve = async () => {
    try {
      await firestore.collection("reports").doc(resolveReportId).delete();
      setReports((prev) =>
        prev.filter((report) => report.id !== resolveReportId)
      );
      setResolveDialogOpen(false);
    } catch (error) {
      console.error("Error resolving report:", error);
    }
  };

  // Open the song form dialog for editing
  const handleEditClick = (song) => {
    setSongFormMode("edit");
    setSongFormInitialData(song);
    setSongFormOpen(true);
  };

  // Open the song form dialog for a new song
  const handleAddNewClick = () => {
    setSongFormMode("new");
    setSongFormInitialData(null);
    setSongFormOpen(true);
  };

  // After form submission (either add or edit), refresh the list.
  const handleFormSubmit = async (data, mode) => {
    try {
      let collectionRef;
      if (selectedCollection === "lyrics") {
        collectionRef = firestore.collection("lyrics");
      } else {
        const coll = collectionList.find((c) => c.name === selectedCollection);
        if (!coll) return;
        collectionRef = firestore.collection(coll.name);
      }
      if (mode === "new") {
        // (Optional) Check if title already exists across collections…
        const collectionsSnapshot = await firestore.collection("collections").get();
        let titleExists = false;
        for (const doc of collectionsSnapshot.docs) {
          const collName = doc.data().name;
          const qs = await firestore
            .collection(collName)
            .where("title", "==", data.title)
            .get();
          if (!qs.empty) {
            titleExists = true;
            break;
          }
        }
        if (titleExists) {
          alert("A song with this title already exists in another collection.");
          return;
        }
        await collectionRef.add(data);
      } else if (mode === "edit") {
        await collectionRef.doc(data.id).update(data);
      }
      setSongFormOpen(false);
      await fetchDynamicData();
    } catch (error) {
      console.error("Error in form submission:", error);
      alert("Error submitting the form.");
    }
  };

  // Handlers for TablePagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Song Management
        </Typography>
      </Box>

      {/* Top Controls */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          alignItems: "center",
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Collection</InputLabel>
          <Select
            value={selectedCollection}
            onChange={handleCollectionChange}
            label="Collection"
          >
            {collectionList
              .sort((a, b) => a.numbering - b.numbering)
              .map((coll) => (
                <MenuItem key={coll.id} value={coll.name}>
                  {coll.name.charAt(0).toUpperCase() + coll.name.slice(1)}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <TextField
          label="Search songs or tags"
          variant="outlined"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(0);
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />

        <Button variant="contained" startIcon={<Save />} onClick={exportData}>
          Export Songs
        </Button>
        <Button
          variant="contained"
          component="label"
          startIcon={<FileUpload />}
        >
          Import Songs
          <input type="file" accept=".csv" hidden onChange={handleImport} />
        </Button>
        <Button variant="contained" startIcon={<Add />} onClick={handleAddNewClick}>
          Add New Song
        </Button>
        {selectedSongIds.length > 0 && (
          <Button
            variant="contained"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Selected ({selectedSongIds.length})
          </Button>
        )}
      </Box>

      {/* Optionally display a loading indicator */}
      {importing && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            {importMessage}
          </Typography>
        </Box>
      )}

      {/* Table with horizontal scroll */}
      <Box sx={{ overflowX: "auto" }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedSongIds.length > 0 &&
                      selectedSongIds.length < paginatedSongs.length
                    }
                    checked={
                      paginatedSongs.length > 0 &&
                      selectedSongIds.length === paginatedSongs.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                {hasAnyReport && <TableCell>Report Text</TableCell>}
                <TableCell>Order</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSongs.map((song) => {
                const report = reports.find((r) => r.lyricsId === song.id);
                const isItemSelected = selectedSongIds.includes(song.id);
                return (
                  <TableRow
                    key={song.id}
                    sx={{
                      backgroundColor: report
                        ? "rgba(255,0,0,0.1)"
                        : "inherit",
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={() => handleSelectSong(song.id)}
                      />
                    </TableCell>
                    {hasAnyReport && (
                      <TableCell>
                        {report ? report.reportText || "—" : "—"}
                      </TableCell>
                    )}
                    <TableCell>{song.order != null ? song.order : "—"}</TableCell>
                    <TableCell>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          maxWidth: "200px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {song.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: "150px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {song.tags ? song.tags.join(", ") : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleEditClick(song)}
                      >
                        Edit
                      </Button>
                      <IconButton onClick={() => handleDeleteClick(song.id)}>
                        <Delete />
                      </IconButton>
                      {report && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleResolveClick(report.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* TablePagination below the table */}
      <TablePagination
        rowsPerPageOptions={[
          5,
          10,
          25,
          { label: "All", value: filteredSongs.length },
        ]}
        component="div"
        count={filteredSongs.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Song Form Dialog */}
      {songFormOpen && (
        <SongFormDialog
          open={songFormOpen}
          onClose={() => setSongFormOpen(false)}
          mode={songFormMode}
          initialData={songFormInitialData}
          collectionName={selectedCollection}
          collectionList={collectionList}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this song?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resolve Confirmation Dialog */}
      <Dialog
        open={resolveDialogOpen}
        onClose={() => setResolveDialogOpen(false)}
      >
        <DialogTitle>Confirm Resolve</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark this report as resolved?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmResolve}>
            Resolve
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={importMessage.includes("Error") ? "error" : "success"} sx={{ width: '100%' }}>
          {importMessage}
        </Alert>
      </Snackbar>

      {showGoToTop && (
        <Fab
          color="primary"
          size="small"
          onClick={scrollToTop}
          sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}
        >
          <ArrowUpward />
        </Fab>
      )}
    </Container>
  );
};

export default SongList;
