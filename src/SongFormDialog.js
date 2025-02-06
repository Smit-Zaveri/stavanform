import React, { useEffect, useState } from "react";
import { createFilterOptions } from "@mui/material/Autocomplete";
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

const filter = createFilterOptions();

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
  const [tags, setTags] = useState(initialData?.tags || []); // tags stored as an array
  const [order, setOrder] = useState(initialData?.order ?? "");
  const [content, setContent] = useState(initialData?.content || "");
  const [youtube, setYoutube] = useState(initialData?.youtube || "");
  const [newFlag, setNewFlag] = useState(initialData?.newFlag || false);
  const [newTts, setNewTts] = useState(initialData?.newTts || false);
  const [selectedCollection, setSelectedCollection] = useState(
    collectionName || "lyrics"
  );
  // Only store Tirthankar id
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
  // State to control the current Tags input value
  const [tagInput, setTagInput] = useState("");

  // Fetch artist options
  useEffect(() => {
    const fetchArtistOptions = async () => {
      try {
        const snapshot = await firestore.collection("artists").get();
        setArtistOptions(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        console.error("Error fetching artist options:", err);
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
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };
    fetchCollections();
  }, []);

  // Fetch Tirthankar list from "tirtankar" collection

  // Fetch tag suggestions from Firebase "tags" collection
  useEffect(() => {
    const fetchTagsOptions = async () => {
      try {
        const snapshot = await firestore.collection("tags").get();
        const firebaseTags = snapshot.docs.map((doc) => doc.data().name);
        setTagsOptions(firebaseTags);
      } catch (err) {
        console.error("Error fetching tags options:", err);
      }
    };
    fetchTagsOptions();
  }, []);

  useEffect(() => {
    const fetchTirthTags = async () => {
      try {
        const snapshot = await firestore.collection("tirth").get();
        const tirthTags = snapshot.docs.map((doc) => doc.data().name); // Assuming the field name is "name"
        setTagsOptions((prevTags) => [...prevTags, ...tirthTags]);
      } catch (err) {
        console.error("Error fetching Tirth tags:", err);
      }
    };
    fetchTirthTags();
  }, []);

  // Updated useEffect to handle Tirthankar selection and tag management
  // 1. Update Tirthankar list fetch effect (remove selectedTirthankar dependency)
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

        // Only set initial Tirthankar if not already set
        if (initialData?.tags && !selectedTirthankar) {
          const initialTagsLower = initialData.tags.map((tag) =>
            tag.toLowerCase()
          );
          const matching = tirthData.find((t) =>
            initialTagsLower.includes(t.name.toLowerCase())
          );
          // Use functional update to prevent overwriting user changes
          setSelectedTirthankar((current) => current || matching?.id || "");
        }
      } catch (err) {
        console.error("Error fetching Tirthankar list:", err);
      }
    };
    fetchTirthankarList();
  }, [initialData?.tags]); // Only depends on initial tags

  // 2. Enhanced tag cleanup effect
  useEffect(() => {
    // Create set of all possible Tirthankar tags
    const allTirthTags = new Set();
    tirthankarList.forEach((t) => {
      allTirthTags.add(t.name.toLowerCase());
      allTirthTags.add(t.displayName.toLowerCase());
    });

    if (selectedTirthankar) {
      // Existing logic for when Tirthankar is selected...
      const selectedObj = tirthankarList.find(
        (t) => t.id === selectedTirthankar
      );
      if (selectedObj) {
        const currentTirthTags = [selectedObj.name, selectedObj.displayName];
        const currentTirthTagsLower = currentTirthTags.map((t) =>
          t.toLowerCase()
        );

        // Filter out any tags from other Tirthankars
        const filteredTags = tags.filter((tag) => {
          const lowerTag = tag.toLowerCase();
          return (
            !allTirthTags.has(lowerTag) ||
            currentTirthTagsLower.includes(lowerTag)
          );
        });

        // Add current Tirthankar tags if missing
        const missingTags = currentTirthTags.filter(
          (t) =>
            !filteredTags.some((ft) => ft.toLowerCase() === t.toLowerCase())
        );

        const newTags = [...filteredTags, ...missingTags];

        if (JSON.stringify(newTags) !== JSON.stringify(tags)) {
          setTags(newTags);
        }
      }
    } else {
      // When no Tirthankar selected, remove ALL Tirthankar-related tags
      const filteredTags = tags.filter(
        (tag) => !allTirthTags.has(tag.toLowerCase())
      );

      if (JSON.stringify(filteredTags) !== JSON.stringify(tags)) {
        setTags(filteredTags);
      }
    }
  }, [selectedTirthankar, tirthankarList, tags]);

  // Combine suggestions from Firebase "tags" collection and Tirthankar names.
  const combinedTagSuggestions = Array.from(new Set([...tagsOptions]));

  // Helper: Validate YouTube URL.
  const isValidYouTubeURL = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(url);
  };

  // Commit the current tagInput: split by comma, trim, and add non-empty tags.
  const commitTagInput = () => {
    const newTags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");
    if (newTags.length > 0) {
      setTags((prevTags) => [...prevTags, ...newTags]);
    }
    setTagInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Commit any remaining tagInput before submitting.
    if (tagInput.trim() !== "") {
      commitTagInput();
    }
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
      tags, // tags as an array
      content,
      youtube,
      order: parsedOrder,
      publishDate: firebase.firestore.Timestamp.now(),
      newFlag,
      newTts,
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
                    <em>Clear Selection</em>
                  </MenuItem>
                  {tirthankarList.map((tirth) => (
                    <MenuItem key={tirth.id} value={tirth.id}>
                      {tirth.numbering}. {tirth.name} ({tirth.displayName})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Tags – separate tags by comma */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                freeSolo
                options={combinedTagSuggestions}
                value={tags}
                onChange={(event, newValue) => setTags(newValue)}
                inputValue={tagInput}
                onInputChange={(event, newInputValue) => {
                  // Automatically commit tags when comma is typed (before input changes)
                  if (newInputValue.endsWith(",")) {
                    const newTags = newInputValue
                      .split(",")
                      .map((t) => t.trim().replace(/,/g, "")) // Remove any commas and trim
                      .filter((t) => t !== "");

                    if (newTags.length > 0) {
                      setTags((prev) => [...prev, ...newTags]);
                      setTagInput(""); // Clear input after commit
                      return;
                    }
                  }
                  setTagInput(newInputValue);
                }}
                filterOptions={(options, params) => {
                  const filtered = filter(options, params);
                  const inputValue = params.inputValue.trim();

                  // Add custom option for raw input (excluding last comma)
                  if (
                    inputValue &&
                    !filtered.includes(inputValue.replace(/,/g, ""))
                  ) {
                    filtered.push(inputValue.replace(/,/g, ""));
                  }

                  return filtered;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    variant="outlined"
                    fullWidth
                    helperText="Separate tags with commas"
                    onKeyDown={(e) => {
                      // Commit tag when pressing Enter or Tab
                      if (e.key === "Enter" || e.key === "Tab") {
                        if (tagInput.trim()) {
                          setTags((prev) => [...prev, tagInput.trim()]);
                          setTagInput("");
                        }
                        e.preventDefault();
                      }
                    }}
                    onBlur={() => {
                      if (tagInput.trim()) {
                        setTags((prev) => [...prev, tagInput.trim()]);
                        setTagInput("");
                      }
                    }}
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
            <Grid item xs={6}>
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
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newTts}
                    onChange={(e) => setNewTts(e.target.checked)}
                  />
                }
                label="TTS"
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
