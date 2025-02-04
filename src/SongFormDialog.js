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
  // Store tags as an array
  const [tags, setTags] = useState(initialData?.tags || []);
  const [order, setOrder] = useState(initialData?.order ?? "");
  const [content, setContent] = useState(initialData?.content || "");
  const [youtube, setYoutube] = useState(initialData?.youtube || "");
  const [newFlag, setNewFlag] = useState(initialData?.newFlag || false);
  const [selectedCollection, setSelectedCollection] = useState(
    collectionName || "lyrics"
  );
  // Instead of storing the whole object, store only the Tirthankar id.
  const [selectedTirthankar, setSelectedTirthankar] = useState(
    initialData?.tirthankarId || ""
  );
  const [artistOptions, setArtistOptions] = useState([]);
  const [collectionOptions, setCollectionOptions] = useState([]);
  const [tirthankarList, setTirthankarList] = useState([]);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newArtist, setNewArtist] = useState("");

  // State for tag suggestions from Firebase "tags" collection
  const [tagsOptions, setTagsOptions] = useState([]);
  // State for controlling the Autocomplete text input
  const [tagsInputValue, setTagsInputValue] = useState("");

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

  // Fetch collection list
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

  // Fetch Tirthankar list from "tirtankar" collection
  useEffect(() => {
    const fetchTirthankarList = async () => {
      try {
        const snapshot = await firestore
          .collection("tirtankar")
          .orderBy("numbering")
          .get();
        const tirthData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTirthankarList(tirthData);

        // If initialData contains tags, check if one matches a Tirthankar name.
        // If so, set the selectedTirthankar (if not already set).
        if (initialData?.tags && !selectedTirthankar) {
          const initialTagsLower = initialData.tags.map((tag) =>
            tag.toLowerCase()
          );
          const matching = tirthData.find((t) =>
            initialTagsLower.includes(t.name.toLowerCase())
          );
          if (matching) {
            setSelectedTirthankar(matching.id);
          }
        }
      } catch (error) {
        console.error("Error fetching Tirthankar list:", error);
      }
    };
    fetchTirthankarList();
  }, [initialData?.tags, selectedTirthankar]);

  // Fetch tag suggestions from Firebase "tags" collection
  useEffect(() => {
    const fetchTagsOptions = async () => {
      try {
        const snapshot = await firestore.collection("tags").get();
        // Assumes each tag document has a "name" field.
        const firebaseTags = snapshot.docs.map((doc) => doc.data().name);
        setTagsOptions(firebaseTags);
      } catch (error) {
        console.error("Error fetching tags options:", error);
      }
    };
    fetchTagsOptions();
  }, []);

  // When a Tirthankar is selected, look up its data and add its name/displayName to tags.
  useEffect(() => {
    if (selectedTirthankar) {
      // Find the selected Tirthankar object by its id.
      const selectedObj = tirthankarList.find(
        (t) => t.id === selectedTirthankar
      );
      if (selectedObj) {
        const tirthNames = [selectedObj.name, selectedObj.displayName];
        const lowerTags = tags.map((tag) => tag.toLowerCase());
        const missing = tirthNames.filter(
          (name) => !lowerTags.includes(name.toLowerCase())
        );
        if (missing.length > 0) {
          setTags((prevTags) => [...prevTags, ...missing]);
        }
      }
    }
  }, [selectedTirthankar, tirthankarList, tags]);

  // Combine suggestions from the Firebase "tags" collection and the Tirthankar names.
  const combinedTagSuggestions = Array.from(
    new Set([
      ...tagsOptions,
      ...tirthankarList.map((t) => t.name),
      ...tirthankarList.map((t) => t.displayName),
    ])
  );

  // Helper: Validate YouTube URL.
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
    const parsedOrder = order ? Number(order) : null;
    if (order && isNaN(parsedOrder)) {
      setError("Please enter a valid number for the order field.");
      setOpenSnackbar(true);
      return;
    }
    const docData = {
      title,
      artist,
      tags, // Already an array.
      content,
      youtube,
      order: parsedOrder,
      publishDate: firebase.firestore.Timestamp.now(),
      newFlag,
      // Save the selected Tirthankar id.
      tirthankarId: selectedTirthankar,
    };
    if (mode === "edit" && initialData?.id) {
      docData.id = initialData.id;
    }
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
            {/* Collection */}
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
            {/* Title */}
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
            {/* Artist */}
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
            {/* Tirthankar */}
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
                  {tirthankarList.map((tirth) => (
                    <MenuItem key={tirth.id} value={tirth.id}>
                      {tirth.numbering}. {tirth.name} ({tirth.displayName})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Tags (combining suggestions from both collections) */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                freeSolo
                options={combinedTagSuggestions}
                value={tags}
                onChange={(event, newValue) => setTags(newValue)}
                inputValue={tagsInputValue}
                onInputChange={(event, newInputValue) =>
                  setTagsInputValue(newInputValue)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </Grid>
            {/* YouTube */}
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
            {/* Order */}
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
            {/* Content */}
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
            {/* New flag */}
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
