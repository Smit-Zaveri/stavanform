import React from 'react';
import { Tabs, Tab } from '@mui/material';

const CollectionsTabs = ({ collections, selectedCollection, onSelectCollection }) => (
  <Tabs
    value={selectedCollection}
    onChange={(e, newValue) => onSelectCollection(newValue)}
    variant="scrollable"
    scrollButtons="auto"
    indicatorColor="primary"
    textColor="primary"
    sx={{ mb: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
  >
    {collections.map((collection) => (
      <Tab 
        key={collection} 
        value={collection} 
        label={collection}
        sx={{ 
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': { fontWeight: 600 }
        }}
      />
    ))}
  </Tabs>
);

export default CollectionsTabs;
