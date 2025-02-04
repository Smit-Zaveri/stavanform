import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { firestore } from "./firebase";

const CollectionForm = ({ collectionName }) => {
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    numbering: 1,
    picture: "",
  });
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const fileInputRef = useRef();

  // Fetch collections from Firestore
  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await firestore
        .collection(collectionName)
        .orderBy("numbering")
        .get();
      const collectionList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCollections(collectionList);
      setError("");
      setSelectedIds([]); // Clear any selections on refresh
    } catch (error) {
      setError("Error fetching collections. Please try again.");
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Handle form submission for add/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, displayName, numbering, picture } = formData;
    // Make picture optional by not including it in validation
    if (!name || !displayName || !numbering) {
      setError(
        "Please fill in all required fields and provide a valid order number."
      );
      return;
    }
    setLoading(true);
    try {
      const collectionData = { name, displayName, numbering, picture };
      if (editingId) {
        await firestore
          .collection(collectionName)
          .doc(editingId)
          .update(collectionData);
        setSnackbar({
          open: true,
          message: "Collection updated successfully.",
          severity: "success",
        });
      } else {
        await firestore.collection(collectionName).add(collectionData);
        setSnackbar({
          open: true,
          message: "Collection added successfully.",
          severity: "success",
        });
      }
      resetForm();
      fetchCollections();
    } catch (error) {
      setError("Error adding/updating collection. Please try again.");
      console.error("Error adding/updating collection:", error);
      setSnackbar({
        open: true,
        message: "Error adding/updating collection. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit an existing collection – load values into form
  const handleEditCollection = (collection) => {
    setEditingId(collection.id);
    setFormData({
      name: collection.name,
      displayName: collection.displayName,
      numbering: collection.numbering,
      picture: collection.picture,
    });
    setError("");
  };

  // Delete a single collection with confirmation
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
    setLoading(true);
    try {
      if (collectionToDelete) {
        // Deleting a single collection
        await firestore
          .collection(collectionName)
          .doc(collectionToDelete)
          .delete();
        setSnackbar({
          open: true,
          message: "Collection deleted successfully.",
          severity: "success",
        });
      } else {
        // Deleting selected collections
        const batch = firestore.batch();
        selectedIds.forEach((id) => {
          const docRef = firestore.collection(collectionName).doc(id);
          batch.delete(docRef);
        });
        await batch.commit();
        setSnackbar({
          open: true,
          message: "Selected collections deleted successfully.",
          severity: "success",
        });
      }
      fetchCollections();
    } catch (error) {
      setError("Error deleting collection(s). Please try again.");
      console.error("Error deleting collection(s):", error);
      setSnackbar({
        open: true,
        message: "Error deleting collection(s). Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
    }
  };

  // Toggle selection for all filtered collections
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCollections.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCollections.map((coll) => coll.id));
    }
  };

  // Toggle selection for a collection
  const toggleSelect = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  // Reset form to default state
  const resetForm = () => {
    setFormData({
      name: "",
      displayName: "",
      numbering: collections.length + 1,
      picture: "",
    });
    setEditingId(null);
    setError("");
  };

  // Handle closing the snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Export current collections to CSV
  const exportToCSV = () => {
    const csvHeaders = ["Name", "Display Name", "Order Number", "Picture URL"];
    const csvRows = collections.map(
      ({ name, displayName, numbering, picture }) => [
        name,
        displayName,
        numbering,
        picture,
      ]
    );

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${collectionName}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import collections from CSV file
  const importFromCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const csvRows = text.split("\n");
      const headers = csvRows[0]
        ?.split(",")
        ?.map((header) => header.replace(/"/g, "").trim());

      const nameIndex = headers.indexOf("Name");
      const displayNameIndex = headers.indexOf("Display Name");
      const numberingIndex = headers.indexOf("Order Number");
      // Picture URL is now optional
      const pictureIndex = headers.indexOf("Picture URL");

      if (
        nameIndex === -1 ||
        displayNameIndex === -1 ||
        numberingIndex === -1
      ) {
        setError(
          "CSV must have Name, Display Name, and Order Number columns. Picture URL is optional."
        );
        setSnackbar({
          open: true,
          message: "CSV import failed due to missing required columns.",
          severity: "error",
        });
        return;
      }

      const parsedData = csvRows.slice(1).map((row) => {
        const values = row
          ?.split(",")
          .map((value) => value.replace(/^"?|"$/g, ""));
        if (values.length < headers.length) return null;
        return {
          name: values[nameIndex]?.trim(),
          displayName: values[displayNameIndex]?.trim(),
          numbering: parseFloat(values[numberingIndex]?.trim()),
          // If Picture URL column exists, use its value; otherwise default to an empty string.
          picture: pictureIndex !== -1 ? values[pictureIndex]?.trim() : "",
        };
      });

      const existingNames = collections.map((collection) =>
        collection.name.toLowerCase()
      );
      const newCollectionNames = new Set();

      const validData = [];
      parsedData.forEach((item) => {
        if (!item || !item.name || !item.displayName || isNaN(item.numbering))
          return;

        const normalizedName = item.name.toLowerCase();
        if (
          existingNames.includes(normalizedName) ||
          newCollectionNames.has(normalizedName)
        ) {
          return;
        }
        validData.push(item);
        newCollectionNames.add(normalizedName);
      });

      if (validData.length === 0) {
        setError("No valid data to import.");
        setSnackbar({
          open: true,
          message: "No valid data to import.",
          severity: "warning",
        });
        resetForm();
        return;
      }

      const batch = firestore.batch();
      validData.forEach((item) => {
        const docRef = firestore.collection(collectionName).doc();
        batch.set(docRef, {
          name: item.name,
          displayName: item.displayName,
          numbering: item.numbering,
          picture: item.picture,
        });
      });

      batch
        .commit()
        .then(() => {
          fetchCollections();
          setSnackbar({
            open: true,
            message: `Imported ${validData.length} entries successfully.`,
            severity: "success",
          });
        })
        .catch(() => {
          setError("Error importing collections. Please try again.");
          setSnackbar({
            open: true,
            message: "Error importing collections. Please try again.",
            severity: "error",
          });
        });
    };
    reader.readAsText(file);
  };

  // Live filter for collections based on search input
  const filteredCollections = collections.filter((coll) =>
    coll.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Form Card */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {editingId
              ? `Edit ${
                  collectionName.charAt(0).toUpperCase() +
                  collectionName.slice(1)
                }`
              : `Create New ${
                  collectionName.charAt(0).toUpperCase() +
                  collectionName.slice(1)
                }`}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Name"
                  variant="outlined"
                  fullWidth
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  error={!!error}
                  helperText={error && " "}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Display Name"
                  variant="outlined"
                  fullWidth
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  error={!!error}
                  helperText={error && " "}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Order Number"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={formData.numbering}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numbering: Number(e.target.value),
                    })
                  }
                  error={!!error}
                  helperText={error && " "}
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <TextField
                  label="Picture URL (Optional)"
                  variant="outlined"
                  fullWidth
                  value={formData.picture}
                  onChange={(e) =>
                    setFormData({ ...formData, picture: e.target.value })
                  }
                  error={!!error}
                  helperText={error && " "}
                />
              </Grid>
              {/* Picture Preview */}
              {formData.picture && (
                <Grid item xs={12} md={6}>
                  <Box
                    component="img"
                    src={formData.picture}
                    alt="Preview"
                    sx={{
                      maxWidth: "100%",
                      maxHeight: "150px",
                      mt: 1,
                      borderRadius: 1,
                      border: "1px solid #ccc",
                    }}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={editingId ? 6 : 12}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading
                    ? "Loading..."
                    : editingId
                    ? "Update Collection"
                    : "Submit"}
                </Button>
              </Grid>
              {editingId && (
                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={resetForm}
                    fullWidth
                    sx={{ py: 1.5 }}
                  >
                    Cancel Edit
                  </Button>
                </Grid>
              )}
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Controls */}
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
                endAdornment: (
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
          {/* Delete Selected Button */}
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

      {/* Collections List */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}{" "}
          List
        </Typography>
        {filteredCollections.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No collections found.
          </Typography>
        ) : (
          <List>
            {/* Select All Option */}
            <ListItem key="select-all">
              <Checkbox
                edge="start"
                checked={
                  filteredCollections.length > 0 &&
                  selectedIds.length === filteredCollections.length
                }
                indeterminate={
                  selectedIds.length > 0 &&
                  selectedIds.length < filteredCollections.length
                }
                onChange={toggleSelectAll}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText primary="Select All" />
            </ListItem>

            {/* Existing collection items */}
            {filteredCollections.map((collection) => (
              <React.Fragment key={collection.id}>
                <ListItem
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    py: 1,
                  }}
                  secondaryAction={
                    <Box>
                      <IconButton
                        onClick={() => handleEditCollection(collection)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteCollection(collection.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <Checkbox
                    edge="start"
                    checked={selectedIds.includes(collection.id)}
                    onChange={() => toggleSelect(collection.id)}
                    tabIndex={-1}
                    disableRipple
                  />
                  {collection.picture && (
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        src={collection.picture}
                        alt={collection.name}
                        sx={{ width: 50, height: 50, mr: 2 }}
                      />
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    primary={`#${collection.numbering} - ${collection.name}`}
                    secondary={collection.displayName}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Snackbar for Notifications */}
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
