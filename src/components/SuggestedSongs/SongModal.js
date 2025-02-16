import React from 'react';
import { Modal, Box, Typography, Button, Slide } from '@mui/material';

const SongModal = ({ open, onClose, selectedSong }) => (
  <Modal open={open} onClose={onClose} closeAfterTransition>
    <Slide direction="up" in={open} mountOnEnter unmountOnExit>
      <Box
        sx={{
          p: 4,
          margin: "auto",
          marginTop: 5,
          width: "90%",
          maxWidth: 600,
          maxHeight: "80vh",
          overflowY: "auto",
          backgroundColor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h5" gutterBottom>
          {selectedSong.title}
        </Typography>

        {selectedSong.artistName && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Artist: {selectedSong.artistName}
          </Typography>
        )}
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mt: 2 }}>
          {selectedSong.content}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </Box>
      </Box>
    </Slide>
  </Modal>
);

export default SongModal;