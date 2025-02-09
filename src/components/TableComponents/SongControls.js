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
        gap: 2,
        mb: 3,
        alignItems: 'center',
      }}
    >
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Collection</InputLabel>
        <Select
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
        value={searchInput}
        onChange={(e) => {
          setSearchInput(e.target.value);
          setPage(0);
        }}
        sx={{ flexGrow: 1, minWidth: 200 }}
      />

      <Button variant="contained" startIcon={<Save />} onClick={exportData}>
        Export Songs
      </Button>
      <Button variant="contained" component="label" startIcon={<FileUpload />}>
        Import Songs
        <input type="file" accept=".csv" hidden onChange={handleImport} />
      </Button>
      <Button variant="contained" startIcon={<Add />} onClick={handleAddNewClick}>
        Add New Song
      </Button>
      {selectedSongIds.length > 0 && (
        <Button
          variant="contained"
          color="error"
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete Selected ({selectedSongIds.length})
        </Button>
      )}
    </Box>
  );
};

export default SongControls;