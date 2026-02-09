import React from 'react';
import { Grid, Card, CardContent, CardActions, Button, Typography } from '@mui/material';
import { Edit, Delete, Info as InfoIcon } from '@mui/icons-material';

const SuggestionsGrid = ({ suggestions, onApply, onDelete, onOpenModal }) => (
  <Grid container spacing={2}>
    {suggestions.map((song) => (
      <Grid item xs={12} sm={6} md={4} key={song.id}>
        <Card 
          elevation={0}
          sx={{
            backgroundColor: '#252525',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.2)',
              backgroundColor: '#2a2a2a',
            }
          }}
        >
          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                color: '#fff',
                fontWeight: 600,
                fontSize: '1.1rem',
                lineHeight: 1.3,
              }}
            >
              {song.title}
            </Typography>
            {song.artistName && (
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: '#999',
                  mb: 1.5,
                  fontSize: '0.85rem'
                }}
              >
                By: {song.artistName}
              </Typography>
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#999',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {song.content.length > 120 ? song.content.substring(0, 120) + "..." : song.content}
            </Typography>
          </CardContent>
          <CardActions sx={{ pt: 1, gap: 1 }}>
            <Button 
              size="small" 
              startIcon={<Edit />} 
              onClick={() => onApply(song)}
              variant="contained"
              sx={{
                backgroundColor: '#fff',
                color: '#1a1a1a',
                '&:hover': { backgroundColor: '#e0e0e0' },
                textTransform: 'none',
                fontWeight: 500,
                minWidth: '70px',
              }}
            >
              Apply
            </Button>
            <Button 
              size="small" 
              startIcon={<Delete />} 
              onClick={() => onDelete(song)} 
              sx={{
                color: '#ff6b6b',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': { backgroundColor: 'rgba(255,107,107,0.1)' }
              }}
            >
              Delete
            </Button>
            <Button 
              size="small" 
              startIcon={<InfoIcon />} 
              onClick={() => onOpenModal(song)}
              sx={{
                color: '#999',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' }
              }}
            >
              Info
            </Button>
          </CardActions>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export default SuggestionsGrid;
