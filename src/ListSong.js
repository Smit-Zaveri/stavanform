import React, { useState, useEffect } from "react";
import { firestore } from "./firebase";
import {
  Container,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Button,
  Typography,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Modal,
  Box,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

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
  width: "90%", // Width can be adjusted based on device
  maxWidth: 600,
  maxHeight: "80%", // Fixed height to allow scrolling
  overflowY: "auto", // Enable vertical scrolling
};

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [artistOptions, setArtistOptions] = useState([]);
  const [editNumbering, setEditNumbering] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editYoutubeLink, setEditYoutubeLink] = useState("");
  const [editContent, setEditContent] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('lyrics');
  const [collectionList, setCollectionList] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  // Fetch songs and reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const snapshot = await firestore.collection("reports").get();
        const reportsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(reportsData);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  // Fetch songs from selected collection
  useEffect(() => {
    const fetchSongs = async () => {
      if (!selectedCollection) return;
      try {
        const snapshot = await firestore.collection(selectedCollection).get();
        const songsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSongs(songsData);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };

    fetchSongs();
  }, [selectedCollection]);

  // Fetch artist options
  useEffect(() => {
    const fetchArtistOptions = async () => {
      try {
        const snapshot = await firestore.collection("artists").get();
        const artistList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setArtistOptions(artistList);
      } catch (error) {
        console.error("Error fetching artist options:", error);
      }
    };

    fetchArtistOptions();
  }, []);

  // Fetch collection list
  useEffect(() => {
    const fetchCollectionList = async () => {
      try {
        const snapshot = await firestore.collection("collections").get();
        const collectionList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCollectionList(collectionList);
      } catch (error) {
        console.error("Error fetching collection list:", error);
      }
    };

    fetchCollectionList();
  }, []);

  // Perform search
  useEffect(() => {
    const performSearch = () => {
      const searchTerm = searchInput.toLowerCase();
      const filteredSongs = songs.filter((song) => {
        const { title, numbering, tags } = song;
        const lowercaseNumbering = String(numbering).toLowerCase();
        return (
          title.toLowerCase().includes(searchTerm) ||
          lowercaseNumbering.includes(searchTerm) ||
          tags.some((tag) => tag.toLowerCase().includes(searchTerm))
        );
      });
      setSearchResults(filteredSongs);
    };

    performSearch();
  }, [searchInput, songs]);

  // Delete song
  const handleDelete = async (id) => {
    try {
      const confirmation = window.confirm(
        "Are you sure you want to delete this song?"
      );
      if (confirmation) {
        await firestore.collection(selectedCollection).doc(id).delete();
        setSongs(songs.filter((song) => song.id !== id));
        console.log("Document deleted with ID:", id);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleEditClick = (song) => {
    setEditId(song.id);
    setEditTitle(song.title);
    setEditNumbering(song.numbering);
    setEditArtist(song.artist);
    setEditTags(song.tags.join(", "));
    setEditYoutubeLink(song.youtube);
    setEditContent(song.content);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditId("");
    setEditTitle("");
    setEditNumbering("");
    setEditArtist("");
    setEditTags("");
    setEditYoutubeLink("");
    setEditContent("");
  };

  // Edit song
  const handleEdit = async (id) => {
    try {
      if (!editTitle || !editNumbering || !editTags || !editContent) {
        console.log("Form fields are empty. Cannot submit.");
        return;
      }
      await firestore
        .collection(selectedCollection)
        .doc(id)
        .update({
          title: editTitle,
          numbering: editNumbering,
          artist: editArtist,
          tags: editTags.split(",").map((tag) => tag.trim().toLowerCase()),
          content: editContent,
          youtube: editYoutubeLink,
        });

      console.log("Document updated with ID:", id);
      handleCloseModal();

      // Refresh the data
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
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Select Collection</InputLabel>
            <Select
      value={selectedCollection}
      onChange={(e) => setSelectedCollection(e.target.value)}
      label="Select Collection"
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
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Search Songs"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            margin="normal"
          />
        </Grid>
      </Grid>
      <List sx={{ marginTop: 3 }}>
        {searchResults.map((song) => (
          <ListItem
            key={song.id}
            sx={{
              bgcolor: reports.some(
                (report) =>
                  report.lyricsId === song.id &&
                  report.lyricsTitle === song.title
              )
                ? "rgba(255, 0, 0, 0.1)"
                : "transparent",
              marginBottom: 2,
              border: reports.some(
                (report) =>
                  report.lyricsId === song.id &&
                  report.lyricsTitle === song.title
              )
                ? "1px solid red"
                : "none",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.05)", // Hover effect
              },
            }}
          >
            <ListItemText
              primary={`Title: ${song.title}`}
              secondary={`Numbering: ${song.numbering} | Artist: ${
                song.artist
              } | Tags: ${song.tags.join(", ")}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleEditClick(song)}
              >
                <Edit />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDelete(song.id)}
              >
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* Edit Modal */}
      <Modal sx={modalStyle} open={openModal} onClose={handleCloseModal}>
        <Box sx={contentStyle}>
          <Typography variant="h6" component="h2">
            Edit Song
          </Typography>
          <TextField
            fullWidth
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Numbering"
            value={editNumbering}
            onChange={(e) => setEditNumbering(e.target.value)}
            margin="normal"
          />

          {/* Artist Selection */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Artist</InputLabel>
            <Select
              value={editArtist}
              onChange={(e) => setEditArtist(e.target.value)}
              label="Select Artist"
            >
              {artistOptions.map((artist) => (
                <MenuItem key={artist.id} value={artist.name}>
                  {artist.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Tags (comma separated)"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="YouTube Link"
            value={editYoutubeLink}
            onChange={(e) => setEditYoutubeLink(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Content"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            multiline
            minRows={3}
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleEdit(editId)}
            sx={{ mt: 2 }}
          >
            Save Changes
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default SongList;
