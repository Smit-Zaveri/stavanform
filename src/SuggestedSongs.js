import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Modal,
  Button,
  IconButton,
  Paper,
  Divider,
  TextField,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { firestore } from "./firebase"; // Import your firebase configuration
import InfoIcon from '@mui/icons-material/Info'; // Icon for modal pop-up

const SuggestedSongs = () => {
  const [loading, setLoading] = useState(true);
  const [groupedSuggestions, setGroupedSuggestions] = useState({});
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [suggestionToDelete, setSuggestionToDelete] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const snapshot = await firestore.collection("suggestions_new").get();
        const suggestions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Group suggestions by collection field
        const grouped = suggestions.reduce((acc, suggestion) => {
          const { collection } = suggestion;
          acc[collection] = acc[collection] || [];
          acc[collection].push(suggestion);
          return acc;
        }, {});

        setGroupedSuggestions(grouped);
        if (Object.keys(grouped).length > 0) {
          setSelectedCollection(Object.keys(grouped)[0]);
        }
      } catch (err) {
        setError("Failed to fetch suggestions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleApplySuggestion = (suggestion) => {
    navigate("/", { state: { suggestion } });
  };

  const handleOpenModal = (song) => {
    setSelectedSong(song);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSong(null);
  };

  const handleDeleteClick = (suggestion) => {
    setSuggestionToDelete(suggestion);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!suggestionToDelete) return;
    try {
      await firestore.collection("suggestions_new").doc(suggestionToDelete.id).delete();
      setGroupedSuggestions((prev) => {
        const updated = { ...prev };
        updated[suggestionToDelete.collection] = updated[suggestionToDelete.collection].filter(
          (s) => s.id !== suggestionToDelete.id
        );
        if (!updated[suggestionToDelete.collection].length) delete updated[suggestionToDelete.collection];
        return updated;
      });
      setSnackMessage("Suggestion deleted successfully.");
      setSnackOpen(true);
    } catch {
      setError("Failed to delete suggestion.");
    } finally {
      setOpenDialog(false);
      setSuggestionToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
    setSuggestionToDelete(null);
  };

  const handleFavoriteToggle = (song) => {
    // Here you can implement favorite functionality, e.g., updating Firestore
    // For simplicity, we will just log it and show a message
    console.log(`Toggled favorite for: ${song.title}`);
    setSnackMessage(`${song.title} has been marked as favorite.`);
    setSnackOpen(true);
  };

  const filteredSuggestions = (suggestions) =>
    suggestions.filter(
      (song) =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artistName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, p: 2 }}>
      {/* Sidebar */}
      <Box sx={{ width: { xs: '100%', sm: 200 }, pr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }}>
        <Typography variant="h6" gutterBottom>
          Collections
        </Typography>
        <Divider />
        {Object.keys(groupedSuggestions).map((collectionName) => (
          <Button
            key={collectionName}
            onClick={() => setSelectedCollection(collectionName)}
            sx={{
              justifyContent: "flex-start",
              width: "100%",
              textAlign: "left",
              mb: 1,
              color: selectedCollection === collectionName ? "primary.main" : "inherit",
              fontSize: { xs: '0.9rem', sm: '1rem' }, // Responsive font size
            }}
          >
            {collectionName}
          </Button>
        ))}
      </Box>

      {/* Main content */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
          Suggested Songs
        </Typography>
        
        {/* Search Field */}
        <TextField
          label="Search Songs"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        {selectedCollection ? (
          groupedSuggestions[selectedCollection]?.length > 0 ? (
            <CollectionTable
              collectionName={selectedCollection}
              suggestions={filteredSuggestions(groupedSuggestions[selectedCollection])}
              onApply={handleApplySuggestion}
              onDelete={handleDeleteClick}
              onOpenModal={handleOpenModal}
            />
          ) : (
            <Typography variant="h6" align="center" sx={{ mt: 4 }}>
              There are no suggested songs.
            </Typography>
          )
        ) : (
          <Typography variant="h6" align="center" sx={{ mt: 4 }}>
            Please select a collection to view suggestions.
          </Typography>
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteDialog
          open={openDialog}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          suggestionToDelete={suggestionToDelete}
        />

        {/* Full Song Content Modal */}
        {selectedSong && (
          <SongModal open={openModal} onClose={handleCloseModal} selectedSong={selectedSong} />
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackOpen}
          autoHideDuration={6000}
          onClose={() => setSnackOpen(false)}
          message={snackMessage}
        />
      </Box>
    </Box>
  );
};

// Components
const LoadingSpinner = () => (
  <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
    <CircularProgress />
  </Box>
);

const ErrorAlert = ({ error }) => (
  <Alert severity="error" sx={{ mb: 2 }}>
    {error}
  </Alert>
);

const CollectionTable = ({ collectionName, suggestions, onApply, onDelete, onOpenModal }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h5" gutterBottom sx={{ textTransform: "capitalize", fontWeight: "bold", mb: 2 }}>
      Collection: {collectionName}
    </Typography>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Artist</TableCell>
            <TableCell>Content Preview</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {suggestions.map((song) => (
            <TableRow key={song.id}>
              <TableCell>{song.title}</TableCell>
              <TableCell>{song.artistName}</TableCell>
              <TableCell>{song.content.split("\n").slice(0, 2).join("\n") + "..."}</TableCell>
              <TableCell>
                <Button size="small" color="primary" onClick={() => onApply(song)}>
                  Apply
                </Button>
                <Button size="small" color="secondary" onClick={() => onDelete(song)}>
                  Delete
                </Button>
                <IconButton size="small" color="info" onClick={() => onOpenModal(song)}>
                  <InfoIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

const SongModal = ({ open, onClose, selectedSong }) => (
  <Modal open={open} onClose={onClose}>
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: '90%', sm: 500 },
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>{selectedSong.title}</Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
        Artist: {selectedSong.artistName}
      </Typography>
      <Typography sx={{ mt: 1, whiteSpace: 'pre-line' }}>{selectedSong.content}</Typography>
      <Button onClick={onClose} sx={{ mt: 2 }} variant="contained" fullWidth>
        Close
      </Button>
    </Box>
  </Modal>
);

const DeleteDialog = ({ open, onCancel, onConfirm, suggestionToDelete }) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>Confirm Deletion</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete the suggestion "{suggestionToDelete?.title}"?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} color="primary">
        Cancel
      </Button>
      <Button onClick={onConfirm} color="secondary">
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

export default SuggestedSongs;
