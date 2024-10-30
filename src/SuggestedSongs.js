import InfoIcon from '@mui/icons-material/Info';
import { Delete, Edit } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Modal,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  TablePagination,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { firestore } from "./firebase";

const SuggestedSongs = () => {
  const [loading, setLoading] = useState(true);
  const [groupedSuggestions, setGroupedSuggestions] = useState({});
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [suggestionToDelete, setSuggestionToDelete] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const snapshot = await firestore.collection("suggestions_new").get();
        const suggestions = snapshot.docs.map(doc => ({
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
      setGroupedSuggestions(prev => {
        const updated = { ...prev };
        updated[suggestionToDelete.collection] = updated[suggestionToDelete.collection].filter(
          (s) => s.id !== suggestionToDelete.id
        );
        if (!updated[suggestionToDelete.collection].length) {
          delete updated[suggestionToDelete.collection];
        }
        return updated;
      });
      setSnackMessage("Suggestion deleted successfully.");
      setSnackOpen(true);
    } catch (error) {
      setError("Failed to delete suggestion.");
      console.error("Delete error:", error);
    } finally {
      setOpenDialog(false);
      setSuggestionToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
    setSuggestionToDelete(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page on search
  };

  const filteredSuggestions = useMemo(() => {
    if (!selectedCollection) return [];
    return groupedSuggestions[selectedCollection].filter((song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, groupedSuggestions, selectedCollection]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, p: 2 }}>
      {/* Sidebar */}
      <Sidebar
        collections={Object.keys(groupedSuggestions)}
        selectedCollection={selectedCollection}
        onSelectCollection={setSelectedCollection}
      />

      {/* Main content */}
      <MainContent
        selectedCollection={selectedCollection}
        groupedSuggestions={groupedSuggestions}
        onApply={handleApplySuggestion}
        onDelete={handleDeleteClick}
        onOpenModal={handleOpenModal}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filteredSuggestions={filteredSuggestions}
        page={page}
        rowsPerPage={rowsPerPage}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />

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
        severity={error ? 'error' : 'success'}
      />
    </Box>
  );
};

// Sidebar Component
const Sidebar = ({ collections, selectedCollection, onSelectCollection }) => (
  <Box sx={{ width: { xs: '100%', sm: 200 }, pr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }}>
    <Typography variant="h6" gutterBottom>Collections</Typography>
    <Divider />
    {collections.map((collectionName) => (
      <Button
        key={collectionName}
        onClick={() => onSelectCollection(collectionName)}
        sx={{
          justifyContent: "flex-start",
          width: "100%",
          textAlign: "left",
          mb: 1,
          color: selectedCollection === collectionName ? "primary.main" : "inherit",
          fontSize: { xs: '0.9rem', sm: '1rem' },
          '&:hover': {
            backgroundColor: selectedCollection === collectionName ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        {collectionName}
      </Button>
    ))}
  </Box>
);

// Main Content Component
const MainContent = ({
  selectedCollection,
  groupedSuggestions,
  onApply,
  onDelete,
  onOpenModal,
  searchTerm,
  onSearchChange,
  filteredSuggestions,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage
}) => (
  <Box sx={{ flexGrow: 1 }}>
    <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
      Suggested Songs
    </Typography>

    <TextField
      variant="outlined"
      placeholder="Search..."
      value={searchTerm}
      onChange={onSearchChange}
      fullWidth
      sx={{ mb: 2 }}
    />

    {selectedCollection ? (
      filteredSuggestions.length > 0 ? (
        <CollectionTable
          collectionName={selectedCollection}
          suggestions={filteredSuggestions}
          onApply={onApply}
          onDelete={onDelete}
          onOpenModal={onOpenModal}
          page={page}
          rowsPerPage={rowsPerPage}
          onChangePage={onChangePage}
          onChangeRowsPerPage={onChangeRowsPerPage}
        />
      ) : (
        <Typography variant="body1" align="center">No suggestions available for this collection.</Typography>
      )
    ) : (
      <Typography variant="body1" align="center">Please select a collection.</Typography>
    )}
  </Box>
);

// Collection Table Component
const CollectionTable = ({
  collectionName,
  suggestions,
  onApply,
  onDelete,
  onOpenModal,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage
}) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {suggestions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((song) => (
          <TableRow key={song.id} >
            <TableCell>{song.title}</TableCell>
            <TableCell align="right">
              <IconButton onClick={() => onApply(song)}>
                <Edit/>
              </IconButton>
              <IconButton onClick={() => onDelete(song)}>
                <Delete />
              </IconButton>
              <IconButton onClick={() => onOpenModal(song)}>
                <InfoIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <TablePagination
      rowsPerPageOptions={[5, 10, 25]}
      component="div"
      count={suggestions.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={onChangePage}
      onRowsPerPageChange={onChangeRowsPerPage}
    />
  </TableContainer>
);

// Loading Spinner Component
const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// Error Alert Component
const ErrorAlert = ({ error }) => (
  <Box sx={{ p: 2 }}>
    <Alert severity="error">{error}</Alert>
  </Box>
);

// Delete Confirmation Dialog Component
const DeleteDialog = ({ open, onCancel, onConfirm, suggestionToDelete }) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>Delete Suggestion</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete the suggestion for "{suggestionToDelete?.title}"?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} color="primary">Cancel</Button>
      <Button onClick={onConfirm} color="secondary">Delete</Button>
    </DialogActions>
  </Dialog>
);

// Song Modal Component
const SongModal = ({ open, onClose, selectedSong }) => (
  <Modal open={open} onClose={onClose}>
    <Box sx={{ p: 4 , margin: "auto", width: "80%", maxHeight: "80vh", overflowY: "auto" }}>
      <Typography variant="h5" gutterBottom>{selectedSong.title}</Typography>
      <Typography variant="body1">{selectedSong.content}</Typography>
    </Box>
  </Modal>
);

export default SuggestedSongs;
