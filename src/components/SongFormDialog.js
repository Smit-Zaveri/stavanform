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
  IconButton,
} from "@mui/material";
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import firebase from "firebase/compat/app";
import "firebase/firestore";
import "firebase/storage";
import { firestore } from "../firebase";
import TagsInput from "./FormComponents/TagsInput";

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
  const [formValues, setFormValues] = useState({
    title: initialData?.title || "",
    artist: initialData?.artist || "", // Important: Initialize artist properly
    tags: initialData?.tags || [],
    order: initialData?.order ?? "",
    content: initialData?.content || "",
    youtube: initialData?.youtube || "",
    newFlag: initialData?.newFlag || false,
    newTts: initialData?.newTts || false,
    tirthankarId: initialData?.tirthankarId || "",
    mp3URL: initialData?.mp3URL || "",
  });

  const [uploadProgress, setUploadProgress] = useState(0);

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormValues({
        title: initialData.title || "",
        artist: initialData.artist || "", // Ensure artist is set from initialData
        tags: initialData.tags || [],
        order: initialData.order || "",
        content: initialData.content || "",
        youtube: initialData.youtube || "",
        newFlag: initialData.newFlag || false,
        newTts: initialData.newTts || false,
        tirthankarId: initialData.tirthankarId || "",
        mp3URL: initialData.mp3URL || "",
      });
    } else {
      // Reset form when there's no initialData
      setFormValues({
        title: "",
        artist: "",
        tags: [],
        order: "",
        content: "",
        youtube: "",
        newFlag: false,
        newTts: false,
        tirthankarId: "",
        mp3URL: "",
      });
    }
  }, [initialData]);

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
 // Update dependency array to include selectedTirthankar
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
}, [initialData?.tags, selectedTirthankar]);// Only depends on initial tags

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
        const filteredTags = formValues.tags.filter((tag) => {
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

        if (JSON.stringify(newTags) !== JSON.stringify(formValues.tags)) {
          setFormValues(prev => ({
            ...prev,
            tags: newTags
          }));
        }
      }
    } else {
      // When no Tirthankar selected, remove ALL Tirthankar-related tags
      const filteredTags = formValues.tags.filter(
        (tag) => !allTirthTags.has(tag.toLowerCase())
      );

      if (JSON.stringify(filteredTags) !== JSON.stringify(formValues.tags)) {
        setFormValues(prev => ({
          ...prev,
          tags: filteredTags
        }));
      }
    }
  }, [selectedTirthankar, tirthankarList, formValues.tags]);

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
      setFormValues(prev => ({
        ...prev,
        tags: [...prev.tags, ...newTags]
      }));
    }
    setTagInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Commit any remaining tagInput before submitting.
    if (tagInput.trim() !== "") {
      commitTagInput();
    }
    if (!selectedCollection || !formValues.title || !formValues.content) {
      setError("Please fill in all required fields.");
      setOpenSnackbar(true);
      return;
    }
    if (formValues.youtube && !isValidYouTubeURL(formValues.youtube)) {
      setError("Please enter a valid YouTube URL.");
      setOpenSnackbar(true);
      return;
    }
    const parsedOrder = formValues.order ? Number(formValues.order) : null;
    if (formValues.order && isNaN(parsedOrder)) {
      setError("Please enter a valid number for the order field.");
      setOpenSnackbar(true);
      return;
    }

    const docData = {
      title: formValues.title,
      artist: formValues.artist,
      tags: formValues.tags, // tags as an array
      content: formValues.content,
      youtube: formValues.youtube,
      order: parsedOrder,
      publishDate: firebase.firestore.Timestamp.now(),
      newFlag: formValues.newFlag,
      newTts: formValues.newTts,
      tirthankarId: formValues.tirthankarId,
      mp3URL: formValues.mp3URL,
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
    if (formValues.artist && !artistOptions.some((option) => option.name === formValues.artist)) {
      setNewArtist(formValues.artist);
      setOpenDialog(true);
    }
  };

  const handleConfirmNewArtist = () => {
    setOpenDialog(false);
    navigate(`/artist-form`, { state: { name: newArtist } });
  };

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      setError("");
      setOpenSnackbar(false);
      setOpenDialog(false);
      setNewArtist("");
    }
  }, [open]);

  const handleFormChange = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
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
                value={formValues.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                error={!formValues.title && !!error}
              />
            </Grid>
            {/* Artist */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={artistOptions.map((opt) => opt.name)}
                value={formValues.artist}
                onInputChange={(event, newValue) => handleFormChange('artist', newValue)}
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
            {/* Tags Input */}
            <Grid item xs={12} md={6}>
              <TagsInput
                tags={formValues.tags}
                setTags={(newTags) => handleFormChange('tags', newTags)}
                tagInput={tagInput}
                setTagInput={setTagInput}
                combinedTagSuggestions={combinedTagSuggestions}
              />
            </Grid>
            {/* YouTube */}
            <Grid item xs={12} md={6}>
              <TextField
                label="YouTube Link"
                variant="outlined"
                fullWidth
                value={formValues.youtube}
                onChange={(e) => handleFormChange('youtube', e.target.value)}
                error={formValues.youtube && !isValidYouTubeURL(formValues.youtube)}
                helperText={
                  formValues.youtube && !isValidYouTubeURL(formValues.youtube)
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
                value={formValues.order}
                onChange={(e) => handleFormChange('order', e.target.value)}
                error={formValues.order && isNaN(Number(formValues.order))}
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
                value={formValues.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
                error={!formValues.content && !!error}
              />
            </Grid>
            {/* New flag */}
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValues.newFlag}
                    onChange={(e) => handleFormChange('newFlag', e.target.checked)}
                  />
                }
                label="New"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValues.newTts}
                    onChange={(e) => handleFormChange('newTts', e.target.checked)}
                  />
                }
                label="TTS"
              />
            </Grid>
            {/* MP3 URL input */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="MP3 URL"
                  variant="outlined"
                  fullWidth
                  value={formValues.mp3URL}
                  onChange={(e) => handleFormChange('mp3URL', e.target.value)}
                  placeholder="Enter MP3 URL"
                />
                {formValues.mp3URL && (
                  <audio controls style={{ width: '100%' }}>
                    <source src={formValues.mp3URL} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </Box>
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
