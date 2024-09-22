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

const CollectionForm = () => {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const snapshot = await firestore.collection("collections").get();
      const collectionList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCollections(collectionList);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!name || !displayName) {
        setError("Please fill in all fields.");
        return;
      }

      const collectionData = {
        name,
        displayName,
      };

      await firestore.collection("collections").add(collectionData);
      console.log("Collection added successfully.");
      setSnackbarOpen(true); // Show snackbar on success

      setName("");
      setDisplayName("");
      setError(null);

      fetchCollections(); // Reload data after submission
    } catch (error) {
      console.error("Error adding collection:", error);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      try {
        await firestore.collection("collections").doc(collectionId).delete();
        console.log("Collection deleted with ID:", collectionId);
        fetchCollections(); // Reload data after deletion
      } catch (error) {
        console.error("Error deleting collection:", error);
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Create New Collection
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={name}
          onChange={handleNameChange}
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

        <Button variant="contained" color="primary" type="submit">
          Submit
        </Button>
      </form>

      <Typography variant="h6" sx={{ mt: 4 }}>
        Collections:
      </Typography>
      <List>
        {collections.map((collection) => (
          <ListItem key={collection.id}>
            <ListItemText primary={collection.name} secondary={collection.displayName} />
            <ListItemSecondaryAction>
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
        message="Collection added successfully!"
      />
    </Box>
  );
};

export default CollectionForm;
