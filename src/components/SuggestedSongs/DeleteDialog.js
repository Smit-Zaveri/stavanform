import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { Transition } from './TransitionComponents';

const DeleteDialog = ({ open, onCancel, onConfirm, suggestionToDelete, isBulkDelete, selectedCount }) => (
  <Dialog 
    open={open} 
    onClose={onCancel} 
    TransitionComponent={Transition}
    PaperProps={{
      sx: {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 2,
      }
    }}
  >
    <DialogTitle sx={{ color: '#fff', fontWeight: 600 }}>
      {isBulkDelete ? 'Delete Multiple Suggestions' : 'Delete Suggestion'}
    </DialogTitle>
    <DialogContent>
      <DialogContentText sx={{ color: '#999' }}>
        {isBulkDelete 
          ? `Are you sure you want to delete ${selectedCount} selected suggestion(s)? This action cannot be undone.`
          : `Are you sure you want to delete the suggestion for "${suggestionToDelete?.title}"?`
        }
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ p: 2, pt: 0 }}>
      <Button 
        onClick={onCancel}
        sx={{ 
          color: '#999',
          textTransform: 'none',
          fontWeight: 500
        }}
      >
        Cancel
      </Button>
      <Button 
        onClick={onConfirm} 
        variant="contained"
        sx={{ 
          backgroundColor: '#ff6b6b',
          color: '#fff',
          textTransform: 'none',
          fontWeight: 500,
          '&:hover': { backgroundColor: '#ff5252' }
        }}
      >
        {isBulkDelete ? `Delete ${selectedCount} Item(s)` : 'Delete'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteDialog;
