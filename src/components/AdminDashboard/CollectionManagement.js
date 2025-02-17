import React from 'react';
import { Card, CardContent, Typography, Grid, Box, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export const CollectionManagement = ({ 
  selectedCollection, 
  exportInProgress, 
  importInProgress, 
  onExport, 
  onImport 
}) => {
  if (!selectedCollection) return null;

  return (
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Collection Management - {selectedCollection}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  onClick={() => onExport(selectedCollection, 'json')}
                  disabled={exportInProgress}
                >
                  Export as JSON
                </Button>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  onClick={() => onExport(selectedCollection, 'csv')}
                  disabled={exportInProgress}
                >
                  Export as CSV
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={importInProgress}
                >
                  Import JSON
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={(e) => onImport(e, selectedCollection)}
                    onClick={(e) => e.target.value = null}
                  />
                </Button>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={importInProgress}
                >
                  Import CSV
                  <input
                    type="file"
                    hidden
                    accept=".csv"
                    onChange={(e) => onImport(e, selectedCollection)}
                    onClick={(e) => e.target.value = null}
                  />
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
};