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
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
  Slide,
  TablePagination,
  InputAdornment,
} from "@mui/material";
import {
  Delete,
  Edit,
  Refresh,
  Info as InfoIcon,
  Close,
  ArrowUpward,
  ArrowDownward,
  Search,
  LibraryMusic,
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
    sx={{ mb: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
  >
    {collections.map((collection) => (
      <Tab 
        key={collection} 
        value={collection} 
        label={collection}
        sx={{ 
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': { fontWeight: 600 }
        }}
      />
    ))}
  </Tabs>
);

// --- Suggestions Grid Component ---
const SuggestionsGrid = ({ suggestions, onApply, onDelete, onOpenModal }) => (
  <Grid container spacing={2}>
    {suggestions.map((song) => (
      <Grid item xs={12} sm={6} md={4} key={song.id}>
        <Card 
          elevation={0}
          sx={{
            backgroundColor: '#252525',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.2)',
              backgroundColor: '#2a2a2a',
            }
          }}
        >
          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                color: '#fff',
                fontWeight: 600,
                fontSize: '1.1rem',
                lineHeight: 1.3,
              }}
            >
              {song.title}
            </Typography>
            {song.artistName && (
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: '#999',
                  mb: 1.5,
                  fontSize: '0.85rem'
                }}
              >
                By: {song.artistName}
              </Typography>
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#999',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {song.content.length > 120 ? song.content.substring(0, 120) + "..." : song.content}
            </Typography>
          </CardContent>
          <CardActions sx={{ pt: 1, gap: 1 }}>
            <Button 
              size="small" 
              startIcon={<Edit />} 
              onClick={() => onApply(song)}
              variant="contained"
              sx={{
                backgroundColor: '#fff',
                color: '#1a1a1a',
                '&:hover': { backgroundColor: '#e0e0e0' },
                textTransform: 'none',
                fontWeight: 500,
                minWidth: '70px',
              }}
            >
              Apply
            </Button>
            <Button 
              size="small" 
              startIcon={<Delete />} 
              onClick={() => onDelete(song)} 
              sx={{
                color: '#ff6b6b',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': { backgroundColor: 'rgba(255,107,107,0.1)' }
              }}
            >
              Delete smit
            </Button>
            <Button 
              size="small" 
              startIcon={<InfoIcon />} 
              onClick={() => onOpenModal(song)}
              sx={{
                color: '#999',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' }
              }}
            >
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
  <Dialog 
    open={open} 
    onClose={onCancel} 
    TransitionComponent={Transition}
    PaperProps={{
      sx: {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 2,
      }
    }}
  >
    <DialogTitle sx={{ color: '#fff', fontWeight: 600 }}>
      Delete Suggestion
    </DialogTitle>
    <DialogContent>
      <DialogContentText sx={{ color: '#999' }}>
        Are you sure you want to delete the suggestion for "{suggestionToDelete?.title}"?
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ p: 2, pt: 0 }}>
      <Button 
        onClick={onCancel}
        sx={{ 
          color: '#999',
          textTransform: 'none',
          fontWeight: 500
        }}
      >
        Cancel
      </Button>
      <Button 
        onClick={onConfirm} 
        variant="contained"
        sx={{ 
          backgroundColor: '#ff6b6b',
          color: '#fff',
          textTransform: 'none',
          fontWeight: 500,
          '&:hover': { backgroundColor: '#ff5252' }
        }}
      >
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
          backgroundColor: "#1a1a1a",
          borderRadius: 2,
          boxShadow: 24,
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ color: '#fff', fontWeight: 600, fontSize: '1.5rem' }}
        >
          {selectedSong.title}
        </Typography>

        {selectedSong.artistName && (
          <Typography 
            variant="subtitle1" 
            gutterBottom
            sx={{ color: '#999', fontSize: '1rem' }}
          >
            Artist: {selectedSong.artistName}
          </Typography>
        )}
        <Typography 
          variant="body1" 
          sx={{ 
            whiteSpace: "pre-wrap", 
            mt: 3,
            color: '#ccc',
            lineHeight: 1.8,
            fontSize: '0.95rem'
          }}
        >
          {selectedSong.content}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button 
            onClick={onClose} 
            variant="contained"
            sx={{
              backgroundColor: '#fff',
              color: '#1a1a1a',
              '&:hover': { backgroundColor: '#e0e0e0' },
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
            }}
          >
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
  const handleApplySuggestion = async (suggestion) => {
    // Format the suggestion data to match the song form structure
    const formattedSuggestion = {
      title: suggestion.title,
      content: suggestion.content,
      // Pass artist directly instead of mapping to artistName here
      artist: suggestion.artistName || "",
      tags: suggestion.tags || [],
      order: suggestion.order || "",
      youtube: suggestion.youtube || "",
      newFlag: false,
      newTts: false,
      collection: suggestion.collection
    };
    
    try {
      // Check if song already exists in target collection
      const targetCollection = firestore.collection(suggestion.collection);
      const existingQuery = await targetCollection
        .where("title", "==", suggestion.title)
        .get();

      if (!existingQuery.empty) {
        await firestore.collection("suggestions_new").doc(suggestion.id).delete();
        setGroupedSuggestions((prev) => {
          const updated = { ...prev };
          updated[suggestion.collection] = updated[suggestion.collection].filter(
            (s) => s.id !== suggestion.id
          );
          if (!updated[suggestion.collection].length) {
            delete updated[suggestion.collection];
          }
          return updated;
        });
      }

      // Navigate to add the song
      navigate(`/list-song/${suggestion.collection}`, { 
        state: { 
          suggestion: formattedSuggestion,
          fromSuggestions: true,
          suggestionId: suggestion.id
        } 
      });
    } catch (error) {
      console.error("Error checking/deleting suggestion:", error);
      navigate(`/list-song/${suggestion.collection}`, { 
        state: { 
          suggestion: formattedSuggestion,
          fromSuggestions: true,
          suggestionId: suggestion.id
        } 
      });
    }
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
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        backgroundColor: '#1a1a1a'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#fff' }} />
          <Typography sx={{ mt: 2, color: '#999' }}>
            Loading suggestions...
          </Typography>
        </Box>
      </Box>
    );
  if (error)
    return (
      <Box sx={{ 
        p: 2, 
        backgroundColor: '#1a1a1a', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography color="error" sx={{ textAlign: 'center' }}>
          {error}
        </Typography>
      </Box>
    );

  const collections = Object.keys(groupedSuggestions);

  return (
    <Box sx={{ 
      flexGrow: 1, 
      backgroundColor: '#1a1a1a', 
      minHeight: '100vh' 
    }}>
      {/* --- AppBar Header --- */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h5" 
            sx={{ 
              flexGrow: 1, 
              color: '#fff',
              fontWeight: 600,
              fontSize: '1.5rem'
            }}
          >
            Suggested Songs
          </Typography>
          <Button 
            color="inherit" 
            onClick={fetchSuggestions} 
            startIcon={<Refresh />}
            sx={{ 
              color: '#999',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': { color: '#fff' }
            }}
          >
            Refresh
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {/* --- Search and Sort Controls --- */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <TextField
            variant="outlined"
            placeholder="Search suggestions..."
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#252525',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#fff',
                },
              },
              '& .MuiInputBase-input': {
                color: '#fff',
                '&::placeholder': {
                  color: '#666',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#666' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {searchTerm && (
                    <IconButton 
                      onClick={() => setSearchTerm("")}
                      sx={{ color: '#666', '&:hover': { color: '#fff' } }}
                    >
                      <Close />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
          <IconButton 
            onClick={toggleSortOrder} 
            sx={{ 
              ml: 1,
              color: '#999',
              backgroundColor: '#252525',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              '&:hover': { 
                backgroundColor: '#2a2a2a',
                borderColor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
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
              <Box sx={{
                mt: 3,
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: '#252525',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden',
                '& .MuiTablePagination-root': { color: '#fff' },
                '& .MuiTablePagination-selectIcon': { color: '#fff' },
                '& .MuiIconButton-root': { color: '#fff' },
              }}>
                <TablePagination
                  component="div"
                  count={filteredSuggestions.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[6, 12, 24]}
                />
              </Box>
            </>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              mt: 8, 
              p: 4,
              backgroundColor: '#252525',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Search sx={{ fontSize: 48, color: '#666', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 500 }}>
                No suggestions found
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                Try adjusting your search or check another collection
              </Typography>
            </Box>
          )
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            mt: 8, 
            p: 4,
            backgroundColor: '#252525',
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <LibraryMusic sx={{ fontSize: 48, color: '#666', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 500 }}>
              Select a collection
            </Typography>
            <Typography variant="body2" sx={{ color: '#999' }}>
              Choose a collection above to view suggestions
            </Typography>
          </Box>
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
