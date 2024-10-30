import { Delete, Edit } from "@mui/icons-material";
import { useParams } from "react-router-dom";
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
  Pagination,
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
  const { collectionName  } = useParams();
  const [selectedCollection, setSelectedCollection] = useState(collectionName || "lyrics");
  const [collectionList, setCollectionList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newArtist, setNewArtist] = useState("");
  const [openArtistDialog, setOpenArtistDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openResolveDialog, setOpenResolveDialog] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [resolveReportId, setResolveReportId] = useState("");
  const [page, setPage] = useState(1); // Current page for pagination
  const itemsPerPage = 10; // Number of songs per page
  const navigate = useNavigate();

  useEffect(() => {
    if (collectionName && collectionName !== selectedCollection) {
      setSelectedCollection(collectionName); // Update based on URL param
    }
  }, [collectionName, selectedCollection]);

  const handleCollectionChange = (e) => {
    const newCollection = e.target.value;
    setSelectedCollection(newCollection);
    navigate(`/list-song/${newCollection}`);
  };

  const handleConfirmNewArtist = () => {
    setOpenArtistDialog(false);
    navigate(`/artist-form`, { state: { name: newArtist } });
  };

  const handleArtistInputBlur = () => {
    if (
      editArtist &&
      !artistOptions.some((option) => option.name === editArtist)
    ) {
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

        setSongs(
          songSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setArtistOptions(
          artistSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setReports(
          reportSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setCollectionList(
          collectionSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedCollection]);

  useEffect(() => {
    const performSearch = () => {
      const searchTerm = searchInput.toLowerCase();
      const filteredSongs = songs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchTerm) ||
          song.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
      setSearchResults(filteredSongs);
    };

    performSearch();
  }, [searchInput, songs]);

  const sortedSongs = (searchResults.length > 0 ? searchResults : songs).sort(
    (a, b) => {
      const aHasReport = reports.some((report) => report.lyricsId === a.id);
      const bHasReport = reports.some((report) => report.lyricsId === b.id);
      return aHasReport === bHasReport ? 0 : aHasReport ? -1 : 1;
    }
  );

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
      setReports((prevReports) =>
        prevReports.filter((report) => report.id !== resolveReportId)
      );
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

  // Calculate pagination data
  const totalPages = Math.ceil(sortedSongs.length / itemsPerPage);
  const paginatedSongs = sortedSongs.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

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
        onChange={handleCollectionChange}
        displayEmpty
        inputProps={{ "aria-label": "Select Collection" }}
        sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        {collectionList
          .sort((a, b) => a.numbering - b.numbering)
          .map((collection) => (
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
            label="Search"
            variant="outlined"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </Grid>
      </Grid>
      <Box mt={2}>
        <Grid container spacing={2}>
          {paginatedSongs.map((song) => {
            const isReported = reports.some(
              (report) => report.lyricsId === song.id
            );
            return (
              <Grid item xs={12} sm={6} md={6} key={song.id}>
                <Card sx={isReported ? reportedCardStyle : {}}>
                  <CardContent>
                    <Typography variant="h5">{song.title}</Typography>
                    <Typography variant="subtitle1">
                      Artist: {song.artist}
                    </Typography>
                    <Typography variant="body2">
                      Tags: {song.tags.join(", ")}
                    </Typography>
                    <Typography variant="body2">
                      YouTube: {song.youtube}
                    </Typography>
                    {isReported && (
                      <Typography variant="body2" color="error">
                        Reported
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleEditClick(song)}
                    >
                      <Edit />
                    </Button>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDeleteClick(song.id)}
                    >
                      <Delete />
                    </IconButton>
                    {isReported && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          const report = reports.find(
                            (report) => report.lyricsId === song.id
                          );
                          if (report) {
                            handleResolveClick(report.id); // Pass the specific report.id here
                          } else {
                            console.error("No report found for this song.");
                          }
                        }}
                      >
                        Resolve
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
      <Box mt={4} display="flex" justifyContent="center">
        <Pagination
          count={totalPages}
          page={page}
          onChange={(event, value) => setPage(value)}
          color="primary"
        />
      </Box>

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
      <Dialog
        open={openArtistDialog}
        onClose={() => setOpenArtistDialog(false)}
      >
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
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
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
          <Typography>Are you sure you want to resolve this report?</Typography>
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

const reportedCardStyle = {
  border: "2px solid red",
  boxShadow: "0px 0px 10px rgba(255, 0, 0, 0.5)",
};

export default SongList;
