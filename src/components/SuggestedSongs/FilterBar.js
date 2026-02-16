import React from 'react';
import { Box, TextField, Button, ToggleButton, ToggleButtonGroup, Chip, MenuItem, Select, FormControl } from '@mui/material';
import {
  Search,
  Close,
  GridView,
  ViewList,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';

const FilterBar = ({
  searchTerm,
  onSearchChange,
  sortOrder,
  onToggleSort,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  activeFilter,
  onFilterChange,
  showCollectionFilter,
  collectionFilter,
  onCollectionFilterChange,
  collections,
}) => {
  const filters = [
    { value: 'all', label: 'All' },
    { value: 'recent', label: 'Recent' },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2,
      flexWrap: 'wrap',
    }}>
      {/* Search */}
      <TextField
        placeholder="Search by title or artist..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        sx={{
          minWidth: 280,
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#252525',
            borderRadius: 2,
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255,255,255,0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#fff',
            },
          },
          '& .MuiInputBase-input': {
            color: '#fff',
            fontSize: '0.9rem',
            '&::placeholder': {
              color: '#666',
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <Search sx={{ color: '#666', mr: 1, fontSize: 20 }} />
          ),
          endAdornment: searchTerm && (
            <Close 
              sx={{ 
                color: '#666', 
                fontSize: 18, 
                cursor: 'pointer',
                '&:hover': { color: '#fff' }
              }} 
              onClick={() => onSearchChange('')}
            />
          ),
        }}
      />

      {/* Collection Filter Dropdown (only show in "All" tab) */}
      {showCollectionFilter && (
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={collectionFilter}
            onChange={(e) => onCollectionFilterChange(e.target.value)}
            displayEmpty
            sx={{
              backgroundColor: '#252525',
              color: '#fff',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.1)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.2)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#fff',
              },
              '& .MuiSelect-icon': {
                color: '#999',
              },
            }}
          >
            <MenuItem value="all" sx={{ color: '#fff', bgcolor: '#1a1a1a' }}>
              All Collections
            </MenuItem>
            {collections.map((collection) => (
              <MenuItem 
                key={collection} 
                value={collection}
                sx={{ 
                  color: '#fff', 
                  bgcolor: '#1a1a1a',
                  textTransform: 'capitalize',
                  '&:hover': { bgcolor: '#252525' },
                  '&.Mui-selected': { bgcolor: '#252525' },
                }}
              >
                {collection}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {filters.map((filter) => (
          <Chip
            key={filter.value}
            label={filter.label}
            onClick={() => onFilterChange(filter.value)}
            sx={{
              backgroundColor: activeFilter === filter.value 
                ? '#fff' 
                : '#252525',
              color: activeFilter === filter.value ? '#1a1a1a' : '#999',
              fontWeight: activeFilter === filter.value ? 600 : 500,
              border: '1px solid',
              borderColor: activeFilter === filter.value 
                ? '#fff' 
                : 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: activeFilter === filter.value 
                  ? '#e0e0e0' 
                  : '#2a2a2a',
              },
            }}
          />
        ))}
      </Box>

      <Box sx={{ flex: 1 }} />

      {/* Sort Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          onClick={() => onSortByChange('date')}
          sx={{
            color: sortBy === 'date' ? '#fff' : '#999',
            textTransform: 'none',
            fontWeight: sortBy === 'date' ? 600 : 500,
            minWidth: 'auto',
            px: 1.5,
          }}
        >
          Date
        </Button>
        <Button
          size="small"
          onClick={() => onSortByChange('title')}
          sx={{
            color: sortBy === 'title' ? '#fff' : '#999',
            textTransform: 'none',
            fontWeight: sortBy === 'title' ? 600 : 500,
            minWidth: 'auto',
            px: 1.5,
          }}
        >
          Title
        </Button>
        
        <Button
          size="small"
          onClick={onToggleSort}
          sx={{
            color: '#999',
            minWidth: 'auto',
            px: 1,
          }}
        >
          {sortOrder === 'asc' ? <ArrowUpward sx={{ fontSize: 18 }} /> : <ArrowDownward sx={{ fontSize: 18 }} />}
        </Button>
      </Box>

      {/* View Mode Toggle */}
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={(e, value) => value && onViewModeChange(value)}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            color: '#999',
            borderColor: 'rgba(255,255,255,0.1)',
            '&.Mui-selected': {
              color: '#fff',
              backgroundColor: '#252525',
            },
          },
        }}
      >
        <ToggleButton value="grid">
          <GridView sx={{ fontSize: 18 }} />
        </ToggleButton>
        <ToggleButton value="list">
          <ViewList sx={{ fontSize: 18 }} />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default FilterBar;
