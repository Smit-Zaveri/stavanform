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
          backgroundColor: "#1a1a1a",
          borderRadius: 2,
          boxShadow: 24,
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ color: '#fff', fontWeight: 600, fontSize: '1.5rem' }}
        >
          {selectedSong.title}
        </Typography>

        {selectedSong.artistName && (
          <Typography 
            variant="subtitle1" 
            gutterBottom
            sx={{ color: '#999', fontSize: '1rem' }}
          >
            Artist: {selectedSong.artistName}
          </Typography>
        )}
        <Typography 
          variant="body1" 
          sx={{ 
            whiteSpace: "pre-wrap", 
            mt: 3,
            color: '#ccc',
            lineHeight: 1.8,
            fontSize: '0.95rem'
          }}
        >
          {selectedSong.content}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button 
            onClick={onClose} 
            variant="contained"
            sx={{
              backgroundColor: '#fff',
              color: '#1a1a1a',
              '&:hover': { backgroundColor: '#e0e0e0' },
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Slide>
  </Modal>
);

export default SongModal;
