import React from 'react';
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Paper,
  IconButton
} from '@mui/material';
import { Edit, Delete, Info as InfoIcon } from '@mui/icons-material';

const CollectionTable = ({
  suggestions,
  onApply,
  onDelete,
  onOpenModal,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
  toggleSortOrder,
  sortOrder,
}) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell onClick={toggleSortOrder} sx={{ cursor: "pointer" }}>
            Title {sortOrder === "asc" ? "▲" : "▼"}
          </TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {suggestions
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((song) => (
            <TableRow key={song.id}>
              <TableCell>{song.title}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onApply(song)} aria-label="apply">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => onDelete(song)} aria-label="delete">
                  <Delete />
                </IconButton>
                <IconButton onClick={() => onOpenModal(song)} aria-label="info">
                  <InfoIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
    <TablePagination
      rowsPerPageOptions={[5, 10, 25]}
      component="div"
      count={suggestions.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={onChangePage}
      onRowsPerPageChange={onChangeRowsPerPage}
    />
  </TableContainer>
);

export default CollectionTable;