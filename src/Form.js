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
  Snackbar,
  TextField,
  Typography,
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate, useLocation } from "react-router-dom"; // for redirection
import firebase from "firebase/compat/app";
import "firebase/firestore";
import React, { useEffect, useState } from "react";
import { firestore } from "./firebase";

const Form = () => {
  const location = useLocation();
  const suggestion = location.state?.suggestion;

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [tags, setTags] = useState("");
  const [order, setOrders] = useState("");
  const [content, setContent] = useState("");
  const [youtube, setYoutube] = useState("");
  const [newFlag, setNewFlag] = useState(false);
  const [artistOptions, setArtistOptions] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [collectionList, setCollectionList] = useState([]);
  const [tirthankarList, setTirthankarList] = useState([]); // For Tirthankar dropdown
  const [selectedTirthankar, setSelectedTirthankar] = useState(""); // Selected Tirthankar
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false); // for confirmation dialog
  const [newArtist, setNewArtist] = useState(""); // store new artist name
  const navigate = useNavigate(); // for redirection

  useState(() => {
    if (suggestion) {
      setTitle(suggestion.title || "");
      setArtist(suggestion.artistName || "");
      setContent(suggestion.content || "");
      setSelectedCollection(suggestion.collection || "");
      // ... set other fields as needed
    }
  }, [suggestion]);
  // Fetch artist options
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

  // Fetch collection list
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

  // Fetch Tirthankar list
  useEffect(() => {
    const fetchTirthankarList = async () => {
      try {
        const snapshot = await firestore
          .collection("tirtankar")
          .orderBy("numbering")
          .get();
        const tirthankarList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTirthankarList(tirthankarList);
      } catch (error) {
        console.error("Error fetching Tirthankar list:", error);
      }
    };

    fetchTirthankarList();
  }, []);

  // Helper function to validate YouTube URL
  const isValidYouTubeURL = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(url);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Basic validation for required fields
  if (!selectedCollection || !title || !content) {
    setError("Please fill in all required fields.");
    setSuccessMessage("");
    setOpenSnackbar(true);
    return;
  }

  // Validate YouTube URL if provided
  if (youtube && !isValidYouTubeURL(youtube)) {
    setError("Please enter a valid YouTube URL.");
    setSuccessMessage("");
    setOpenSnackbar(true);
    return;
  }

  // Validate that tags are not empty if provided
  const tagArray = tags.split(",").map((tag) => tag.trim());
  if (tags && tagArray.length === 0) {
    setError("Please enter at least one tag.");
    setSuccessMessage("");
    setOpenSnackbar(true);
    return;
  }

  // Validate the order field
  const parsedOrder = order ? Number(order) : null; // Parse order or set it to null if not provided
  if (order && isNaN(parsedOrder)) {
    setError("Please enter a valid number for the order field.");
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
        (collection) => collection.name === selectedCollection
      );

      if (!collection) {
        console.log("Invalid collection selected. Cannot submit.");
        return;
      }

      collectionRef = firestore.collection(collection.name);
    }

    // Adding selected Tirthankar to the tags
    const allTags = [...tagArray.map((tag) => tag.toLowerCase())];
    if (selectedTirthankar) {
      allTags.push(selectedTirthankar.name.toLowerCase());
      allTags.push(selectedTirthankar.displayName.toLowerCase());
    }

    // Create the document data
    const docData = {
      title,
      artist,
      tags: allTags,
      content,
      youtube,
      order: parsedOrder, // Use null if not provided
      publishDate,
      newFlag,
    };

    // Remove the `order` field if it's null
    if (parsedOrder === null) {
      delete docData.order;
    }

    const docRef = await collectionRef.add(docData);
    console.log("Document written with ID:", docRef.id);

    // Reset form fields
    setTitle("");
    setArtist("");
    setTags("");
    setOrders("");
    setContent("");
    setYoutube("");
    setSelectedCollection("");
    setSelectedTirthankar("");
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

      <Grid
        container
        spacing={{ xs: 1, md: 2 }}
        columns={{ xs: 1, sm: 8, md: 12 }}
      >
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
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
                <MenuItem key={collection.id} value={collection.name}>
                  {collection.name.charAt(0).toUpperCase() +
                    collection.name.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            error={!title && error}
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          {/* Artist Autocomplete with Text Box */}
          <Autocomplete
            freeSolo
            options={artistOptions.map((option) => option.name)}
            value={artist}
            onInputChange={(event, newValue) => setArtist(newValue)}
            onBlur={handleArtistInputBlur}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Artist"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          {/* Tirthankar Dropdown */}
          <FormControl fullWidth>
            <InputLabel>Select Tirthankar</InputLabel>
            <Select
              value={selectedTirthankar}
              onChange={(e) => setSelectedTirthankar(e.target.value)}
              label="Select Tirthankar"
            >
              <MenuItem value="">
                <em>Select a Tirthankar</em>
              </MenuItem>
              {tirthankarList.map((tirthankar) => (
                <MenuItem key={tirthankar.id} value={tirthankar}>
                  {tirthankar.numbering}. {tirthankar.name} (
                  {tirthankar.displayName})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <TextField
            label="Tags (comma-separated)"
            variant="outlined"
            fullWidth
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <TextField
            label="YouTube Link"
            variant="outlined"
            fullWidth
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            error={youtube && !isValidYouTubeURL(youtube)} // YouTube URL validation
            helperText={
              youtube && !isValidYouTubeURL(youtube)
                ? "Invalid YouTube URL"
                : ""
            }
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <TextField
            label="Order"
            variant="outlined"
            fullWidth
            value={order}
            onChange={(e) => setOrders(e.target.value)}
            error={!order && error}
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <TextField
            label="Content"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            error={!content && error}
          />
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 6 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={newFlag}
                onChange={(e) => setNewFlag(e.target.checked)}
              />
            }
            label="New"
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
