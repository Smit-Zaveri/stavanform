import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from '@mui/material';
import { Save, FileUpload, Add } from '@mui/icons-material';

const SongControls = ({
  selectedCollection,
  handleCollectionChange,
  searchInput,
  setSearchInput,
  setPage,
  exportData,
  handleImport,
  handleAddNewClick,
  selectedSongIds,
  setDeleteDialogOpen,
  collectionList,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        flexWrap: 'wrap',
        alignItems: 'stretch',
        gap: 2,
        mb: 3,
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 2,
        width: { xs: '100%', sm: 'auto' } 
      }}>
        <FormControl
          size="medium"
          sx={{
            minWidth: { xs: '100%', sm: 200 },
          }}
        >
          <InputLabel id="collection-select-label">Collection</InputLabel>
          <Select
            labelId="collection-select-label"
            value={selectedCollection}
            onChange={handleCollectionChange}
            label="Collection"
          >
            {collectionList
              .sort((a, b) => a.numbering - b.numbering)
              .map((coll) => (
                <MenuItem key={coll.id} value={coll.name}>
                  {coll.name.charAt(0).toUpperCase() + coll.name.slice(1)}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <TextField
          label="Search songs or tags"
          variant="outlined"
          size="medium"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(0);
          }}
          sx={{
            flexGrow: { xs: 0, sm: 1 },
            width: { xs: '100%', sm: 'auto' },
            minWidth: { sm: 200 },
          }}
        />
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 2,
        width: { xs: '100%', sm: 'auto' } 
      }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={exportData}
          fullWidth={true}
          sx={{ height: { xs: 'auto', sm: '56px' } }}
        >
          Export Songs
        </Button>

        <Button
          variant="contained"
          component="label"
          startIcon={<FileUpload />}
          fullWidth={true}
          sx={{ height: { xs: 'auto', sm: '56px' } }}
        >
          Import Songs
          <input type="file" accept=".csv" hidden onChange={handleImport} />
        </Button>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNewClick}
          fullWidth={true}
          sx={{ height: { xs: 'auto', sm: '56px' } }}
        >
          Add New Song
        </Button>

        {selectedSongIds.length > 0 && (
          <Button
            variant="contained"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
            fullWidth={true}
            sx={{ height: { xs: 'auto', sm: '56px' } }}
          >
            Delete Selected ({selectedSongIds.length})
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default SongControls;
