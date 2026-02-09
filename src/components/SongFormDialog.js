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
  DialogContentText,
  Fade,
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
  const [selectedCollection, setSelectedCollection] = useState("");
  const [collectionOptions, setCollectionOptions] = useState([]);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newArtist, setNewArtist] = useState("");
  const [previousCollection, setPreviousCollection] = useState("");
  const [openDuplicateDialog, setOpenDuplicateDialog] = useState(false);
  const [duplicateAction, setDuplicateAction] = useState('');
  const [pendingDocData, setPendingDocData] = useState(null);

  const {
    formData,
    setters,
    tagInput,
    artistOptions,
    tirthankarList,
    tagsOptions
  } = useSongForm(initialData, mode);

  useEffect(() => {
    if (initialData && initialData.collection) {
      setSelectedCollection(initialData.collection);
      setPreviousCollection(initialData.collection);
    } else if (collectionName) {
      setSelectedCollection(collectionName);
      setPreviousCollection(collectionName);
    }
  }, [initialData, collectionName]);

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
      const duplicateQuery = await firestore.collection(selectedCollection)
        .where("title", "==", formData.title)
        .get();

      if (!duplicateQuery.empty && mode === "new") {
        setPendingDocData(docData);
        setOpenDuplicateDialog(true);
        return;
      }

      await saveSong(docData);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Failed to save changes. Please try again.");
      setOpenSnackbar(true);
    }
  };

  const saveSong = async (docData) => {
    try {
      if (mode === "edit" && initialData?.id) {
        if (selectedCollection !== previousCollection) {
          setError("Moving song to new collection...");
          setOpenSnackbar(true);
          
          await firestore.collection(previousCollection).doc(initialData.id).delete();
          await firestore.collection(selectedCollection).add(docData);
          
          setError(`Successfully moved song to ${selectedCollection}`);
        } else {
          await firestore.collection(selectedCollection).doc(initialData.id).update(docData);
          setError("Successfully updated song");
        }
      } else {
        if (duplicateAction === 'replace') {
          const duplicateDoc = await firestore.collection(selectedCollection)
            .where("title", "==", docData.title)
            .get();
          await firestore.collection(selectedCollection).doc(duplicateDoc.docs[0].id).set(docData);
        } else {
          await firestore.collection(selectedCollection).add(docData);
        }
        setError("Successfully added new song");
      }

      setOpenSnackbar(true);
      setTimeout(() => {
        onSubmit(docData, mode, { previousCollection, newCollection: selectedCollection });
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error saving song:", error);
      setError("Failed to save changes. Please try again.");
      setOpenSnackbar(true);
    }
  };

  const handleDuplicateAction = (action) => {
    setDuplicateAction(action);
    setOpenDuplicateDialog(false);
    if (action === 'skip') {
      setError("Song upload skipped - duplicate found");
      setOpenSnackbar(true);
      return;
    }
    if (pendingDocData) {
      saveSong(pendingDocData);
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        fullWidth 
        maxWidth="lg"
        keepMounted={false}
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            overflow: 'hidden',
          }
        }}
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <DialogTitle sx={{ color: '#fff', pb: 1 }}>
          {mode === "new" ? "Add New Song" : "Edit Song"}
          {mode === "edit" && selectedCollection !== previousCollection && (
            <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.5 }}>
              Moving song from {previousCollection} to {selectedCollection}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent 
          sx={{ 
            pt: 1,
            // Custom scrollbar styling
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(255,255,255,0.3)',
            },
          }}
        >
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
              mode={mode}
              previousCollection={previousCollection}
            />
            <Button 
              variant="contained" 
              type="submit" 
              fullWidth 
              sx={{ 
                mt: 3,
                backgroundColor: '#fff',
                color: '#1a1a1a',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                },
              }}
            >
              Submit
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={openDuplicateDialog} 
        onClose={() => setOpenDuplicateDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>Duplicate Song Found</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#999' }}>
            A song with the title "{formData.title}" already exists in this collection. What would you like to do?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => handleDuplicateAction('skip')} sx={{ color: '#999' }}>Skip This</Button>
          <Button onClick={() => handleDuplicateAction('replace')} sx={{ color: '#ff9800' }}>Replace Existing</Button>
          <Button onClick={() => handleDuplicateAction('add')} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>Add as New</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={error.includes("Success") ? "success" : "error"}
          sx={{ 
            width: "100%",
            bgcolor: error.includes("Success") ? '#1a3d1a' : '#3d1f1f',
            color: '#fff',
            '& .MuiAlert-icon': {
              color: error.includes("Success") ? '#4caf50' : '#ff6b6b',
            }
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>Create New Artist</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#999' }}>
            The artist "{newArtist}" does not exist. Would you like to create a
            new artist entry?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#999' }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmNewArtist} sx={{ color: '#1a1a1a', bgcolor: '#fff', '&:hover': { bgcolor: '#e0e0e0' } }}>
            Yes, Create Artist
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
