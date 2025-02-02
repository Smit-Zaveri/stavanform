import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  TextField,
  Typography,
  Divider,
  InputAdornment,
  Grid,
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
  });
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
    const { name, displayName, numbering } = formData;
    if (!name || !displayName || !numbering) {
      setError("Please fill in all fields and provide a valid order number.");
      return;
    }
    setLoading(true);
    try {
      const collectionData = { name, displayName, numbering };
      if (editingId) {
        await firestore
          .collection(collectionName)
          .doc(editingId)
          .update(collectionData);
        setSnackbar({
          open: true,
          message: "Collection updated successfully.",
        });
      } else {
        await firestore.collection(collectionName).add(collectionData);
        setSnackbar({ open: true, message: "Collection added successfully." });
      }
      resetForm();
      fetchCollections();
    } catch (error) {
      setError("Error adding/updating collection. Please try again.");
      console.error("Error adding/updating collection:", error);
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
    });
    setError("");
  };

  // Delete a collection with confirmation
  const handleDeleteCollection = async (collectionId) => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      setLoading(true);
      try {
        await firestore.collection(collectionName).doc(collectionId).delete();
        setSnackbar({
          open: true,
          message: "Collection deleted successfully.",
        });
        fetchCollections();
      } catch (error) {
        setError("Error deleting collection. Please try again.");
        console.error("Error deleting collection:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Reset form to default state
  const resetForm = () => {
    setFormData({
      name: "",
      displayName: "",
      numbering: collections.length + 1,
    });
    setEditingId(null);
    setError("");
  };

  // Handle closing the snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: "" });
  };

  // Export current collections to CSV
  const exportToCSV = () => {
    const csvHeaders = ["Name", "Display Name", "Order Number"];
    const csvRows = collections.map(({ name, displayName, numbering }) => [
      name,
      displayName,
      numbering,
    ]);

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
      if (
        nameIndex === -1 ||
        displayNameIndex === -1 ||
        numberingIndex === -1
      ) {
        setError("CSV must have Name, Display Name, and Order Number columns.");
        setSnackbar({
          open: true,
          message: "CSV import failed due to missing columns.",
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
        setSnackbar({ open: true, message: "No valid data to import." });
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
        });
      });

      batch
        .commit()
        .then(() => {
          fetchCollections();
          setSnackbar({
            open: true,
            message: `Imported ${validData.length} entries successfully.`,
          });
        })
        .catch(() => {
          setError("Error importing collections. Please try again.");
          setSnackbar({
            open: true,
            message: "Error importing collections. Please try again.",
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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" gutterBottom>
        {editingId
          ? `Edit ${
              collectionName.charAt(0).toUpperCase() + collectionName.slice(1)
            }`
          : `Create New ${
              collectionName.charAt(0).toUpperCase() + collectionName.slice(1)
            }`}
      </Typography>

      {/* Form and Controls */}
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mb: 3 }}>
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
              helperText={error}
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
              helperText={error}
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
                setFormData({ ...formData, numbering: Number(e.target.value) })
              }
              error={!!error}
              helperText={error}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              disabled={loading}
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
              >
                Cancel Edit
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Additional Controls: Search, Export/Import, Refresh */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
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
        <Grid
          item
          xs={12}
          md={4}
          sx={{ textAlign: { xs: "center", md: "left" } }}
        >
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={exportToCSV}
            fullWidth
          >
            Export to CSV
          </Button>
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          sx={{ textAlign: { xs: "center", md: "left" } }}
        >
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={() => fileInputRef.current.click()}
            fullWidth
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
      </Grid>

      {/* List of Collections */}
      <Typography variant="h6" sx={{ mt: 3 }}>
        {collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}:
      </Typography>
      <List>
        {filteredCollections.map((collection, index) => (
          <React.Fragment key={collection.id}>
            <ListItem
              sx={{
                display: "flex",
                alignItems: "center",
                paddingY: 1,
              }}
            >
              <ListItemText
                primary={`#${collection.numbering} - ${collection.name}`}
                secondary={collection.displayName}
              />
              <Box sx={{ ml: "auto" }}>
                <IconButton onClick={() => handleEditCollection(collection)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteCollection(collection.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
      />
    </Box>
  );
};

export default CollectionForm;
