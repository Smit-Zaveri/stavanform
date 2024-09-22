import React, { useState, useEffect } from "react";
import { firestore } from "./firebase";
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ArtistForm = () => {
  const [name, setName] = useState("");
  const [pictureUrl, setPictureUrl] = useState("");
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState(null);
  const [editingArtistId, setEditingArtistId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingPictureUrl, setEditingPictureUrl] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const snapshot = await firestore.collection("artists").get();
      const artistList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setArtists(artistList);
    } catch (error) {
      console.error("Error fetching artists:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!name || !pictureUrl) {
        setError("Please fill in all fields.");
        return;
      }

      const artistData = {
        name,
        picture: pictureUrl,
      };

      await firestore.collection("artists").add(artistData);
      setSnackbarMessage("Artist added successfully.");
      setSnackbarOpen(true);
      resetForm();
      fetchArtists();
    } catch (error) {
      console.error("Error adding artist:", error);
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
    setEditingName(artist.name);
    setEditingPictureUrl(artist.picture);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editingName || !editingPictureUrl) {
        setError("Please fill in all fields.");
        return;
      }

      const artistData = {
        name: editingName,
        picture: editingPictureUrl,
      };

      await firestore.collection("artists").doc(editingArtistId).update(artistData);
      setSnackbarMessage("Artist updated successfully.");
      setSnackbarOpen(true);
      resetEditForm();
      fetchArtists();
    } catch (error) {
      console.error("Error updating artist:", error);
    }
  };

  const resetForm = () => {
    setName("");
    setPictureUrl("");
    setError(null);
  };

  const resetEditForm = () => {
    setEditingArtistId(null);
    setEditingName("");
    setEditingPictureUrl("");
    setError(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Manage Artists
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
        {error && <Typography color="error">{error}</Typography>}
        <Button variant="contained" color="primary" type="submit">
          Submit
        </Button>
      </form>

      <List>
        {artists.map((artist) => (
          <ListItem key={artist.id}>
            {editingArtistId === artist.id ? (
              <>
                <TextField
                  label="Name"
                  variant="outlined"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <TextField
                  label="Picture URL"
                  variant="outlined"
                  value={editingPictureUrl}
                  onChange={(e) => setEditingPictureUrl(e.target.value)}
                />
                <Button onClick={handleSaveEdit} color="primary">
                  Save
                </Button>
                <Button onClick={resetEditForm} color="secondary">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <ListItemText primary={artist.name} />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleEditArtist(artist)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteArtist(artist.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </>
            )}
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
