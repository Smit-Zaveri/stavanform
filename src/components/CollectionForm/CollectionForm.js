import React, { useRef, useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  Snackbar,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useCollections } from "../../hooks/useCollections";
import { useCollectionForm } from "../../hooks/useCollectionForm";
import { useCSVOperations } from "../../hooks/useCSVOperations";
import CollectionFormFields from "./CollectionFormFields";
import CollectionList from "./CollectionList";

const CollectionForm = ({ collectionName }) => {
  const location = useLocation();
  const {
    collections,
    loading,
    error: collectionError,
    fetchCollections,
    addCollection,
    updateCollection,
    deleteCollection,
    deleteMultipleCollections,
  } = useCollections(collectionName);

  const {
    formData,
    setFormData,
    editingId,
    error: formError,
    resetForm,
    setEditData,
    validateForm,
  } = useCollectionForm(collectionName);  // Pass collectionName here

  const { exportToCSV, parseCSVData } = useCSVOperations(collectionName, collections);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  
  const fileInputRef = useRef();

  // Add useEffect to fetch collections on mount
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Add URL change detection
  useEffect(() => {
    resetForm();
  }, [location.pathname]);

  // Add function to get next order number
  const getNextOrderNumber = () => {
    if (!collections || collections.length === 0) return 1;
    const maxOrder = Math.max(...collections.map(c => parseInt(c.order) || 0));
    return maxOrder + 1;
  };

  // Handle form submission for add/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingId) {
        await updateCollection(editingId, formData);
        setSnackbar({
          open: true,
          message: "Collection updated successfully.",
          severity: "success",
        });
      } else {
        // Set the order number for new collections
        const newFormData = {
          ...formData,
          order: getNextOrderNumber().toString()
        };
        await addCollection(newFormData);
        setSnackbar({
          open: true,
          message: "Collection added successfully.",
          severity: "success",
        });
      }
      resetForm();
      fetchCollections();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error adding/updating collection. Please try again.",
        severity: "error",
      });
    }
  };

  // Handle delete operations
  const handleDeleteCollection = (collectionId) => {
    setCollectionToDelete(collectionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setCollectionToDelete(null);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (collectionToDelete) {
        await deleteCollection(collectionToDelete);
        setSnackbar({
          open: true,
          message: "Collection deleted successfully.",
          severity: "success",
        });
      } else {
        await deleteMultipleCollections(selectedIds);
        setSnackbar({
          open: true,
          message: "Selected collections deleted successfully.",
          severity: "success",
        });
      }
      fetchCollections();
      setSelectedIds([]);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error deleting collection(s). Please try again.",
        severity: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
    }
  };

  // Handle CSV import
  const importFromCSV = (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const validData = parseCSVData(event.target.result);
        
        if (validData.length === 0) {
          setSnackbar({
            open: true,
            message: "No valid data to import.",
            severity: "warning",
          });
          return;
        }

        for (const item of validData) {
          await addCollection(item);
        }

        fetchCollections();
        setSnackbar({
          open: true,
          message: `Imported ${validData.length} entries successfully.`,
          severity: "success",
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message || "Error importing collections. Please try again.",
          severity: "error",
        });
      }
    };
    reader.readAsText(file);
  };

  // Selection handling
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCollections.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCollections.map((coll) => coll.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  // Filtering
  const filteredCollections = collections.filter((coll) => {
    const searchLower = searchTerm.toLowerCase();
    // Check collection name
    if (coll.name.toLowerCase().includes(searchLower)) return true;
    // Check display names in all languages
    if (Array.isArray(coll.displayName)) {
      return coll.displayName.some(name => 
        name && name.toLowerCase().includes(searchLower)
      );
    }
    return false;
  });

  // UI event handlers
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Modified setEditData handler to include scroll to top
  const handleEdit = (data) => {
    setEditData(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <CollectionFormFields
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
        error={formError}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        loading={loading}
      />

      <Paper variant="outlined" sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              label="Search Collections"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: loading ? (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ) : (
                  <InputAdornment position="end">
                    <RefreshIcon
                      sx={{ cursor: "pointer" }}
                      onClick={fetchCollections}
                    />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={exportToCSV}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Export to CSV
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="outlined"
              startIcon={<FileUploadIcon />}
              onClick={() => fileInputRef.current.click()}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Import from CSV
            </Button>
            <input
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.length > 0) {
                  importFromCSV(e.target.files[0]);
                }
              }}
            />
          </Grid>
          {selectedIds.length > 0 && (
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteSelected}
                fullWidth
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                Delete Selected ({selectedIds.length})
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      <CollectionList
        collections={filteredCollections}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onEdit={handleEdit}
        onDelete={handleDeleteCollection}
        collectionName={collectionName}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {collectionToDelete
            ? "Delete Collection"
            : `Delete ${selectedIds.length} Selected Collection(s)`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {collectionToDelete
              ? "Are you sure you want to delete this collection?"
              : `Are you sure you want to delete ${selectedIds.length} selected collection(s)?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CollectionForm;