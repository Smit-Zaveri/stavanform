import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { Transition } from './TransitionComponents';

const DeleteDialog = ({ open, onCancel, onConfirm, suggestionToDelete }) => (
  <Dialog open={open} onClose={onCancel} TransitionComponent={Transition}>
    <DialogTitle>Delete Suggestion</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete the suggestion for "{suggestionToDelete?.title}"?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm} color="error">
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteDialog;