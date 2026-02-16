import React from 'react';
import { 
  Modal, 
  Box, 
  Typography, 
  Button, 
  IconButton,
  Chip,
  Fade,
} from '@mui/material';
import {
  Close,
  Edit,
  Delete,
  CalendarToday,
  Person,
  Folder,
} from '@mui/icons-material';

const SongModal = ({ open, onClose, selectedSong, onApply, onDelete }) => {
  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
    });
  };

  const handleApply = () => {
    onApply(selectedSong);
    onClose();
  };

  const handleDelete = () => {
    onDelete(selectedSong);
    onClose();
  };

  return (
    <Modal 
      open={open} 
      onClose={onClose}
      closeAfterTransition
    >
      <Fade in={open} timeout={300}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 700,
            maxHeight: '85vh',
            backgroundColor: '#1a1a1a',
            borderRadius: 2,
            boxShadow: 24,
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Box sx={{
            p: 3,
            pb: 2,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#fff', 
                  fontWeight: 600,
                  fontSize: '1.5rem',
                  lineHeight: 1.3,
                }}
              >
                {selectedSong?.title}
              </Typography>
            </Box>

            <IconButton 
              onClick={onClose}
              sx={{ 
                color: '#999',
                '&:hover': {
                  color: '#fff',
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Meta Info */}
          <Box sx={{
            px: 3,
            py: 2,
            backgroundColor: '#252525',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: 3,
            flexWrap: 'wrap',
          }}>
            {selectedSong?.artistName && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person sx={{ fontSize: 18, color: '#999' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                    Artist
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
                    {selectedSong.artistName}
                  </Typography>
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Folder sx={{ fontSize: 18, color: '#999' }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                  Collection
                </Typography>
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500, textTransform: 'capitalize' }}>
                  {selectedSong?.collection}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ fontSize: 18, color: '#999' }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                  Submitted
                </Typography>
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
                  {formatDate(selectedSong?.createdAt)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto',
            p: 3,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '3px',
            },
          }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#ccc',
                lineHeight: 1.8,
                fontSize: '1rem',
                whiteSpace: 'pre-wrap',
              }}
            >
              {selectedSong?.content}
            </Typography>

            {/* Tags */}
            {selectedSong?.tags && selectedSong.tags.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 1 }}>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedSong.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{
                        backgroundColor: '#252525',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* YouTube Link */}
            {selectedSong?.youtube && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 1 }}>
                  YouTube Reference
                </Typography>
                <Typography 
                  variant="body2" 
                  component="a"
                  href={selectedSong.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: '#fff',
                    textDecoration: 'underline',
                    '&:hover': { color: '#ccc' }
                  }}
                >
                  {selectedSong.youtube}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Actions Footer */}
          <Box sx={{
            p: 3,
            pt: 2,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
            backgroundColor: '#252525',
          }}>
            <Button
              variant="outlined"
              startIcon={<Delete />}
              onClick={handleDelete}
              sx={{
                color: '#ff6b6b',
                borderColor: 'rgba(255,107,107,0.3)',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  borderColor: '#ff6b6b',
                  backgroundColor: 'rgba(255,107,107,0.1)',
                },
              }}
            >
              Delete
            </Button>

            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={handleApply}
              sx={{
                backgroundColor: '#fff',
                color: '#1a1a1a',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                },
              }}
            >
              Apply to Songs
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default SongModal;
