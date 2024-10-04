import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit"; // Import Edit Icon
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

const SuggestionForm = () => {
  const [suggestions, setsuggestions] = useState([]);
  const [suggestionName, setsuggestionName] = useState("");
  const [suggestionNumber, setsuggestionNumber] = useState(""); // State for suggestion number
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [editingsuggestionId, setEditingsuggestionId] = useState(null); // State for editing suggestion

  useEffect(() => {
    const fetchsuggestions = async () => {
      try {
        const snapshot = await firestore.collection("suggestions").orderBy("numbering").get();
        const fetchedsuggestions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setsuggestions(fetchedsuggestions);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    fetchsuggestions();
  }, []);

  // Handle both Add and Edit submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!suggestionName || !suggestionNumber) {
        console.log("Form fields are empty. Cannot submit.");
        return;
      }

      const suggestionData = {
        name: suggestionName.toLowerCase(),
        numbering: suggestionNumber, // Save number to suggestion data
      };

      if (editingsuggestionId) {
        // If editing, update the existing suggestion
        await firestore.collection("suggestions").doc(editingsuggestionId).update(suggestionData);
        setSnackbarMessage("suggestion updated successfully!");
      } else {
        // If adding a new suggestion
        const docRef = await firestore.collection("suggestions").add(suggestionData);
        setsuggestions([...suggestions, { id: docRef.id, name: suggestionName.toLowerCase(), numbering: suggestionNumber }]);
        setSnackbarMessage("suggestion added successfully!");
      }

      setSnackbarOpen(true);
      resetForm();
    } catch (error) {
      console.error("Error adding/updating suggestion:", error);
    }
  };

  const handleDelete = (suggestionId) => {
    setConfirmDeleteId(suggestionId);
  };

  const confirmDelete = async () => {
    try {
      await firestore.collection("suggestions").doc(confirmDeleteId).delete();
      console.log("suggestion deleted successfully");

      const updatedsuggestions = suggestions.filter((suggestion) => suggestion.id !== confirmDeleteId);
      setsuggestions(updatedsuggestions);
      setConfirmDeleteId(null);
      setSnackbarMessage("suggestion deleted successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting suggestion:", error);
    }
  };

  const handleEdit = (suggestion) => {
    setEditingsuggestionId(suggestion.id); // Set the ID of the suggestion being edited
    setsuggestionName(suggestion.name); // Set the name for editing
    setsuggestionNumber(suggestion.numbering); // Set the number for editing
  };

  const resetForm = () => {
    setsuggestionName("");
    setsuggestionNumber("");
    setEditingsuggestionId(null); // Clear editing state
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {editingsuggestionId ? "Edit suggestion" : "Add suggestion"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Suggestion Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={suggestionName}
          onChange={(e) => setsuggestionName(e.target.value)}
        />
        <TextField
          label="Suggestion Number"
          variant="outlined"
          fullWidth
          margin="normal"
          value={suggestionNumber}
          onChange={(e) => setsuggestionNumber(e.target.value)}
        />
        <Button variant="contained" color="primary" type="submit">
          {editingsuggestionId ? "Update Suggestion" : "Add Suggestion"}
        </Button>
        {editingsuggestionId && (
          <Button onClick={resetForm} color="secondary" sx={{ ml: 2 }}>
            Cancel Edit
          </Button>
        )}
      </form>

      <List>
        {suggestions.map((suggestion) => (
          <ListItem key={suggestion.id}>
            {/* Display the suggestion number along with the suggestion name */}
            <ListItemText primary={`${suggestion.numbering} - ${suggestion.name}`} />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleEdit(suggestion)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" onClick={() => handleDelete(suggestion.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={!!confirmDeleteId} onClose={cancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this suggestion?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmDelete} color="primary">
            Confirm
          </Button>
          <Button onClick={cancelDelete} color="secondary">
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

export default SuggestionForm;
