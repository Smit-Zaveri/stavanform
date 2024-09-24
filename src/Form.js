import React, { useState, useEffect } from "react";
import { firestore } from "./firebase";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControlLabel,
  Grid,
  Alert,
  Snackbar,
} from "@mui/material";

const Form = () => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [youtube, setYoutube] = useState("");
  const [newFlag, setNewFlag] = useState(false);
  const [artistOptions, setArtistOptions] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [collectionList, setCollectionList] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedCollection || !title || !content) {
      setError("Please fill in all required fields.");
      setSuccessMessage("");
      setOpenSnackbar(true);
      return;
    }

    try {
      const publishDate = firebase.firestore.Timestamp.now();

      // Conditional logic to set the correct collection reference
      let collectionRef;

      // Check if the selected collection is "lyrics"
      if (selectedCollection === "lyrics") {
        collectionRef = firestore.collection("lyrics"); // Use the lyrics collection directly
      } else {
        // Find the collection object by ID from collectionList
        const collection = collectionList.find(
          (collection) => collection.id === selectedCollection
        );

        if (!collection) {
          console.log("Invalid collection selected. Cannot submit.");
          return;
        }

        collectionRef = firestore.collection(collection.name); // Use other collections
      }

      // Add the document to the selected collection
      const docRef = await collectionRef.add({
        title,
        artist,
        tags: tags.split(",").map((tag) => tag.trim().toLowerCase()),
        content,
        youtube,
        publishDate,
        newFlag,
      });
      console.log("Document written with ID:", docRef.id);

      // Reset form fields
      setTitle("");
      setArtist("");
      setTags("");
      setContent("");
      setYoutube("");
      setSelectedCollection("");
      setNewFlag(false);
      setError("");
      setSuccessMessage("Song added successfully!");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error adding document:", error);
      setError("Failed to submit the form.");
      setSuccessMessage("");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError("");
    setSuccessMessage("");
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 800, mx: "auto", p: 2 }}
    >
      <Typography variant="h5" gutterBottom>
        Add New Entry
      </Typography>

      {/* Snackbar for Messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>

      <Grid container spacing={2}>
        {/* Left Column */}
        <Grid item xs={12} sm={6}>
          {/* Select Collection */}
          <FormControl fullWidth required error={!selectedCollection && error}>
            <InputLabel>Select Collection</InputLabel>
            <Select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              label="Select Collection"
            >
              <MenuItem value="">
                <em>Select a collection</em>
              </MenuItem>
              <MenuItem value="lyrics">
                <em>Lyrics</em>
              </MenuItem>
              {collectionList.map((collection) => (
                <MenuItem key={collection.id} value={collection.id}>
                  {collection.name.charAt(0).toUpperCase() +
                    collection.name.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Title Field */}
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mt: 2 }}
            required
            error={!title && error}
          />

          {/* Artist Selection */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Artist</InputLabel>
            <Select
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              label="Artist"
            >
              <MenuItem value="">
                <em>Select an artist</em>
              </MenuItem>
              {artistOptions.map((option) => (
                <MenuItem key={option.id} value={option.name}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* New Flag */}
          <FormControlLabel
            control={
              <Checkbox
                checked={newFlag}
                onChange={(e) => setNewFlag(e.target.checked)}
              />
            }
            label="New"
            sx={{ mt: 2 }}
          />
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} sm={6} sx={{ mt: -2 }}>
          {/* Tags Field */}
          <TextField
            label="Tags (comma-separated)"
            variant="outlined"
            fullWidth
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            sx={{ mt: 2 }}
          />

          {/* YouTube Link */}
          <TextField
            label="YouTube Link"
            variant="outlined"
            fullWidth
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            sx={{ mt: 2 }}
          />

          {/* Content Field */}
          <TextField
            label="Content"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mt: 2 }}
            required
            error={!content && error}
          />
        </Grid>
      </Grid>

      {/* Submit Button */}
      <Button
        variant="contained"
        color="primary"
        type="submit"
        sx={{ mt: 3 }}
        fullWidth
      >
        Submit
      </Button>
    </Box>
  );
};

export default Form;
