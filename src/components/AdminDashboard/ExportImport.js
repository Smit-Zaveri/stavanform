import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export const ExportImport = ({ 
  collections = [],
  exportInProgress, 
  importInProgress, 
  onExport, 
  onImport 
}) => {
  const [selectedCollections, setSelectedCollections] = React.useState(new Set());
  const [selectAll, setSelectAll] = React.useState(false);

  const handleSelectAll = (event) => {
    setSelectAll(event.target.checked);
    setSelectedCollections(event.target.checked ? new Set(collections) : new Set());
  };

  const handleSelectCollection = (collection) => {
    const newSelected = new Set(selectedCollections);
    if (newSelected.has(collection)) {
      newSelected.delete(collection);
    } else {
      newSelected.add(collection);
    }
    setSelectedCollections(newSelected);
    setSelectAll(newSelected.size === collections.length);
  };

  const handleExport = (format) => {
    selectedCollections.forEach(collection => {
      onExport(collection, format);
    });
  };

  const handleImport = (event, format) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Extract collection name from file name
    const fileName = file.name.split('-')[1]?.split('.')[0];
    if (fileName && collections.includes(fileName)) {
      onImport(event, fileName);
    } else {
      alert('Please select a valid collection file');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Export / Import Collections</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                    color="primary"
                  />
                }
                label="Select All Collections"
              />
            </Box>
            <List sx={{ maxHeight: '400px', overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              {collections.map((collection) => (
                <ListItem
                  key={collection}
                  dense
                  button
                  onClick={() => handleSelectCollection(collection)}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <Checkbox
                    edge="start"
                    checked={selectedCollections.has(collection)}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemText primary={collection} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>Export Selected Collections</Typography>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('json')}
                disabled={exportInProgress || selectedCollections.size === 0}
                sx={{ mb: 1 }}
              >
                Export as JSON
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('csv')}
                disabled={exportInProgress || selectedCollections.size === 0}
              >
                Export as CSV
              </Button>
            </Box>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>Import Collection</Typography>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={importInProgress}
                sx={{ mb: 1 }}
              >
                Import JSON
                <input
                  type="file"
                  hidden
                  accept=".json"
                  onChange={(e) => handleImport(e, 'json')}
                  onClick={(e) => e.target.value = null}
                />
              </Button>
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
                  onChange={(e) => handleImport(e, 'csv')}
                  onClick={(e) => e.target.value = null}
                />
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};