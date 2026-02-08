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
        backgroundColor: report ? "rgba(255,0,0,0.15)" : "transparent",
        '&:hover': {
          backgroundColor: report ? "rgba(255,0,0,0.2)" : "rgba(255,255,255,0.05)",
        },
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <TableCell padding="checkbox">
        <Checkbox
          checked={isItemSelected}
          onChange={() => handleSelectSong(song.id)}
          sx={{ 
            color: '#999',
            '&.Mui-checked': { color: '#fff' }
          }}
        />
      </TableCell>
      {report !== undefined && (
        <TableCell sx={{ color: '#fff' }}>{report ? report.reportText || "—" : "—"}</TableCell>
      )}
      <TableCell sx={{ color: '#fff' }}>{song.order != null ? song.order : "—"}</TableCell>
      <TableCell>
        <Typography
          variant="subtitle1"
          sx={{
            maxWidth: "200px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: '#fff',
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
            color: '#999',
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
          sx={{
            backgroundColor: '#fff',
            color: '#1a1a1a',
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
          }}
        >
          Edit
        </Button>
        <IconButton 
          onClick={() => handleDeleteClick(song.id)}
          sx={{ color: '#ff6b6b' }}
        >
          <Delete />
        </IconButton>
        {report && (
          <Button
            variant="contained"
            size="small"
            onClick={() => handleResolveClick(report.id)}
            sx={{
              backgroundColor: '#fff',
              color: '#1a1a1a',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            Resolve
          </Button>
        )}
      </TableCell>
    </MuiTableRow>
  );
};

export default SongTableRow;