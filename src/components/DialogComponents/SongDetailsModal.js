import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Slide
} from '@mui/material';

const SongDetailsModal = ({ open, onClose, song }) => {
  if (!song) return null;

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            width: { xs: '90%', sm: '70%', md: '50%' },
            maxHeight: '80vh',
            overflowY: 'auto',
            borderRadius: 1,
          }}
        >
          <Typography variant="h5" gutterBottom>
            {song.title}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {song.content}
          </Typography>
          <Box sx={{ textAlign: 'right', mt: 2 }}>
            <Button onClick={onClose}>Close</Button>
          </Box>
        </Box>
      </Slide>
    </Modal>
  );
};

export default SongDetailsModal;