// SongFormDialog.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import { firestore } from "./firebase";

const SongFormDialog = ({
  open,
  onClose,
  mode, // "new" or "edit"
  initialData,
  collectionName, // current selected collection
  collectionList,
  onSubmit,
}) => {
  const navigate = useNavigate();
  // Fields
  const [title, setTitle] = useState(initialData?.title || "");
  const [artist, setArtist] = useState(initialData?.artist || "");
  const [tags, setTags] = useState(
    initialData?.tags ? initialData.tags.join(", ") : ""
  );
  const [order, setOrder] = useState(initialData?.order ?? "");
  const [content, setContent] = useState(initialData?.content || "");
  const [youtube, setYoutube] = useState(initialData?.youtube || "");
  const [newFlag, setNewFlag] = useState(initialData?.newFlag || false);
  const [selectedCollection, setSelectedCollection] = useState(
    collectionName || "lyrics"
  );
  const [selectedTirthankar, setSelectedTirthankar] = useState("");
  const [artistOptions, setArtistOptions] = useState([]);
  const [collectionOptions, setCollectionOptions] = useState([]);
  const [tirthankarList, setTirthankarList] = useState([]);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newArtist, setNewArtist] = useState("");

  // Fetch artist options
  useEffect(() => {
    const fetchArtistOptions = async () => {
      try {
        const snapshot = await firestore.collection("artists").get();
        setArtistOptions(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error("Error fetching artist options:", error);
      }
    };
    fetchArtistOptions();
  }, []);

  // Fetch collection list (if needed)
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const snapshot = await firestore.collection("collections").get();
        setCollectionOptions(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };
    fetchCollections();
  }, []);

  // Fetch Tirthankar list
  useEffect(() => {
    const fetchTirthankarList = async () => {
      try {
        const snapshot = await firestore
          .collection("tirtankar")
          .orderBy("numbering")
          .get();
        setTirthankarList(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error("Error fetching Tirthankar list:", error);
      }
    };
    fetchTirthankarList();
  }, []);

  // Helper: Validate YouTube URL
  const isValidYouTubeURL = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCollection || !title || !content) {
      setError("Please fill in all required fields.");
      setOpenSnackbar(true);
      return;
    }
    if (youtube && !isValidYouTubeURL(youtube)) {
      setError("Please enter a valid YouTube URL.");
      setOpenSnackbar(true);
      return;
    }
    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    const parsedOrder = order ? Number(order) : null;
    if (order && isNaN(parsedOrder)) {
      setError("Please enter a valid number for the order field.");
      setOpenSnackbar(true);
      return;
    }

    // Build the tags array (and include Tirthankar names if selected)
    const allTags = tagArray.map((tag) => tag.toLowerCase());
    if (selectedTirthankar) {
      allTags.push(selectedTirthankar.name.toLowerCase());
      allTags.push(selectedTirthankar.displayName.toLowerCase());
    }

    // Build the document data. For edit mode, include the id.
    const docData = {
      title,
      artist,
      tags: allTags,
      content,
      youtube,
      order: parsedOrder,
      publishDate: firebase.firestore.Timestamp.now(),
      newFlag,
    };
    if (mode === "edit" && initialData?.id) {
      docData.id = initialData.id;
    }
    // Submit the data via the onSubmit callback provided from SongList.
    await onSubmit(docData, mode);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError("");
  };

  const handleArtistInputBlur = () => {
    if (artist && !artistOptions.some((option) => option.name === artist)) {
      setNewArtist(artist);
      setOpenDialog(true);
    }
  };

  const handleConfirmNewArtist = () => {
    setOpenDialog(false);
    navigate(`/artist-form`, { state: { name: newArtist } });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{mode === "new" ? "Add New Song" : "Edit Song"}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={{ xs: 1, md: 2 }}>
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                required
                error={!selectedCollection && !!error}
              >
                <InputLabel>Select Collection</InputLabel>
                <Select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  label="Select Collection"
                >
                  <MenuItem value="">
                    <em>Select a collection</em>
                  </MenuItem>
                  {collectionOptions.map((coll) => (
                    <MenuItem key={coll.id} value={coll.name}>
                      {coll.name.charAt(0).toUpperCase() + coll.name.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Title"
                variant="outlined"
                fullWidth
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={!title && !!error}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={artistOptions.map((opt) => opt.name)}
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
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
              <TextField
                label="Tags (comma-separated)"
                variant="outlined"
                fullWidth
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="YouTube Link"
                variant="outlined"
                fullWidth
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                error={youtube && !isValidYouTubeURL(youtube)}
                helperText={
                  youtube && !isValidYouTubeURL(youtube)
                    ? "Invalid YouTube URL"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Order"
                variant="outlined"
                fullWidth
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                error={order && isNaN(Number(order))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Content"
                variant="outlined"
                fullWidth
                required
                multiline
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                error={!content && !!error}
              />
            </Grid>
            <Grid item xs={12}>
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
          <Button variant="contained" type="submit" fullWidth sx={{ mt: 3 }}>
            Submit
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
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
    </Dialog>
  );
};

export { SongFormDialog };
