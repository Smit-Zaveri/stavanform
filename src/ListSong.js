import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import EditSongModal from "./EditSongModal";
import {
  Box,
  Button,
  Container,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Pagination,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete, FileUpload, Save } from "@mui/icons-material";
import Papa from "papaparse";
import { firestore } from "./firebase";

// Styles for modal dialogs
const modalStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  bgcolor: "rgba(0, 0, 0, 0.5)",
};

const contentStyle = {
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  width: "80%",
  maxWidth: 600,
  maxHeight: "80%",
  overflowY: "auto",
};

const itemsPerPage = 10;

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [artistOptions, setArtistOptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [collectionList, setCollectionList] = useState([]);
  const [openArtistDialog, setOpenArtistDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [resolveReportId, setResolveReportId] = useState("");
  const [formData, setFormData] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newArtist, setNewArtist] = useState("");

  const { collectionName } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

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

  // Filter, sort, and paginate songs
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchInput.toLowerCase()) ||
      song.tags.some((tag) =>
        tag.toLowerCase().includes(searchInput.toLowerCase())
      )
  );

  const sortedSongs = filteredSongs.sort((a, b) => {
    const aHasReport = reports.some((report) => report.lyricsId === a.id);
    const bHasReport = reports.some((report) => report.lyricsId === b.id);
    return aHasReport === bHasReport ? 0 : aHasReport ? -1 : 1;
  });

  const paginatedSongs = sortedSongs.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Change collection handler
  const handleCollectionChange = (e) => {
    const newCollection = e.target.value;
    setSelectedCollection(newCollection);
    navigate(`/list-song/${newCollection}`);
  };

  // Export songs data as CSV
  const exportData = () => {
    const exportData = songs.map((song) => ({
      Title: song.title,
      Artist: song.artist,
      Tags: song.tags.join(", "),
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

  // Import songs from CSV file
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
                order: Number(row.Order),
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
      setSongs((prevSongs) => prevSongs.filter((song) => song.id !== deleteId));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  // Report resolution handlers
  const handleResolveClick = (reportId) => {
    setResolveReportId(reportId);
    setResolveDialogOpen(true);
  };

  const confirmResolve = async () => {
    try {
      await firestore.collection("reports").doc(resolveReportId).delete();
      setReports((prevReports) =>
        prevReports.filter((report) => report.id !== resolveReportId)
      );
      setResolveDialogOpen(false);
    } catch (error) {
      console.error("Error resolving report:", error);
    }
  };

  // Edit song handlers
  const handleEditClick = (song) => {
    setFormData({
      id: song.id,
      title: song.title,
      artist: song.artist,
      tags: song.tags.join(", "),
      order: song.order,
      youtube: song.youtube,
      content: song.content,
    });
    setEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Check if the artist is new when the editor blurs
  const handleEditorBlur = () => {
    if (
      formData.artist &&
      !artistOptions.some((option) => option.name === formData.artist)
    ) {
      setNewArtist(formData.artist);
      setOpenArtistDialog(true);
    }
  };

  // Confirm adding a new artist; navigate to artist form
  const handleConfirmNewArtist = () => {
    setFormData((prev) => ({ ...prev, artist: newArtist }));
    navigate(`/artist-form`, { state: { name: newArtist } });
    setOpenArtistDialog(false);
  };

  // Save the edited song
  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await firestore
        .collection(selectedCollection)
        .doc(formData.id)
        .update({
          title: formData.title,
          artist: formData.artist,
          tags: formData.tags.split(",").map((tag) => tag.trim().toLowerCase()),
          order: Number(formData.order),
          content: formData.content,
          youtube: formData.youtube,
        });
      setEditModalOpen(false);
      await fetchDynamicData();
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Song Management
      </Typography>

      {/* Collection Select and Search Field */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 4,
          mb: 2,
          gap: 2,
        }}
      >
        <FormControl variant="outlined" sx={{ width: 200 }}>
          <Select value={selectedCollection} onChange={handleCollectionChange}>
            {collectionList
              .sort((a, b) => a.numbering - b.numbering)
              .map((collection) => (
                <MenuItem key={collection.id} value={collection.name}>
                  {collection.name.charAt(0).toUpperCase() +
                    collection.name.slice(1)}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <TextField
          label="Search songs or tags"
          variant="outlined"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
      </Box>

      {/* Export and Import Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<Save />}
          onClick={exportData}
        >
          Export Songs
        </Button>
        <Button
          variant="contained"
          component="label"
          color="primary"
          startIcon={<FileUpload />}
        >
          Import Songs
          <input type="file" accept=".csv" hidden onChange={handleImport} />
        </Button>
      </Box>

      {/* Songs Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 550 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Report</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSongs.map((song) => {
              const reported = reports.find(
                (report) => report.lyricsId === song.id
              );
              const isReported = Boolean(reported);
              const reportText = reported?.reportText || "No report";

              return (
                <TableRow
                  key={song.id}
                  sx={{
                    backgroundColor: isReported ? "#ffe6e6" : undefined,
                  }}
                >
                  <TableCell sx={{ color: isReported ? "#000" : undefined }}>
                    {song.title}
                  </TableCell>
                  <TableCell>{song.tags.join(", ")}</TableCell>
                  <TableCell sx={{ color: isReported ? "#000" : undefined }}>
                    {isReported ? reportText : "—"}
                  </TableCell>
                  <TableCell
                    sx={{ display: "flex", gap: 1, alignItems: "center" }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEditClick(song)}
                      size="small"
                    >
                      Edit
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(song.id)}
                    >
                      <Delete />
                    </IconButton>
                    {isReported && (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleResolveClick(reported.id)}
                        size="small"
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

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Pagination
          count={Math.ceil(sortedSongs.length / itemsPerPage)}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Edit Song Modal */}
      <EditSongModal
        editModalOpen={editModalOpen}
        setEditModalOpen={setEditModalOpen}
        formData={formData}
        handleInputChange={handleInputChange}
        artistOptions={artistOptions}
        handleEditorBlur={handleEditorBlur}
        handleSave={handleSave}
      />

      {/* Confirmation Dialog for New Artist */}
      <ConfirmationDialog
        open={openArtistDialog}
        onClose={() => setOpenArtistDialog(false)}
        onConfirm={handleConfirmNewArtist}
        title="Confirm New Artist"
        message={`Add "${newArtist}" as a new artist?`}
        confirmLabel="Add Artist"
      />

      {/* Confirmation Dialog for Delete Song */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this song?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
      />

      {/* Confirmation Dialog for Resolving Report */}
      <ConfirmationDialog
        open={resolveDialogOpen}
        onClose={() => setResolveDialogOpen(false)}
        onConfirm={confirmResolve}
        title="Confirm Resolve"
        message="Are you sure you want to mark this report as resolved?"
        confirmLabel="Resolve"
        cancelLabel="Cancel"
        confirmColor="error"
      />
    </Container>
  );
};

export default SongList;

// ConfirmationDialog Component
const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  confirmColor = "primary",
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ minWidth: 300, pt: 2, pb: 3 }}>
        {message}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button variant="text" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button variant="contained" color={confirmColor} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { ConfirmationDialog };
