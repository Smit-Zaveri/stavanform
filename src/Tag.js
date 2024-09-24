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

const TagForm = () => {
  const [tags, setTags] = useState([]);
  const [tagName, setTagName] = useState("");
  const [tagNumber, setTagNumber] = useState(""); // State for tag number
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [editingTagId, setEditingTagId] = useState(null); // State for editing tag

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const snapshot = await firestore.collection("tags").orderBy("numbering").get();
        const fetchedTags = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTags(fetchedTags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();
  }, []);

  // Handle both Add and Edit submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!tagName || !tagNumber) {
        console.log("Form fields are empty. Cannot submit.");
        return;
      }

      const tagData = {
        name: tagName.toLowerCase(),
        numbering: tagNumber, // Save number to tag data
      };

      if (editingTagId) {
        // If editing, update the existing tag
        await firestore.collection("tags").doc(editingTagId).update(tagData);
        setSnackbarMessage("Tag updated successfully!");
      } else {
        // If adding a new tag
        const docRef = await firestore.collection("tags").add(tagData);
        setTags([...tags, { id: docRef.id, name: tagName.toLowerCase(), numbering: tagNumber }]);
        setSnackbarMessage("Tag added successfully!");
      }

      setSnackbarOpen(true);
      resetForm();
    } catch (error) {
      console.error("Error adding/updating tag:", error);
    }
  };

  const handleDelete = (tagId) => {
    setConfirmDeleteId(tagId);
  };

  const confirmDelete = async () => {
    try {
      await firestore.collection("tags").doc(confirmDeleteId).delete();
      console.log("Tag deleted successfully");

      const updatedTags = tags.filter((tag) => tag.id !== confirmDeleteId);
      setTags(updatedTags);
      setConfirmDeleteId(null);
      setSnackbarMessage("Tag deleted successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };

  const handleEdit = (tag) => {
    setEditingTagId(tag.id); // Set the ID of the tag being edited
    setTagName(tag.name); // Set the name for editing
    setTagNumber(tag.numbering); // Set the number for editing
  };

  const resetForm = () => {
    setTagName("");
    setTagNumber("");
    setEditingTagId(null); // Clear editing state
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
        {editingTagId ? "Edit Tag" : "Add Tag"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Tag Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
        />
        <TextField
          label="Tag Number"
          variant="outlined"
          fullWidth
          margin="normal"
          value={tagNumber}
          onChange={(e) => setTagNumber(e.target.value)}
        />
        <Button variant="contained" color="primary" type="submit">
          {editingTagId ? "Update Tag" : "Add Tag"}
        </Button>
        {editingTagId && (
          <Button onClick={resetForm} color="secondary" sx={{ ml: 2 }}>
            Cancel Edit
          </Button>
        )}
      </form>

      <List>
        {tags.map((tag) => (
          <ListItem key={tag.id}>
            {/* Display the tag number along with the tag name */}
            <ListItemText primary={`${tag.numbering} - ${tag.name}`} />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleEdit(tag)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" onClick={() => handleDelete(tag.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={!!confirmDeleteId} onClose={cancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this tag?</Typography>
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

export default TagForm;
