import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Box,
  Checkbox,
  Chip
} from '@mui/material';
import { Delete } from '@mui/icons-material';

const SongCard = ({
  song,
  report,
  isItemSelected,
  handleSelectSong,
  handleEditClick,
  handleDeleteClick,
  handleResolveClick,
}) => {
  return (
    <Card 
      elevation={3}
      sx={{
        mb: 2,
        backgroundColor: report ? "rgba(255,0,0,0.1)" : "inherit",
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" gutterBottom>
            {song.title}
          </Typography>
          <Checkbox
            checked={isItemSelected}
            onChange={() => handleSelectSong(song.id)}
          />
        </Box>

        {report && (
          <Typography variant="body2" color="error" gutterBottom>
            Report: {report.reportText || "—"}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Order: {song.order != null ? song.order : "—"}
        </Typography>

        {song.tags && song.tags.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {song.tags.map((tag, index) => (
              <Chip key={index} label={tag} size="small" />
            ))}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => handleEditClick(song)}
        >
          Edit
        </Button>
        <IconButton size="small" onClick={() => handleDeleteClick(song.id)}>
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
      </CardActions>
    </Card>
  );
};

export default SongCard;