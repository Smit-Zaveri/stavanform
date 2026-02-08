import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

export const DeleteDialog = ({ open, onClose, onConfirm }) => (
  <Dialog 
    open={open} 
    onClose={onClose}
    PaperProps={{
      sx: {
        bgcolor: '#1a1a1a',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
      }
    }}
  >
    <DialogTitle sx={{ color: '#fff' }}>Confirm Delete</DialogTitle>
    <DialogContent>
      <Typography sx={{ color: '#999' }}>Are you sure you want to delete this song?</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} sx={{ color: '#999' }}>Cancel</Button>
      <Button 
        onClick={onConfirm}
        sx={{ 
          color: '#fff', 
          bgcolor: '#d32f2f', 
          '&:hover': { bgcolor: '#b71c1c' } 
        }}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

export const ResolveDialog = ({ open, onClose, onConfirm }) => (
  <Dialog 
    open={open} 
    onClose={onClose}
    PaperProps={{
      sx: {
        bgcolor: '#1a1a1a',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
      }
    }}
  >
    <DialogTitle sx={{ color: '#fff' }}>Confirm Resolve</DialogTitle>
    <DialogContent>
      <Typography sx={{ color: '#999' }}>
        Are you sure you want to mark this report as resolved?
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} sx={{ color: '#999' }}>Cancel</Button>
      <Button 
        onClick={onConfirm}
        sx={{ 
          color: '#fff', 
          bgcolor: 'rgba(255,255,255,0.1)', 
          '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } 
        }}
      >
        Resolve
      </Button>
    </DialogActions>
  </Dialog>
);