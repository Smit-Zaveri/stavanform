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
  const [previousCollection, setPreviousCollection] = useState(collectionName || "lyrics");

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
      setPreviousCollection(initialData.collection);
    } else if (collectionName) {
      setSelectedCollection(collectionName);
      setPreviousCollection(collectionName);
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

    const cleanedTags = formData.tags
      ? formData.tags.map(tag => tag.trim()).filter(Boolean)
      : [];

    const dataToValidate = {
      ...formData,
      tags: cleanedTags,
      selectedCollection,
      previousCollection,
      mode
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

    try {
      if (mode === "edit" && initialData?.id) {
        if (selectedCollection !== previousCollection) {
          // Show loading message
          setError("Moving song to new collection...");
          setOpenSnackbar(true);
          
          // Delete from old collection and add to new collection
          await firestore.collection(previousCollection).doc(initialData.id).delete();
          await firestore.collection(selectedCollection).add(docData);
          
          // Show success message
          setError(`Successfully moved song to ${selectedCollection}`);
        } else {
          // Update in same collection
          await firestore.collection(selectedCollection).doc(initialData.id).update(docData);
          setError("Successfully updated song");
        }
      } else {
        // New song - add to selected collection
        await firestore.collection(selectedCollection).add(docData);
        setError("Successfully added new song");
      }

      // Show success message
      setOpenSnackbar(true);
      setTimeout(() => {
        onSubmit(docData, mode, { previousCollection, newCollection: selectedCollection });
        onClose();
      }, 1000);
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
        <DialogTitle>
          {mode === "new" ? "Add New Song" : "Edit Song"}
          {mode === "edit" && selectedCollection !== previousCollection && (
            <Typography variant="caption" color="text.secondary" display="block">
              Moving song from {previousCollection} to {selectedCollection}
            </Typography>
          )}
        </DialogTitle>
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
              mode={mode}  {/* Add the mode prop here */}
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
          severity={error.includes("Success") ? "success" : "error"}
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