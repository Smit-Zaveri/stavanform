import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { firestore } from "./firebase";
import { useLocation, useNavigate } from "react-router-dom";

const ArtistForm = () => {
  const [name, setName] = useState("");
  const [pictureUrl, setPictureUrl] = useState("");
  const [numbering, setNumber] = useState(""); // State for artist number
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState(null);
  const [editingArtistId, setEditingArtistId] = useState(null); // State for tracking the artist being edited
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Prefill the artist name if passed through state (from previous form)
    if (location.state && location.state.name) {
      setName(location.state.name);
    }
  }, [location.state]);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const snapshot = await firestore.collection("artists").orderBy("numbering").get();
      const artistList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setArtists(artistList);
    } catch (error) {
      console.error("Error fetching artists:", error);
    }
  };

  // Consolidated submit function to handle both add and edit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!name || !numbering) {
        setError("Please fill in all fields.");
        return;
      }

      const artistData = {
        name,
        picture: pictureUrl,
        numbering, // Save artist number
      };

      if (editingArtistId) {
        // If editing, update the artist
        await firestore.collection("artists").doc(editingArtistId).update(artistData);
        setSnackbarMessage("Artist updated successfully.");
      } else {
        // If not editing, add a new artist
        await firestore.collection("artists").add(artistData);
        setSnackbarMessage("Artist added successfully.");
      }

      setSnackbarOpen(true);
      resetForm();
      fetchArtists();
      setTimeout(() => {
        navigate(-1); // Go back to the previous page
      }, 2000);
    } catch (error) {
      console.error("Error adding/updating artist:", error);
    }
  };

  const handleDeleteArtist = (artistId) => {
    setConfirmDeleteId(artistId);
  };

  const confirmDelete = async () => {
    try {
      await firestore.collection("artists").doc(confirmDeleteId).delete();
      setSnackbarMessage("Artist deleted successfully.");
      setSnackbarOpen(true);
      setConfirmDeleteId(null);
      fetchArtists();
    } catch (error) {
      console.error("Error deleting artist:", error);
    }
  };

  const handleEditArtist = (artist) => {
    setEditingArtistId(artist.id);
    setName(artist.name);
    setPictureUrl(artist.picture);
    setNumber(artist.numbering); // Set number for editing
  };

  const resetForm = () => {
    setName("");
    setPictureUrl("");
    setNumber(""); // Reset the form inputs
    setEditingArtistId(null); // Reset editing state
    setError(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {editingArtistId ? "Edit Artist" : "Add Artist"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Picture URL"
          variant="outlined"
          fullWidth
          margin="normal"
          value={pictureUrl}
          onChange={(e) => setPictureUrl(e.target.value)}
        />
        <TextField
          label="Number"
          variant="outlined"
          fullWidth
          margin="normal"
          value={numbering}
          onChange={(e) => setNumber(e.target.value)}
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button variant="contained" color="primary" type="submit">
          {editingArtistId ? "Update Artist" : "Submit"}
        </Button>
        {editingArtistId && (
          <Button onClick={resetForm} color="secondary" sx={{ ml: 2 }}>
            Cancel Edit
          </Button>
        )}
      </form>

      <List>
        {artists.map((artist) => (
          <ListItem key={artist.id}>
            <ListItemText
              primary={`#${artist.numbering} - ${artist.name}`} // Display artist number and name
            />
            <ListItemSecondaryAction>
              <IconButton onClick={() => handleEditArtist(artist)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDeleteArtist(artist.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this artist?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmDelete} color="primary">
            Confirm
          </Button>
          <Button onClick={() => setConfirmDeleteId(null)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default ArtistForm;
