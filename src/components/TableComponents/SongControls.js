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
        mb: 4,
        p: { xs: 2, sm: 3 },
        bgcolor: '#252525',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        flex: 1,
        minWidth: { xs: '100%', sm: 'auto' }
      }}>
        <FormControl
          size="medium"
          sx={{
            minWidth: { xs: '100%', sm: 220 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: '#1a1a1a',
              color: '#fff',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#999',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#fff',
            },
          }}
        >
          <InputLabel id="collection-select-label">Collection</InputLabel>
          <Select
            labelId="collection-select-label"
            value={selectedCollection}
            onChange={handleCollectionChange}
            label="Collection"
            sx={{
              '& .MuiSelect-icon': {
                color: '#999',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#1a1a1a',
                  color: '#fff',
                  '& .MuiMenuItem-root': {
                    color: '#fff',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(255,255,255,0.15)',
                    },
                  },
                },
              },
            }}
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
          placeholder="Search songs or tags"
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
            minWidth: { sm: 250 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: '#1a1a1a',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
            },
            '& .MuiOutlinedInput-input': {
              color: '#fff',
              '&::placeholder': {
                color: '#666',
                opacity: 1,
              },
            },
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
          sx={{
            height: { xs: 'auto', sm: '56px' },
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            backgroundColor: '#fff',
            color: '#1a1a1a',
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
          }}
        >
          Export Songs
        </Button>

        <Button
          variant="contained"
          component="label"
          startIcon={<FileUpload />}
          fullWidth={true}
          sx={{
            height: { xs: 'auto', sm: '56px' },
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            backgroundColor: '#fff',
            color: '#1a1a1a',
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
          }}
        >
          Import Songs
          <input type="file" accept=".csv" hidden onChange={handleImport} />
        </Button>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNewClick}
          fullWidth={true}
          sx={{
            height: { xs: 'auto', sm: '56px' },
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            backgroundColor: '#fff',
            color: '#1a1a1a',
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
          }}
        >
          Add New Song
        </Button>

        {selectedSongIds.length > 0 && (
          <Button
            variant="contained"
            onClick={() => setDeleteDialogOpen(true)}
            fullWidth={true}
            sx={{
              height: { xs: 'auto', sm: '56px' },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              backgroundColor: '#d32f2f',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#b71c1c',
              },
            }}
          >
            Delete Selected ({selectedSongIds.length})
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default SongControls;
