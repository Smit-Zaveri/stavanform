import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Snackbar,
} from "@mui/material";
import { firestore } from "../firebase";
import firebase from "firebase/compat/app";
import { useSongForm } from "../hooks/useSongForm";
import { SongFormControls } from "./FormComponents/SongFormControls";
import { validateSongForm } from "../utils/validators";

export const SongFormDialog = ({
  open,
  onClose,
  mode,
  initialData,
  collectionName,
  collectionList,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const [selectedCollection, setSelectedCollection] = useState(collectionName || "lyrics");
  const [collectionOptions, setCollectionOptions] = useState([]);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newArtist, setNewArtist] = useState("");

  const {
    formData,
    setters,
    tagInput,
    artistOptions,
    tirthankarList,
    tagsOptions
  } = useSongForm(initialData, mode);

  // Update collection when initialData changes
  useEffect(() => {
    if (initialData && initialData.collection) {
      setSelectedCollection(initialData.collection);
    } else if (collectionName) {
      setSelectedCollection(collectionName);
    }
  }, [initialData, collectionName]);

  // Fetch collection list
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const snapshot = await firestore.collection("collections").get();
        setCollectionOptions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };
    fetchCollections();
  }, []);

  const handleArtistInputBlur = () => {
    if (formData.artist && !artistOptions.some((option) => option.name === formData.artist)) {
      setNewArtist(formData.artist);
      setOpenDialog(true);
    }
  };

  const handleConfirmNewArtist = () => {
    setOpenDialog(false);
    navigate(`/artist-form`, { state: { name: newArtist } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setters.commitTagInput();

    // Clean up tags before validation
    const cleanedTags = formData.tags
      ? formData.tags.map(tag => tag.trim()).filter(Boolean)
      : [];

    const dataToValidate = {
      ...formData,
      tags: cleanedTags,
      selectedCollection
    };

    const validationError = validateSongForm(dataToValidate);

    if (validationError) {
      setError(validationError);
      setOpenSnackbar(true);
      return;
    }

    const docData = {
      ...formData,
      tags: cleanedTags,
      order: formData.order ? Number(formData.order) : null,
      publishDate: firebase.firestore.Timestamp.now(),
    };

    if (mode === "edit" && initialData?.id) {
      docData.id = initialData.id;
    }

    try {
      await onSubmit(docData, mode);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Failed to save changes. Please try again.");
      setOpenSnackbar(true);
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        fullWidth 
        maxWidth="md"
        keepMounted={false} // Force re-render on close
      >
        <DialogTitle>{mode === "new" ? "Add New Song" : "Edit Song"}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <SongFormControls
              formData={formData}
              setters={setters}
              tagInput={tagInput}
              artistOptions={artistOptions}
              tirthankarList={tirthankarList}
              tagsOptions={tagsOptions}
              error={error}
              collectionOptions={collectionOptions}
              selectedCollection={selectedCollection}
              setSelectedCollection={setSelectedCollection}
              handleArtistInputBlur={handleArtistInputBlur}
            />
            <Button variant="contained" type="submit" fullWidth sx={{ mt: 3 }}>
              Submit
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
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
    </>
  );
};