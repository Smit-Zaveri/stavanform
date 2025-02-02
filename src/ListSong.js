import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SongFormDialog } from "./SongFormDialog";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Snackbar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Delete, FileUpload, Save, Add } from "@mui/icons-material";
import Papa from "papaparse";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import { firestore } from "./firebase";

// Items per page for pagination
const itemsPerPage = 10;

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [artistOptions, setArtistOptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [collectionList, setCollectionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [page, setPage] = useState(1);
  const [songFormOpen, setSongFormOpen] = useState(false);
  const [songFormMode, setSongFormMode] = useState("new"); // "new" or "edit"
  const [songFormInitialData, setSongFormInitialData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [resolveReportId, setResolveReportId] = useState("");

  const navigate = useNavigate();
  const { collectionName } = useParams();

  // Fetch static data: artists and collections
  const fetchStaticData = useCallback(async () => {
    try {
      const artistSnapshot = await firestore.collection("artists").get();
      const collectionSnapshot = await firestore
        .collection("collections")
        .get();
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
      setReports(
        reportSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
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

  // --- Sorting songs ---
  // If both songs have an order, sort by order ascending.
  // If one has an order and the other does not, the one with order comes first.
  // If neither has order, sort alphabetically by title.
  const sortedSongs = [...songs].sort((a, b) => {
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

  // Then filter by search input (by title or tag)
  const filteredSongs = sortedSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchInput.toLowerCase()) ||
      (song.tags &&
        song.tags.some((tag) =>
          tag.toLowerCase().includes(searchInput.toLowerCase())
        ))
  );

  const paginatedSongs = filteredSongs.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
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
    link.setAttribute("download", `songs-export-${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const collectionRef = firestore.collection(selectedCollection);
          const incomingSongs = results.data;
          let successCount = 0;
          for (const row of incomingSongs) {
            const existing = await collectionRef
              .where("title", "==", row.Title)
              .where("artist", "==", row.Artist)
              .get();
            if (existing.empty) {
              await collectionRef.add({
                title: row.Title,
                artist: row.Artist,
                tags:
                  row.Tags?.split(",").map((tag) => tag.trim().toLowerCase()) ||
                  [],
                order: row.Order ? Number(row.Order) : null,
                youtube: row.YouTube,
                content: row.Content,
              });
              successCount++;
            }
          }
          if (successCount > 0) {
            alert(`Imported ${successCount} song(s) successfully.`);
            await fetchDynamicData();
          }
        } catch (error) {
          console.error("Error during import:", error);
          alert("An error occurred during import. Please try again.");
        }
      },
      error: (err) => {
        console.error("CSV parsing error:", err);
        alert("Error parsing CSV file. Please check the file format.");
      },
    });
  };

  // Delete song handlers
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await firestore.collection(selectedCollection).doc(deleteId).delete();
      setSongs((prev) => prev.filter((song) => song.id !== deleteId));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting document:", error);
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

  // Open the song form dialog in "edit" mode with the song’s data.
  const handleEditClick = (song) => {
    setSongFormMode("edit");
    setSongFormInitialData(song);
    setSongFormOpen(true);
  };

  // Open the song form dialog in "new" mode.
  const handleAddNewClick = () => {
    setSongFormMode("new");
    setSongFormInitialData(null);
    setSongFormOpen(true);
  };

  // After form submission (either add or edit) refresh the list.
  const handleFormSubmit = async (data, mode) => {
    try {
      let collectionRef;
      // Determine the collection reference.
      if (selectedCollection === "lyrics") {
        collectionRef = firestore.collection("lyrics");
      } else {
        const coll = collectionList.find((c) => c.name === selectedCollection);
        if (!coll) return;
        collectionRef = firestore.collection(coll.name);
      }
      if (mode === "new") {
        // (Optional) Check if title already exists across collections…
        const collectionsSnapshot = await firestore
          .collection("collections")
          .get();
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

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Song Management
        </Typography>
      </Box>

      {/* Top Controls */}
      <Box
        sx={{
          display: "flex",
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
          onChange={(e) => setSearchInput(e.target.value)}
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
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNewClick}
        >
          Add New Song
        </Button>
      </Box>

      {/* Songs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSongs.map((song) => (
              <TableRow key={song.id}>
                <TableCell>{song.order != null ? song.order : "—"}</TableCell>
                <TableCell>{song.title}</TableCell>
                <TableCell>{song.tags ? song.tags.join(", ") : "—"}</TableCell>
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
                  {reports.some((r) => r.lyricsId === song.id) && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        const rep = reports.find((r) => r.lyricsId === song.id);
                        handleResolveClick(rep.id);
                      }}
                    >
                      Resolve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Pagination
          count={Math.ceil(filteredSongs.length / itemsPerPage)}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Song Form Dialog (for new and edit) */}
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
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
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
    </Container>
  );
};

export default SongList;
