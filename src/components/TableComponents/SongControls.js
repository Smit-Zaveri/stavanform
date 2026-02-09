import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Fade,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { 
  Save, 
  FileUpload, 
  Add, 
  Clear, 
  FilterList, 
  Sort as SortIcon,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';

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
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  filterOptions,
  setFilterOptions,
  handleClearFilters,
}) => {
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = searchInput || 
    filterOptions.tagFilter || 
    filterOptions.artistFilter || 
    filterOptions.newFlagFilter || 
    filterOptions.reportFilter ||
    sortBy !== 'default';

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'title', label: 'Title' },
    { value: 'order', label: 'Order' },
    { value: 'date', label: 'Date' },
    { value: 'artist', label: 'Artist' },
    { value: 'newFlag', label: 'New' },
    { value: 'reports', label: 'Reports' },
  ];

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortSelect = (value) => {
    setSortBy(value);
    setPage(0);
    handleSortClose();
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const activeFilterCount = [
    filterOptions.tagFilter,
    filterOptions.artistFilter,
    filterOptions.newFlagFilter,
    filterOptions.reportFilter,
  ].filter(Boolean).length;

  return (
    <Box>
      {/* Main Toolbar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: showFilters ? 2 : 3,
          p: 2,
          bgcolor: '#252525',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        {/* Collection Select */}
        <FormControl
          size="small"
          sx={{
            minWidth: { xs: '100%', sm: 180 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: '#1a1a1a',
              height: 40,
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
              fontSize: '0.875rem',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#fff',
            },
            '& .MuiSelect-select': {
              color: '#fff',
              fontSize: '0.9rem',
            },
            '& .MuiSelect-icon': {
              color: '#999',
            },
          }}
        >
          <InputLabel>Collection</InputLabel>
          <Select
            value={selectedCollection}
            onChange={handleCollectionChange}
            label="Collection"
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#1a1a1a',
                  color: '#fff',
                  '& .MuiMenuItem-root': {
                    color: '#fff',
                    fontSize: '0.875rem',
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

        {/* Search */}
        <TextField
          placeholder="Search songs..."
          variant="outlined"
          size="small"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(0);
          }}
          sx={{
            flex: 1,
            minWidth: { xs: '100%', sm: 200 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: '#1a1a1a',
              height: 40,
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
              fontSize: '0.9rem',
              '&::placeholder': {
                color: '#666',
                opacity: 1,
              },
            },
          }}
        />

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          flexWrap: 'wrap',
          justifyContent: { xs: 'flex-start', sm: 'flex-end' }
        }}>
          {/* Sort Button */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSortClick}
              startIcon={<SortIcon sx={{ fontSize: 18 }} />}
              endIcon={sortBy !== 'default' && (
                <Chip 
                  label={sortOptions.find(o => o.value === sortBy)?.label}
                  size="small"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    ml: 0.5
                  }}
                />
              )}
              sx={{
                height: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.4)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              Sort
            </Button>
            <IconButton
              size="small"
              onClick={toggleSortOrder}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.4)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              {sortOrder === 'asc' ? <ArrowUpward sx={{ fontSize: 18 }} /> : <ArrowDownward sx={{ fontSize: 18 }} />}
            </IconButton>
          </Box>

          {/* Filter Button */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowFilters(!showFilters)}
            startIcon={<FilterList sx={{ fontSize: 18 }} />}
            endIcon={activeFilterCount > 0 && (
              <Chip 
                label={activeFilterCount}
                size="small"
                sx={{ 
                  height: 20, 
                  fontSize: '0.7rem',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  ml: 0.5
                }}
              />
            )}
            sx={{
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              borderColor: showFilters ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
              bgcolor: showFilters ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: '#fff',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.4)',
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            Filter
          </Button>

          {hasActiveFilters && (
            <IconButton
              size="small"
              onClick={handleClearFilters}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#ff6b6b',
                '&:hover': {
                  borderColor: 'rgba(255,107,107,0.5)',
                  backgroundColor: 'rgba(255,107,107,0.1)',
                },
              }}
            >
              <Clear sx={{ fontSize: 18 }} />
            </IconButton>
          )}

          {/* Divider */}
          <Box sx={{ 
            width: '1px', 
            height: 40, 
            bgcolor: 'rgba(255,255,255,0.1)',
            display: { xs: 'none', sm: 'block' }
          }} />

          {/* Action Buttons */}
          <Button
            variant="contained"
            size="small"
            startIcon={<Save sx={{ fontSize: 18 }} />}
            onClick={exportData}
            sx={{
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              backgroundColor: '#fff',
              color: '#1a1a1a',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            Export
          </Button>

          <Button
            variant="contained"
            size="small"
            component="label"
            startIcon={<FileUpload sx={{ fontSize: 18 }} />}
            sx={{
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              backgroundColor: '#fff',
              color: '#1a1a1a',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            Import
            <input type="file" accept=".csv" hidden onChange={handleImport} />
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<Add sx={{ fontSize: 18 }} />}
            onClick={handleAddNewClick}
            sx={{
              height: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              backgroundColor: '#fff',
              color: '#1a1a1a',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            Add
          </Button>

          {selectedSongIds.length > 0 && (
            <Button
              variant="contained"
              size="small"
              onClick={() => setDeleteDialogOpen(true)}
              sx={{
                height: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                backgroundColor: '#d32f2f',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#b71c1c',
                },
              }}
            >
              Delete ({selectedSongIds.length})
            </Button>
          )}
        </Box>
      </Box>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleSortClose}
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            mt: 1,
          }
        }}
      >
        {sortOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleSortSelect(option.value)}
            sx={{
              color: '#fff',
              fontSize: '0.9rem',
              minWidth: 150,
              bgcolor: sortBy === option.value ? 'rgba(255,255,255,0.15)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Collapsible Filter Panel */}
      <Fade in={showFilters}>
        <Box sx={{ display: showFilters ? 'block' : 'none' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              flexWrap: 'wrap',
              gap: 2,
              mb: 3,
              p: 2,
              bgcolor: '#1f1f1f',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <TextField
              placeholder="Filter by tag"
              variant="outlined"
              size="small"
              value={filterOptions.tagFilter}
              onChange={(e) => {
                setFilterOptions(prev => ({ ...prev, tagFilter: e.target.value }));
                setPage(0);
              }}
              sx={{
                minWidth: { xs: '100%', md: 150 },
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#252525',
                  height: 36,
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
                  fontSize: '0.875rem',
                  '&::placeholder': {
                    color: '#666',
                    opacity: 1,
                  },
                },
              }}
            />

            <TextField
              placeholder="Filter by artist"
              variant="outlined"
              size="small"
              value={filterOptions.artistFilter}
              onChange={(e) => {
                setFilterOptions(prev => ({ ...prev, artistFilter: e.target.value }));
                setPage(0);
              }}
              sx={{
                minWidth: { xs: '100%', md: 150 },
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#252525',
                  height: 36,
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
                  fontSize: '0.875rem',
                  '&::placeholder': {
                    color: '#666',
                    opacity: 1,
                  },
                },
              }}
            />

            <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: { xs: '100%', md: 'auto' } }}>
              <Button
                variant={filterOptions.newFlagFilter === 'new' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => {
                  setFilterOptions(prev => ({ 
                    ...prev, 
                    newFlagFilter: prev.newFlagFilter === 'new' ? '' : 'new' 
                  }));
                  setPage(0);
                }}
                sx={{
                  flex: 1,
                  height: 36,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: filterOptions.newFlagFilter === 'new' ? '#1a1a1a' : '#fff',
                  bgcolor: filterOptions.newFlagFilter === 'new' ? '#fff' : 'transparent',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.4)',
                    bgcolor: filterOptions.newFlagFilter === 'new' ? '#e0e0e0' : 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                New Only
              </Button>

              <Button
                variant={filterOptions.reportFilter === 'reported' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => {
                  setFilterOptions(prev => ({ 
                    ...prev, 
                    reportFilter: prev.reportFilter === 'reported' ? '' : 'reported' 
                  }));
                  setPage(0);
                }}
                sx={{
                  flex: 1,
                  height: 36,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: filterOptions.reportFilter === 'reported' ? '#1a1a1a' : '#fff',
                  bgcolor: filterOptions.reportFilter === 'reported' ? '#fff' : 'transparent',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.4)',
                    bgcolor: filterOptions.reportFilter === 'reported' ? '#e0e0e0' : 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                Has Reports
              </Button>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

export default SongControls;
