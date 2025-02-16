import React from 'react';
import { Grid, Card, CardContent, CardActions, Button, Typography } from '@mui/material';
import { Edit, Delete, Info as InfoIcon } from '@mui/icons-material';

const SuggestionsGrid = ({ suggestions, onApply, onDelete, onOpenModal }) => (
  <Grid container spacing={2}>
    {suggestions.map((song) => (
      <Grid item xs={12} sm={6} md={4} key={song.id}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {song.title}
            </Typography>
            {song.artistName && (
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                By: {song.artistName}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              {song.content.length > 100 ? song.content.substring(0, 100) + "..." : song.content}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" startIcon={<Edit />} onClick={() => onApply(song)}>
              Apply
            </Button>
            <Button size="small" startIcon={<Delete />} onClick={() => onDelete(song)} color="error">
              Delete
            </Button>
            <Button size="small" startIcon={<InfoIcon />} onClick={() => onOpenModal(song)}>
              Info
            </Button>
          </CardActions>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export default SuggestionsGrid;