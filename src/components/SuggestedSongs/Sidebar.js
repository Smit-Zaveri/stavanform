import React from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';

const Sidebar = ({ collections, selectedCollection, onSelectCollection }) => (
  <Box sx={{ width: { xs: 250, sm: 200 }, p: 2 }}>
    <Typography variant="h6" gutterBottom>
      Collections
    </Typography>
    <Divider sx={{ mb: 1 }} />
    {collections.map((collectionName) => (
      <Button
        key={collectionName}
        onClick={() => onSelectCollection(collectionName)}
        fullWidth
        sx={{
          justifyContent: "flex-start",
          mb: 1,
          fontSize: { xs: "0.9rem", sm: "1rem" },
        }}
      >
        {collectionName}
      </Button>
    ))}
  </Box>
);

export default Sidebar;