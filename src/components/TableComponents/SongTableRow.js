import React from 'react';
import {
  TableRow as MuiTableRow,
  TableCell,
  Checkbox,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import { Delete } from '@mui/icons-material';

const SongTableRow = ({
  song,
  report,
  isItemSelected,
  handleSelectSong,
  handleEditClick,
  handleDeleteClick,
  handleResolveClick,
}) => {
  return (
    <MuiTableRow
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
      {report !== undefined && (
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
    </MuiTableRow>
  );
};

export default SongTableRow;