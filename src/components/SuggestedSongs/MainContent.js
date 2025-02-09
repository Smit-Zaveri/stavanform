import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import CollectionTable from './CollectionTable';

const MainContent = ({
  selectedCollection,
  searchTerm,
  onSearchChange,
  filteredSuggestions,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
  onApply,
  onDelete,
  onOpenModal,
  toggleSortOrder,
  sortOrder,
}) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
      {selectedCollection
        ? `Collection: ${selectedCollection}`
        : "Suggested Songs"}
    </Typography>

    <TextField
      variant="outlined"
      placeholder="Search..."
      value={searchTerm}
      onChange={onSearchChange}
      fullWidth
      sx={{ mb: 2 }}
    />

    {selectedCollection ? (
      filteredSuggestions.length > 0 ? (
        <CollectionTable
          collectionName={selectedCollection}
          suggestions={filteredSuggestions}
          onApply={onApply}
          onDelete={onDelete}
          onOpenModal={onOpenModal}
          page={page}
          rowsPerPage={rowsPerPage}
          onChangePage={onChangePage}
          onChangeRowsPerPage={onChangeRowsPerPage}
          toggleSortOrder={toggleSortOrder}
          sortOrder={sortOrder}
        />
      ) : (
        <Typography variant="body1" align="center">
          No suggestions available for this collection.
        </Typography>
      )
    ) : (
      <Typography variant="body1" align="center">
        Please select a collection.
      </Typography>
    )}
  </Box>
);

export default MainContent;