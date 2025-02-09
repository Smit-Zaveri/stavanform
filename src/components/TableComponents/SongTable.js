import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  IconButton,
  Typography,
  Paper
} from '@mui/material';
import { Delete } from '@mui/icons-material';

const SongTable = ({
  hasAnyReport,
  paginatedSongs,
  selectedSongIds,
  reports,
  handleSelectAll,
  handleSelectSong,
  handleEditClick,
  handleDeleteClick,
  handleResolveClick
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
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
        <TableBody>
          {paginatedSongs.map((song) => {
            const report = reports.find((r) => r.lyricsId === song.id);
            const isItemSelected = selectedSongIds.includes(song.id);
            return (
              <TableRow
                key={song.id}
                sx={{
                  backgroundColor: report ? "rgba(255,0,0,0.1)" : "inherit",
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isItemSelected}
                    onChange={() => handleSelectSong(song.id)}
                  />
                </TableCell>
                {hasAnyReport && (
                  <TableCell>{report ? report.reportText || "—" : "—"}</TableCell>
                )}
                <TableCell>{song.order != null ? song.order : "—"}</TableCell>
                <TableCell>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      maxWidth: "200px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {song.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: "150px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {song.tags ? song.tags.join(", ") : "—"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleEditClick(song)}
                  >
                    Edit
                  </Button>
                  <IconButton onClick={() => handleDeleteClick(song.id)}>
                    <Delete />
                  </IconButton>
                  {report && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleResolveClick(report.id)}
                    >
                      Resolve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SongTable;