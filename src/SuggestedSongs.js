import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Modal,
  Paper,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  Slide,
  TablePagination,
  InputAdornment,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Delete,
  Edit,
  Refresh,
  Info as InfoIcon,
  Close,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { firestore } from "./firebase";

// --- Custom Hook for Debouncing ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- Transition for Modal and Dialogs ---
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// --- Collections Tabs Component ---
const CollectionsTabs = ({ collections, selectedCollection, onSelectCollection }) => (
  <Tabs
    value={selectedCollection}
    onChange={(e, newValue) => onSelectCollection(newValue)}
    variant="scrollable"
    scrollButtons="auto"
    indicatorColor="primary"
    textColor="primary"
    sx={{ mb: 2 }}
  >
    {collections.map((collection) => (
      <Tab key={collection} value={collection} label={collection} />
    ))}
  </Tabs>
);

// --- Suggestions Grid Component ---
const SuggestionsGrid = ({ suggestions, onApply, onDelete, onOpenModal }) => (
  <Grid container spacing={2}>
    {suggestions.map((song) => (
      <Grid item xs={12} sm={6} md={4} key={song.id}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {song.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {song.content.length > 100 ? song.content.substring(0, 100) + "..." : song.content}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" startIcon={<Edit />} onClick={() => onApply(song)}>
              Apply
            </Button>
            <Button size="small" startIcon={<Delete />} onClick={() => onDelete(song)} color="error">
              Delete
            </Button>
            <Button size="small" startIcon={<InfoIcon />} onClick={() => onOpenModal(song)}>
              Info
            </Button>
          </CardActions>
        </Card>
      </Grid>
    ))}
  </Grid>
);

// --- Delete Confirmation Dialog ---
const DeleteDialog = ({ open, onCancel, onConfirm, suggestionToDelete }) => (
  <Dialog open={open} onClose={onCancel} TransitionComponent={Transition}>
    <DialogTitle>Delete Suggestion</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete the suggestion for "{suggestionToDelete?.title}"?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm} color="error">
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

// --- Song Modal Component ---
const SongModal = ({ open, onClose, selectedSong }) => (
  <Modal open={open} onClose={onClose} closeAfterTransition>
    <Slide direction="up" in={open} mountOnEnter unmountOnExit>
      <Box
        sx={{
          p: 4,
          margin: "auto",
          marginTop: 5,
          width: "90%",
          maxWidth: 600,
          maxHeight: "80vh",
          overflowY: "auto",
          backgroundColor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h5" gutterBottom>
          {selectedSong.title}
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {selectedSong.content}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </Box>
      </Box>
    </Slide>
  </Modal>
);

// --- Main Component ---
const SuggestedSongs = () => {
  const [loading, setLoading] = useState(true);
  const [groupedSuggestions, setGroupedSuggestions] = useState({});
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [suggestionToDelete, setSuggestionToDelete] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [sortOrder, setSortOrder] = useState("asc");

  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // --- Fetch Suggestions from Firestore ---
  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
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
      const collections = Object.keys(grouped);
      if (collections.length > 0) {
        setSelectedCollection(collections[0]);
      }
    } catch (err) {
      setError("Failed to fetch suggestions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // --- Handlers ---
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
    setPage(0);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // --- Filter and Sort Suggestions ---
  const filteredSuggestions = useMemo(() => {
    if (!selectedCollection) return [];
    const suggestions = groupedSuggestions[selectedCollection] || [];
    const filtered = suggestions.filter((song) =>
      song.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    return filtered.sort((a, b) => {
      if (a.title < b.title) return sortOrder === "asc" ? -1 : 1;
      if (a.title > b.title) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [debouncedSearchTerm, groupedSuggestions, selectedCollection, sortOrder]);

  // --- Pagination ---
  const paginatedSuggestions = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSuggestions.slice(start, start + rowsPerPage);
  }, [filteredSuggestions, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );

  const collections = Object.keys(groupedSuggestions);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* --- AppBar Header --- */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Suggested Songs
          </Typography>
          <Button color="inherit" onClick={fetchSuggestions} startIcon={<Refresh />}>
            Refresh
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        {/* --- Search and Sort Controls --- */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Search suggestions..."
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {searchTerm && (
                    <IconButton onClick={() => setSearchTerm("")}>
                      <Close />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
          <IconButton onClick={toggleSortOrder} sx={{ ml: 1 }}>
            {sortOrder === "asc" ? <ArrowUpward /> : <ArrowDownward />}
          </IconButton>
        </Box>

        {/* --- Collections Tabs --- */}
        {collections.length > 0 && (
          <CollectionsTabs
            collections={collections}
            selectedCollection={selectedCollection}
            onSelectCollection={(newCollection) => {
              setSelectedCollection(newCollection);
              setPage(0);
            }}
          />
        )}

        {/* --- Suggestions Grid --- */}
        {selectedCollection ? (
          filteredSuggestions.length > 0 ? (
            <>
              <SuggestionsGrid
                suggestions={paginatedSuggestions}
                onApply={handleApplySuggestion}
                onDelete={handleDeleteClick}
                onOpenModal={handleOpenModal}
              />
              <Paper sx={{ mt: 2 }}>
                <TablePagination
                  component="div"
                  count={filteredSuggestions.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[6, 12, 24]}
                />
              </Paper>
            </>
          ) : (
            <Typography variant="body1" align="center" sx={{ mt: 4 }}>
              No suggestions available in this collection.
            </Typography>
          )
        ) : (
          <Typography variant="body1" align="center" sx={{ mt: 4 }}>
            Please select a collection.
          </Typography>
        )}
      </Box>

      {/* --- Delete Confirmation Dialog --- */}
      <DeleteDialog
        open={openDialog}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        suggestionToDelete={suggestionToDelete}
      />

      {/* --- Song Modal --- */}
      {selectedSong && (
        <SongModal open={openModal} onClose={handleCloseModal} selectedSong={selectedSong} />
      )}

      {/* --- Snackbar for Notifications --- */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={6000}
        onClose={() => setSnackOpen(false)}
        message={snackMessage}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={() => setSnackOpen(false)}>
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default SuggestedSongs;
