import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Modal,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  Slide,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Delete, Edit, Sort, Refresh } from "@mui/icons-material";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";
import { firestore } from "./firebase";

// Transition for Modal and Dialogs
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
  const [sortOrder, setSortOrder] = useState("asc");

  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Function to fetch suggestions
  const fetchSuggestions = async () => {
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
      if (Object.keys(grouped).length > 0) {
        setSelectedCollection(Object.keys(grouped)[0]);
      }
    } catch (err) {
      setError("Failed to fetch suggestions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      await firestore
        .collection("suggestions_new")
        .doc(suggestionToDelete.id)
        .delete();
      setGroupedSuggestions((prev) => {
        const updated = { ...prev };
        updated[suggestionToDelete.collection] = updated[
          suggestionToDelete.collection
        ].filter((s) => s.id !== suggestionToDelete.id);
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

  // Sorting suggestions by title
  const sortedSuggestions = (suggestions) => {
    return suggestions.sort((a, b) => {
      if (a.title < b.title) return sortOrder === "asc" ? -1 : 1;
      if (a.title > b.title) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Filter suggestions based on search and then sort them
  const filteredSuggestions = useMemo(() => {
    if (!selectedCollection) return [];
    const filtered = groupedSuggestions[selectedCollection].filter((song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return sortedSuggestions(filtered);
  }, [searchTerm, groupedSuggestions, selectedCollection, sortedSuggestions]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* AppBar Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          {isSmallScreen && (
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
              aria-label="menu"
            >
              <Sort />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Suggested Songs
          </Typography>
          <Button
            color="inherit"
            onClick={fetchSuggestions}
            startIcon={<Refresh />}
          >
            Refresh
          </Button>
        </Toolbar>
      </AppBar>

      <Grid container>
        {/* Sidebar as Drawer for small screens or a persistent sidebar for larger screens */}
        {isSmallScreen ? (
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
          >
            <Sidebar
              collections={Object.keys(groupedSuggestions)}
              selectedCollection={selectedCollection}
              onSelectCollection={(collection) => {
                setSelectedCollection(collection);
                setDrawerOpen(false);
              }}
            />
          </Drawer>
        ) : (
          <Grid item xs={12} sm={3} md={2}>
            <Sidebar
              collections={Object.keys(groupedSuggestions)}
              selectedCollection={selectedCollection}
              onSelectCollection={setSelectedCollection}
            />
          </Grid>
        )}

        {/* Main Content */}
        <Grid item xs={12} sm={9} md={10}>
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
            toggleSortOrder={toggleSortOrder}
            sortOrder={sortOrder}
          />
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={openDialog}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        suggestionToDelete={suggestionToDelete}
      />

      {/* Full Song Content Modal */}
      {selectedSong && (
        <SongModal
          open={openModal}
          onClose={handleCloseModal}
          selectedSong={selectedSong}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={6000}
        onClose={() => setSnackOpen(false)}
        message={snackMessage}
      />
    </Box>
  );
};

// Sidebar Component
const Sidebar = ({ collections, selectedCollection, onSelectCollection }) => (
  <Box sx={{ width: { xs: 250, sm: 200 }, p: 2 }}>
    <Typography variant="h6" gutterBottom>
      Collections
    </Typography>
    <Divider sx={{ mb: 1 }} />
    {collections.map((collectionName) => (
      <Button
        key={collectionName}
        onClick={() => onSelectCollection(collectionName)}
        fullWidth
        sx={{
          justifyContent: "flex-start",
          mb: 1,
          fontSize: { xs: "0.9rem", sm: "1rem" },
          // No extra background or text colors added.
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
  onChangeRowsPerPage,
  toggleSortOrder,
  sortOrder,
}) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
      {selectedCollection
        ? `Collection: ${selectedCollection}`
        : "Suggested Songs"}
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
          toggleSortOrder={toggleSortOrder}
          sortOrder={sortOrder}
        />
      ) : (
        <Typography variant="body1" align="center">
          No suggestions available for this collection.
        </Typography>
      )
    ) : (
      <Typography variant="body1" align="center">
        Please select a collection.
      </Typography>
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
  onChangeRowsPerPage,
  toggleSortOrder,
  sortOrder,
}) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell onClick={toggleSortOrder} sx={{ cursor: "pointer" }}>
            Title {sortOrder === "asc" ? "▲" : "▼"}
          </TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {suggestions
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((song) => (
            <TableRow key={song.id}>
              <TableCell>{song.title}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onApply(song)} aria-label="apply">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => onDelete(song)} aria-label="delete">
                  <Delete />
                </IconButton>
                <IconButton onClick={() => onOpenModal(song)} aria-label="info">
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
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  >
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
  <Dialog open={open} onClose={onCancel} TransitionComponent={Transition}>
    <DialogTitle>Delete Suggestion</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete the suggestion for "
        {suggestionToDelete?.title}"?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm}>Delete</Button>
    </DialogActions>
  </Dialog>
);

// Song Modal Component
const SongModal = ({ open, onClose, selectedSong }) => (
  <Modal open={open} onClose={onClose} closeAfterTransition>
    <Slide direction="up" in={open} mountOnEnter unmountOnExit>
      <Box
        sx={{
          p: 4,
          margin: "auto",
          mt: 5,
          width: { xs: "90%", sm: "70%", md: "50%" },
          maxHeight: "80vh",
          overflowY: "auto",
          outline: "none",
        }}
      >
        <Typography variant="h5" gutterBottom>
          {selectedSong.title}
        </Typography>
        <Typography variant="body1">{selectedSong.content}</Typography>
        <Box sx={{ textAlign: "right", mt: 2 }}>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Slide>
  </Modal>
);

export default SuggestedSongs;
