import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

const CollectionFormFields = ({
  formData,
  setFormData,
  editingId,
  error,
  onSubmit,
  onCancel,
  loading,
}) => {
  const handleDisplayNameChange = (index, value) => {
    const newDisplayNames = [...formData.displayName];
    newDisplayNames[index] = value;
    setFormData({ ...formData, displayName: newDisplayNames });
  };

  return (
    <Card variant="outlined" sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {editingId ? "Edit Collection" : "Create New Collection"}
        </Typography>
        <Box component="form" onSubmit={onSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
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
            
            {/* Multilingual Display Names */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Display Name (Gujarati)"
                variant="outlined"
                fullWidth
                value={formData.displayName[0]}
                onChange={(e) => handleDisplayNameChange(0, e.target.value)}
                error={!!error}
                placeholder="સ્મિત"
                InputProps={{
                  style: { fontFamily: 'Noto Sans Gujarati, sans-serif' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Display Name (Hindi)"
                variant="outlined"
                fullWidth
                value={formData.displayName[1]}
                onChange={(e) => handleDisplayNameChange(1, e.target.value)}
                error={!!error}
                placeholder="स्मित"
                InputProps={{
                  style: { fontFamily: 'Noto Sans Devanagari, sans-serif' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Display Name (English)"
                variant="outlined"
                fullWidth
                value={formData.displayName[2]}
                onChange={(e) => handleDisplayNameChange(2, e.target.value)}
                error={!!error}
                placeholder="Smit"
              />
            </Grid>

            <Grid item xs={12}>
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
              <Grid item xs={12}>
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
                {loading ? "Loading..." : editingId ? "Update Collection" : "Submit"}
              </Button>
            </Grid>
            {editingId && (
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={onCancel}
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
  );
};

export default CollectionFormFields;