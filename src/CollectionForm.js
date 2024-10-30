import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { firestore } from "./firebase";

const CollectionForm = () => {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [numbering, setNumber] = useState("");
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const snapshot = await firestore
        .collection("collections")
        .orderBy("numbering")
        .get();
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

    if (!name || !displayName || !numbering) {
      setError("Please fill in all fields.");
      return;
    }

    const collectionData = {
      name,
      displayName,
      numbering: parseInt(numbering, 10),
    };

    try {
      if (editingId) {
        await firestore.collection("collections").doc(editingId).update(collectionData);
        setSnackbarMessage("Collection updated successfully.");
      } else {
        await firestore.collection("collections").add(collectionData);
        setSnackbarMessage("Collection added successfully.");
      }

      setSnackbarOpen(true);
      resetForm();
      fetchCollections();
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
        fetchCollections();
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

  const handleLongPressStart = (index) => {
    setDraggedIndex(index);
    setIsDragging(true);
  };

  const handleMouseDown = (index) => {
    setDraggedIndex(index);
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedIndex(null);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDraggedIndex(null);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    // Get the position of the touch event
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.getAttribute("data-index") !== null) {
      const dropIndex = parseInt(target.getAttribute("data-index"), 10);
      if (dropIndex !== draggedIndex) {
        handleDrop(dropIndex);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target && target.getAttribute("data-index") !== null) {
      const dropIndex = parseInt(target.getAttribute("data-index"), 10);
      if (dropIndex !== draggedIndex) {
        handleDrop(dropIndex);
      }
    }
  };

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) return; // No valid drop
    const newCollections = [...collections];
    const [movedItem] = newCollections.splice(draggedIndex, 1);
    newCollections.splice(index, 0, movedItem);

    const updatedCollections = newCollections.map((item, idx) => ({
      ...item,
      numbering: idx + 1,
    }));

    setCollections(updatedCollections);

    // Update Firestore with new numbering
    updatedCollections.forEach((item) => {
      firestore.collection("collections").doc(item.id).update({ numbering: item.numbering });
    });

    setIsDragging(false); // Reset dragging state
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
          type="number"
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
        {collections.map((collection, index) => (
          <React.Fragment key={collection.id}>
            <ListItem
              onTouchStart={() => handleLongPressStart(index)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
              onMouseDown={() => handleMouseDown(index)}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              data-index={index}
              sx={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                backgroundColor:  "inherit",
                cursor: isDragging ? "grabbing" : "grab",
              }}
            >
              <IconButton edge="start" sx={{ color: "gray" }}>
                <DragIndicatorIcon />
              </IconButton>
              <ListItemText
                primary={`#${collection.numbering} - ${collection.name}`}
                secondary={collection.displayName}
              />
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton edge="end" onClick={() => handleEditCollection(collection)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDeleteCollection(collection.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
            <Divider />
          </React.Fragment>
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