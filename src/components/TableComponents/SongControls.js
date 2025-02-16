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
  const controlHeight = '56px'; // Common height for controls

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 2,
        mb: 3,
      }}
    >
      <FormControl
        size="medium"
        sx={{
          minWidth: 200,
          '& .MuiOutlinedInput-root': { height: controlHeight },
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
          flexGrow: 1,
          minWidth: 200,
          '& .MuiOutlinedInput-root': { height: controlHeight },
        }}
      />

      <Button
        variant="contained"
        startIcon={<Save />}
        onClick={exportData}
        sx={{ height: controlHeight }}
      >
        Export Songs
      </Button>

      <Button
        variant="contained"
        component="label"
        startIcon={<FileUpload />}
        sx={{ height: controlHeight }}
      >
        Import Songs
        <input type="file" accept=".csv" hidden onChange={handleImport} />
      </Button>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={handleAddNewClick}
        sx={{ height: controlHeight }}
      >
        Add New Song
      </Button>

      {selectedSongIds.length > 0 && (
        <Button
          variant="contained"
          color="error"
          onClick={() => setDeleteDialogOpen(true)}
          sx={{ height: controlHeight }}
        >
          Delete Selected ({selectedSongIds.length})
        </Button>
      )}
    </Box>
  );
};

export default SongControls;
