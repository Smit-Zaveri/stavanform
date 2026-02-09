import React from 'react';
import { TableHead, TableRow, TableCell, Checkbox } from '@mui/material';

const TableHeader = ({
  selectedSongIds,
  paginatedSongs,
  handleSelectAll
}) => {
  return (
    <TableHead>
      <TableRow sx={{ bgcolor: '#1a1a1a' }}>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={
              selectedSongIds.length > 0 &&
              selectedSongIds.length < paginatedSongs.length
            }
            checked={
              paginatedSongs.length > 0 &&
              selectedSongIds.length === paginatedSongs.length
            }
            onChange={handleSelectAll}
            sx={{
              color: '#999',
              '&.Mui-checked': { color: '#fff' },
              '&.Mui-indeterminate': { color: '#fff' }
            }}
          />
        </TableCell>
        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Order</TableCell>
        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Title</TableCell>
        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Languages</TableCell>
        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tags</TableCell>
        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;