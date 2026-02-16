import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';

const CollectionsTabs = ({ collections, selectedCollection, onSelectCollection, groupedSuggestions }) => {
  // Calculate total count for "All" tab
  const totalCount = Object.values(groupedSuggestions).flat().length;
  
  // Create tabs array with "All" first
  const allTabs = ['all', ...collections];
  
  return (
    <Box sx={{ 
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    }}>
      <Tabs
        value={selectedCollection}
        onChange={(e, newValue) => onSelectCollection(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ 
          minHeight: 48,
          '& .MuiTabs-scrollButtons': {
            color: '#999',
            '&.Mui-disabled': { opacity: 0.3 },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#fff',
            height: 2,
          },
        }}
      >
        {/* All Tab */}
        <Tab
          value="all"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>All</span>
              <Box
                sx={{
                  backgroundColor: selectedCollection === 'all' 
                    ? '#fff' 
                    : '#252525',
                  color: selectedCollection === 'all' ? '#1a1a1a' : '#999',
                  borderRadius: 1,
                  px: 0.8,
                  py: 0.2,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  minWidth: 20,
                  textAlign: 'center',
                }}
              >
                {totalCount}
              </Box>
            </Box>
          }
          sx={{
            textTransform: 'none',
            fontWeight: selectedCollection === 'all' ? 600 : 500,
            fontSize: '0.9rem',
            color: selectedCollection === 'all' ? '#fff !important' : '#999 !important',
            minHeight: 48,
            px: 2,
            '&:hover': {
              color: '#ccc !important',
            },
          }}
        />

        {/* Individual Collection Tabs */}
        {collections.map((collection) => {
          const count = groupedSuggestions[collection]?.length || 0;
          const isSelected = selectedCollection === collection;
          
          return (
            <Tab
              key={collection}
              value={collection}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ textTransform: 'capitalize' }}>{collection}</span>
                  <Box
                    sx={{
                      backgroundColor: isSelected 
                        ? '#fff' 
                        : '#252525',
                      color: isSelected ? '#1a1a1a' : '#999',
                      borderRadius: 1,
                      px: 0.8,
                      py: 0.2,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      minWidth: 20,
                      textAlign: 'center',
                    }}
                  >
                    {count}
                  </Box>
                </Box>
              }
              sx={{
                textTransform: 'none',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.9rem',
                color: isSelected ? '#fff !important' : '#999 !important',
                minHeight: 48,
                px: 2,
                '&:hover': {
                  color: '#ccc !important',
                },
              }}
            />
          );
        })}
      </Tabs>
    </Box>
  );
};

export default CollectionsTabs;
