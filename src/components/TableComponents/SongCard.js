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
      elevation={0}
      sx={{
        mb: 2,
        backgroundColor: report ? "rgba(255,0,0,0.15)" : "#252525",
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#fff', fontWeight: 600 }}>
            {song.title}
          </Typography>
          <Checkbox
            checked={isItemSelected}
            onChange={() => handleSelectSong(song.id)}
            sx={{ 
              color: '#999',
              '&.Mui-checked': { color: '#fff' }
            }}
          />
        </Box>

        {report && (
          <Typography variant="body2" sx={{ color: '#ff6b6b', mb: 1 }}>
            Report: {report.reportText || "—"}
          </Typography>
        )}

        <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
          Order: {song.order != null ? song.order : "—"}
        </Typography>

        {song.tags && song.tags.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {song.tags.map((tag, index) => (
              <Chip 
                key={index} 
                label={tag} 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)'
                }} 
              />
            ))}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
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
          size="small" 
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
      </CardActions>
    </Card>
  );
};

export default SongCard;