import { Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  FormControl,
  MenuItem,
  Autocomplete,
  Modal,
  Select,
  TextField,
  Typography,
  useTheme,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import React, { useEffect, useState } from "react";
import { firestore } from "./firebase";
import { useNavigate } from "react-router-dom";

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

const SongList = () => {
  const theme = useTheme();
  const [songs, setSongs] = useState([]);
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editOrder, setEditOrder] = useState("");
  const [artistOptions, setArtistOptions] = useState([]);
  const [editArtist, setEditArtist] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editYoutubeLink, setEditYoutubeLink] = useState("");
  const [editContent, setEditContent] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("lyrics");
  const [collectionList, setCollectionList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newArtist, setNewArtist] = useState("");
  const [openArtistDialog, setOpenArtistDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // For delete confirmation
  const [openResolveDialog, setOpenResolveDialog] = useState(false); // For resolve confirmation
  const [deleteId, setDeleteId] = useState(""); // ID of the song to delete
  const [resolveReportId, setResolveReportId] = useState(""); // ID of the report to resolve
  const navigate = useNavigate();

  const handleConfirmNewArtist = () => {
    setOpenArtistDialog(false);
    navigate(`/artist-form`, { state: { name: newArtist } });
  };

  const handleArtistInputBlur = () => {
    if (editArtist && !artistOptions.some((option) => option.name === editArtist)) {
      setNewArtist(editArtist);
      setOpenArtistDialog(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          songSnapshot,
          artistSnapshot,
          reportSnapshot,
          collectionSnapshot,
        ] = await Promise.all([
          firestore.collection(selectedCollection).get(),
          firestore.collection("artists").get(),
          firestore.collection("reports").get(),
          firestore.collection("collections").get(),
        ]);

        setSongs(songSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setArtistOptions(artistSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setReports(reportSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setCollectionList(collectionSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedCollection]);

  useEffect(() => {
    const performSearch = () => {
      const searchTerm = searchInput.toLowerCase();
      const filteredSongs = songs.filter((song) =>
        song.title.toLowerCase().includes(searchTerm) ||
        song.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
      setSearchResults(filteredSongs);
    };

    performSearch();
  }, [searchInput, songs]);

  const sortedSongs = (searchResults.length > 0 ? searchResults : songs).sort((a, b) => {
    const aHasReport = reports.some((report) => report.lyricsId === a.id);
    const bHasReport = reports.some((report) => report.lyricsId === b.id);
    return aHasReport === bHasReport ? 0 : aHasReport ? -1 : 1;
  });

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await firestore.collection(selectedCollection).doc(deleteId).delete();
      setSongs((prevSongs) => prevSongs.filter((song) => song.id !== deleteId));
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleResolveClick = (reportId) => {
    setResolveReportId(reportId);
    setOpenResolveDialog(true);
  };

  const handleConfirmResolve = async () => {
    try {
      await firestore.collection("reports").doc(resolveReportId).delete();
      setReports((prevReports) => prevReports.filter((report) => report.id !== resolveReportId));
      setOpenResolveDialog(false);
    } catch (error) {
      console.error("Error resolving report:", error);
    }
  };

  const handleEditClick = (song) => {
    setEditId(song.id);
    setEditTitle(song.title);
    setEditArtist(song.artist);
    setEditTags(song.tags.join(", "));
    setEditOrder(song.order);
    setEditYoutubeLink(song.youtube);
    setEditContent(song.content);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    resetEditFields();
  };

  const resetEditFields = () => {
    setEditId("");
    setEditTitle("");
    setEditArtist("");
    setEditOrder("");
    setEditTags("");
    setEditYoutubeLink("");
    setEditContent("");
  };

  const handleEdit = async (id) => {
    if (!editTitle || !editContent) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      await firestore
        .collection(selectedCollection)
        .doc(id)
        .update({
          title: editTitle,
          artist: editArtist,
          tags: editTags.split(",").map((tag) => tag.trim().toLowerCase()),
          order: Number(editOrder),
          content: editContent,
          youtube: editYoutubeLink,
        });
      console.log("Document updated with ID:", id);
      handleCloseModal();
      const snapshot = await firestore.collection(selectedCollection).get();
      const songsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSongs(songsData);
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        Song List
      </Typography>
      <Grid
        container
        spacing={{ xs: 1, md: 2 }}
        columns={{ xs: 1, sm: 12, md: 12 }}
      >
        <Grid size={{ xs: 1, sm: 6, md: 6 }}>
          <FormControl fullWidth>
            <Select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              displayEmpty
              inputProps={{ "aria-label": "Select Collection" }}
              sx={{ bgcolor: theme.palette.background.paper, borderRadius: 1, boxShadow: 1 }}
            >
              <MenuItem value="lyrics">
                <em>Lyrics</em>
              </MenuItem>
              {collectionList.map((collection) => (
                <MenuItem key={collection.id} value={collection.name}>
                  {collection.name.charAt(0).toUpperCase() + collection.name.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 1, sm: 6, md: 6 }}>
          <TextField
            fullWidth
            label="Search Songs"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ bgcolor: theme.palette.background.paper, borderRadius: 1, boxShadow: 1 }}
          />
        </Grid>
      </Grid>

      <Grid
        sx={{ marginTop: 4 }}
        container
        spacing={{ xs: 1, md: 2 }}
        columns={{ xs: 1, sm: 8, md: 12 }}
      >
        {sortedSongs.map((song) => {
          const report = reports.find((report) => report.lyricsId === song.id);
          return (
            <Grid  size={{ xs: 1, sm: 4, md: 4 }} key={song.id}>
              <Card
                sx={{
                  bgcolor: report ? "rgba(255, 0, 0, 0.1)" : theme.palette.background.paper,
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
                  position: "relative",
                  overflow: "visible",
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    {song.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {`Artist: ${song.artist} | Tags: ${song.tags.join(", ")}`}
                  </Typography>
                  {report && (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        color: theme.palette.error.main,
                        fontWeight: "bold",
                      }}
                    >
                      {`Report: ${report.reportText}`}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditClick(song)}
                    sx={{
                      bgcolor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
                      "&:hover": {
                        bgcolor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    <Edit />
                  </IconButton>

                  {report && (
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      onClick={() => handleResolveClick(report.id)}
                    >
                      Resolve Report
                    </Button>
                  )}
                </CardActions>

                {/* Delete button positioned at bottom-right corner */}
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(song.id)}
                  sx={{
                    bgcolor: theme.palette.error.main,
                    color: "#fff",
                    "&:hover": {
                      bgcolor: theme.palette.error.dark,
                    },
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    boxShadow: 3,
                  }}
                >
                  <Delete />
                </IconButton>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit Modal */}
      <Modal open={openModal} onClose={handleCloseModal} sx={modalStyle}>
        <Box sx={contentStyle}>
          <Typography variant="h6" gutterBottom>
            Edit Song
          </Typography>
          <TextField
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Autocomplete
            freeSolo
            options={artistOptions.map((option) => option.name)}
            value={editArtist}
            onInputChange={(event, newValue) => setEditArtist(newValue)}
            onBlur={handleArtistInputBlur}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Artist"
                variant="outlined"
                margin="normal"
                fullWidth
              />
            )}
          />
          <TextField
            label="Tags (comma separated)"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Order"
            value={editOrder}
            onChange={(e) => setEditOrder(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="YouTube Link"
            value={editYoutubeLink}
            onChange={(e) => setEditYoutubeLink(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            fullWidth
            label="Content"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            multiline
            rows={4}
            margin="normal"
            sx={{
              bgcolor: theme.palette.background.paper,
              borderRadius: 1,
              boxShadow: 1,
            }}
          />
          <Box sx={{ textAlign: "right" }}>
            <Button
              color="primary"
              variant="contained"
              onClick={() => handleEdit(editId)}
            >
              Save
            </Button>
            <Button color="secondary" onClick={handleCloseModal} sx={{ ml: 1 }}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Dialog for Adding New Artist */}
      <Dialog open={openArtistDialog} onClose={() => setOpenArtistDialog(false)}>
        <DialogTitle>Confirm New Artist</DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to add "{newArtist}" as a new artist?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenArtistDialog(false)}>Cancel</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handleConfirmNewArtist}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this song?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resolve Report Confirmation Dialog */}
      <Dialog
        open={openResolveDialog}
        onClose={() => setOpenResolveDialog(false)}
      >
        <DialogTitle>Confirm Resolve Report</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to resolve this report?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResolveDialog(false)}>Cancel</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handleConfirmResolve}
          >
            Resolve
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SongList;
