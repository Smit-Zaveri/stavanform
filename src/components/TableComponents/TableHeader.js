import React from 'react';
import { TableHead, TableRow, TableCell, Checkbox } from '@mui/material';

const TableHeader = ({
  hasAnyReport,
  selectedSongIds,
  paginatedSongs,
  handleSelectAll
}) => {
  return (
    <TableHead>
      <TableRow>
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
          />
        </TableCell>
        {hasAnyReport && <TableCell>Report Text</TableCell>}
        <TableCell>Order</TableCell>
        <TableCell>Title</TableCell>
        <TableCell>Tags</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;