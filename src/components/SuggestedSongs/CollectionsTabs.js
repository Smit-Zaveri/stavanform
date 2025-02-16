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
    sx={{ mb: 2 }}
  >
    {collections.map((collection) => (
      <Tab key={collection} value={collection} label={collection} />
    ))}
  </Tabs>
);

export default CollectionsTabs;