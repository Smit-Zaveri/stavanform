import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Snackbar,
  TextField,
  Typography,
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // for redirection
import firebase from "firebase/compat/app";
import "firebase/firestore";
import React, { useEffect, useState } from "react";
import { firestore } from "./firebase";

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
  const [openDialog, setOpenDialog] = useState(false); // for confirmation dialog
  const [newArtist, setNewArtist] = useState(""); // store new artist name
  const navigate = useNavigate(); // for redirection

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

      let collectionRef;
      if (selectedCollection === "lyrics") {
        collectionRef = firestore.collection("lyrics");
      } else {
        const collection = collectionList.find(
          (collection) => collection.id === selectedCollection
        );

        if (!collection) {
          console.log("Invalid collection selected. Cannot submit.");
          return;
        }

        collectionRef = firestore.collection(collection.name);
      }

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

  const handleArtistInputBlur = () => {
    // Check if the artist doesn't exist in the options
    if (artist && !artistOptions.some((option) => option.name === artist)) {
      setNewArtist(artist);
      setOpenDialog(true); // Open confirmation dialog
    }
  };

  const handleConfirmNewArtist = () => {
    setOpenDialog(false);
    navigate(`/artist-form`, { state: { name: newArtist } }); // Redirect to ArtistForm with prefilled name
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
        <Grid item xs={12} sm={6}>
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

          {/* Artist Autocomplete with Text Box */}
          <Autocomplete
            freeSolo
            options={artistOptions.map((option) => option.name)}
            value={artist}
            onInputChange={(event, newValue) => setArtist(newValue)}
            onBlur={handleArtistInputBlur}
            renderInput={(params) => (
              <TextField {...params} label="Artist" variant="outlined" fullWidth sx={{ mt: 2 }} />
            )}
          />

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

        <Grid item xs={12} sm={6} sx={{ mt: -2 }}>
          <TextField
            label="Tags (comma-separated)"
            variant="outlined"
            fullWidth
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            sx={{ mt: 2 }}
          />

          <TextField
            label="YouTube Link"
            variant="outlined"
            fullWidth
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            sx={{ mt: 2 }}
          />

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

      <Button
        variant="contained"
        color="primary"
        type="submit"
        sx={{ mt: 3 }}
        fullWidth
      >
        Submit
      </Button>

      {/* Dialog for new artist confirmation */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Artist</DialogTitle>
        <DialogContent>
          <Typography>
            The artist "{newArtist}" does not exist. Would you like to create a
            new artist entry?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmNewArtist} color="primary">
            Yes, Create Artist
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Form;
