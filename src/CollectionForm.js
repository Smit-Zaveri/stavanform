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
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const CollectionForm = () => {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [numbering, setNumber] = useState("");
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const snapshot = await firestore.collection("collections").orderBy("numbering").get();
      const collectionList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCollections(collectionList);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!name || !displayName || !numbering) {
        setError("Please fill in all fields.");
        return;
      }

      const collectionData = {
        name,
        displayName,
        numbering: parseInt(numbering, 10),
      };

      if (editingId) {
        // Update existing collection
        await firestore.collection("collections").doc(editingId).update(collectionData);
        setSnackbarMessage("Collection updated successfully.");
      } else {
        // Add new collection
        await firestore.collection("collections").add(collectionData);
        setSnackbarMessage("Collection added successfully.");
      }

      setSnackbarOpen(true); // Show snackbar on success

      resetForm();
      fetchCollections(); // Reload data after submission
    } catch (error) {
      console.error("Error adding/updating collection:", error);
    }
  };

  const handleEditCollection = (collection) => {
    setEditingId(collection.id);
    setName(collection.name);
    setDisplayName(collection.displayName);
    setNumber(collection.numbering);
  };

  const handleDeleteCollection = async (collectionId) => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      try {
        await firestore.collection("collections").doc(collectionId).delete();
        setSnackbarMessage("Collection deleted successfully.");
        setSnackbarOpen(true);
        fetchCollections(); // Reload data after deletion
      } catch (error) {
        console.error("Error deleting collection:", error);
      }
    }
  };

  const resetForm = () => {
    setName("");
    setDisplayName("");
    setNumber("");
    setEditingId(null);
    setError(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {editingId ? "Edit Collection" : "Create New Collection"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!error}
          helperText={error && "Please fill in this field."}
        />
        <TextField
          label="Display Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={!!error}
          helperText={error && "Please fill in this field."}
        />
        <TextField
          label="Number"
          variant="outlined"
          fullWidth
          margin="normal"
          value={numbering}
          onChange={(e) => setNumber(e.target.value)}
          error={!!error}
          helperText={error && "Please fill in this field."}
        />

        <Button variant="contained" color="primary" type="submit">
          {editingId ? "Update Collection" : "Submit"}
        </Button>
        {editingId && (
          <Button variant="outlined" color="secondary" onClick={resetForm} sx={{ ml: 2 }}>
            Cancel Edit
          </Button>
        )}
      </form>

      <Typography variant="h6" sx={{ mt: 4 }}>
        Collections:
      </Typography>
      <List>
        {collections.map((collection) => (
          <ListItem key={collection.id}>
            <ListItemText
              primary={`#${collection.numbering} - ${collection.name}`}
              secondary={collection.displayName}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleEditCollection(collection)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" onClick={() => handleDeleteCollection(collection.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default CollectionForm;
