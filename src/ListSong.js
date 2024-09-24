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
  Card,
  CardContent,
  CardActions,
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
  width: "80%",
  maxWidth: 600,
  maxHeight: "80%",
  overflowY: "auto",
};

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
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

        const songsData = songSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const artistList = artistSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const reportList = reportSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const collectionList = collectionSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSongs(songsData);
        setArtistOptions(artistList);
        setReports(reportList);
        setCollectionList(collectionList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedCollection]);

  useEffect(() => {
    const performSearch = () => {
      const searchTerm = searchInput.toLowerCase();
      const filteredSongs = songs.filter((song) => {
        const { title, tags } = song;
        return (
          title.toLowerCase().includes(searchTerm) ||
          tags.some((tag) => tag.toLowerCase().includes(searchTerm))
        );
      });
      setSearchResults(filteredSongs);
    };

    performSearch();
  }, [searchInput, songs]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this song?")) {
      try {
        await firestore.collection(selectedCollection).doc(id).delete();
        setSongs(songs.filter((song) => song.id !== id));
        console.log("Document deleted with ID:", id);
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    }
  };

  const handleEditClick = (song) => {
    setEditId(song.id);
    setEditTitle(song.title);
    setEditArtist(song.artist);
    setEditTags(song.tags.join(", "));
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
    setEditTags("");
    setEditYoutubeLink("");
    setEditContent("");
  };

  const handleResolveReport = async (reportId) => {
    if (window.confirm("Are you sure you want to resolve this report?")) {
      try {
        // Delete the report from Firestore
        await firestore.collection("reports").doc(reportId).delete();
        
        // Optionally refresh the reports state
        const reportSnapshot = await firestore.collection("reports").get();
        const reportList = reportSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(reportList);
  
        console.log("Report resolved with ID:", reportId);
      } catch (error) {
        console.error("Error resolving report:", error);
      }
    }
  };
  

  const handleEdit = async (id) => {
    if (!editTitle || !editContent) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      await firestore.collection(selectedCollection).doc(id).update({
        title: editTitle,
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
    <Container maxWidth="m" sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        Song List
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              displayEmpty
              inputProps={{ "aria-label": "Select Collection" }}
              sx={{
                bgcolor: "background.paper",
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              <MenuItem value="lyrics">
                <em>Lyrics</em>
              </MenuItem>
              {collectionList.map((collection) => (
                <MenuItem key={collection.id} value={collection.name}>
                  {collection.name.charAt(0).toUpperCase() +
                    collection.name.slice(1)}
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
            sx={{
              bgcolor: "background.paper",
              borderRadius: 1,
              boxShadow: 1,
            }}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ marginTop: 3 }}>
  {(searchResults.length > 0 ? searchResults : songs).map((song) => {
    // Find the report associated with the current song
    const report = reports.find(
      (report) =>
        report.lyricsId === song.id && report.lyricsTitle === song.title
    );

    return (
      <Grid item xs={12} sm={6} md={4} key={song.id}>
        <Card
          sx={{
            bgcolor: report ? "rgba(255, 0, 0, 0.1)" : "white",
            border: report ? "1px solid red" : "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: 2,
            boxShadow: 3,
            transition: "transform 0.2s",
            "&:hover": {
              transform: "scale(1.02)",
            },
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
                color="error"
                sx={{ mt: 1 }}
              >
                {`Report: ${report.reportText}`}
              </Typography>
            )}
          </CardContent>
          <CardActions>
            <Button
              size="small"
              color="primary"
              onClick={() => handleEditClick(song)}
              startIcon={<Edit />}
            >
              Edit
            </Button>
            <Button
              size="small"
              sx={{
                color: '#fff',
                backgroundColor:'#FF0033',
                '&:hover': {
                  backgroundColor: '#FF0033', // replace with your desired color
                },
              }} 
              onClick={() => handleDelete(song.id)}
              startIcon={<Delete />}
            >
              Delete
            </Button>
            {report && (
              <Button
                size="small"
                sx={{
                  color: '#fff',
                  backgroundColor:'#4BB543',
                  '&:hover': {
                    backgroundColor: '#4BB543', // replace with your desired color
                  },
                }}                
                onClick={() => handleResolveReport(report.id)} // Assuming report has an id
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


      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
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
            <FormControl fullWidth margin="normal">
              <Select
                value={editArtist}
                onChange={(e) => setEditArtist(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {artistOptions.map((artist) => (
                  <MenuItem key={artist.id} value={artist.name}>
                    {artist.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Tags (comma separated)"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
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
              bgcolor: "background.paper",
              borderRadius: 1,
              boxShadow: 1,
            }}
          />
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleEdit(editId)}
              sx={{  mr: 2, mt: 2 }}
            >
              Save Changes
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleCloseModal()}
              sx={{ mt: 2 }}
            >
              Close Model
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default SongList;
