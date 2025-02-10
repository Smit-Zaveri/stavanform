import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { sidebarConfigRef } from '../firebase';

const defaultMenuItem = {
  name: '',
  path: '',
  icon: 'collections',
  type: 'collection',
  collection: ''
};

// A helper function to reorder items in an array
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const AdminDashboard = () => {
  const [sidebarItems, setSidebarItems] = useState([]);
  const [newMenuItem, setNewMenuItem] = useState(defaultMenuItem);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // Use a ref to store the index of the currently dragged item
  const dragItemIndex = useRef(null);

  useEffect(() => {
    loadNavItems();
  }, []);

  const loadNavItems = async () => {
    setLoading(true);
    try {
      const doc = await sidebarConfigRef.doc('main').get();
      if (doc.exists) {
        const items = doc.data().items || [];
        // Sort items by their order value
        const sortedItems = items.sort((a, b) => (a.order || 0) - (b.order || 0));
        setSidebarItems(sortedItems);
      }
      setError(null);
    } catch (error) {
      console.error('Error loading navigation items:', error);
      setError('Failed to load menu items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // When dragging starts, record the index of the item being dragged
  const handleDragStart = (e, index) => {
    dragItemIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
    // Optionally, you can set a custom drag image
    // e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
  };

  // Prevent the default behavior to allow a drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // When an item is dropped, determine its new index and reorder the list
  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = dragItemIndex.current;
    // If dropped onto itself or if dragIndex is not defined, do nothing
    if (dragIndex === null || dragIndex === dropIndex) {
      return;
    }
    const newItems = reorder(sidebarItems, dragIndex, dropIndex);
    setSidebarItems(newItems);
    dragItemIndex.current = null;
    try {
      // Update Firestore with the new order
      await sidebarConfigRef.doc('main').set({
        items: newItems.map((item, index) => ({
          ...item,
          order: index,
        })),
      });
    } catch (error) {
      console.error('Error reordering items:', error);
      setError('Failed to reorder items. Please try again.');
    }
  };

  const handleAddMenuItem = async () => {
    if (!newMenuItem.name || !newMenuItem.path) return;

    try {
      const newItem = {
        ...newMenuItem,
        id: Date.now().toString(),
        order: sidebarItems.length,
      };

      const updatedItems = [...sidebarItems, newItem];
      await sidebarConfigRef.doc('main').set({
        items: updatedItems.map((item, index) => ({
          ...item,
          order: index,
        })),
      });
      setSidebarItems(updatedItems);
      setNewMenuItem(defaultMenuItem);
    } catch (error) {
      console.error('Error adding menu item:', error);
      setError('Failed to add menu item. Please try again.');
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingItem.name || !editingItem.path) return;

    try {
      const updatedItems = sidebarItems.map(item =>
        item.id === editingItem.id ? editingItem : item
      );
      
      await sidebarConfigRef.doc('main').set({
        items: updatedItems.map((item, index) => ({
          ...item,
          order: index,
        })),
      });
      
      setSidebarItems(updatedItems);
      setIsEditDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating menu item:', error);
      setError('Failed to update menu item. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const updatedItems = sidebarItems.filter(item => item.id !== itemId);
      await sidebarConfigRef.doc('main').set({
        items: updatedItems.map((item, index) => ({
          ...item,
          order: index,
        })),
      });
      setSidebarItems(updatedItems);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setError('Failed to delete menu item. Please try again.');
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Navbar Configuration
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add Menu Item
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Menu Item Name"
                value={newMenuItem.name}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Path"
                value={newMenuItem.path}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, path: e.target.value })}
                fullWidth
                margin="normal"
                helperText="e.g., /list-song/lyrics, /collection"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Icon"
                value={newMenuItem.icon}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, icon: e.target.value })}
                fullWidth
                margin="normal"
              >
                <MenuItem value="collections">Collections</MenuItem>
                <MenuItem value="label">Label</MenuItem>
                <MenuItem value="music">Music</MenuItem>
                <MenuItem value="note">Note</MenuItem>
                <MenuItem value="playlist">Playlist</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Item Type"
                value={newMenuItem.type}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, type: e.target.value })}
                fullWidth
                margin="normal"
              >
                <MenuItem value="collection">Collection</MenuItem>
                <MenuItem value="listSong">List Songs</MenuItem>
                <MenuItem value="suggestedSongs">Suggested Songs</MenuItem>
              </TextField>
            </Grid>
            {newMenuItem.type === 'collection' && (
              <Grid item xs={12} md={6}>
                <TextField
                  label="Collection Name"
                  value={newMenuItem.collection}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, collection: e.target.value })}
                  fullWidth
                  margin="normal"
                  helperText="Required for collection type"
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddMenuItem}
                startIcon={<AddIcon />}
              >
                Add Menu Item
              </Button>
            </Grid>
          </Grid>

          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Menu Items (Drag to Reorder)
            </Typography>
            <Box
              sx={{
                height: sidebarItems.length > 6 ? '400px' : 'auto',
                maxHeight: '400px',
                overflowY: 'auto',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                position: 'relative',
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                  background: (theme) => theme.palette.divider,
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: (theme) => theme.palette.action.hover,
                },
              }}
            >
              <List
                sx={{
                  bgcolor: 'background.paper',
                  p: 1,
                  '& .MuiListItem-root': {
                    pl: 2,
                    pr: 1,
                    py: 0.5,
                    mb: 0.5,
                    '&:last-child': { mb: 0 },
                  },
                }}
              >
                {sidebarItems.map((item, index) => (
                  <ListItem
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        '& .menu-item-actions': { opacity: 1 },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        cursor: 'grab',
                      }}
                    >
                      <DragIndicatorIcon fontSize="small" color="action" />
                    </Box>
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.type}${item.collection ? ` | ${item.collection}` : ''}`}
                      sx={{
                        m: 0,
                        p: 1,
                        flex: 1,
                        '& .MuiTypography-root': { transition: 'color 0.2s' },
                      }}
                    />
                    <Box
                      className="menu-item-actions"
                      sx={{
                        display: 'flex',
                        gap: 0.5,
                        p: 1,
                        opacity: 0.7,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(item);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Menu Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Menu Item Name"
                value={editingItem?.name || ''}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Path"
                value={editingItem?.path || ''}
                onChange={(e) => setEditingItem({ ...editingItem, path: e.target.value })}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Icon"
                value={editingItem?.icon || 'collections'}
                onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                fullWidth
                margin="normal"
              >
                <MenuItem value="collections">Collections</MenuItem>
                <MenuItem value="label">Label</MenuItem>
                <MenuItem value="music">Music</MenuItem>
                <MenuItem value="note">Note</MenuItem>
                <MenuItem value="playlist">Playlist</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Item Type"
                value={editingItem?.type || 'collection'}
                onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                fullWidth
                margin="normal"
              >
                <MenuItem value="collection">Collection</MenuItem>
                <MenuItem value="listSong">List Songs</MenuItem>
                <MenuItem value="suggestedSongs">Suggested Songs</MenuItem>
              </TextField>
            </Grid>
            {editingItem?.type === 'collection' && (
              <Grid item xs={12}>
                <TextField
                  label="Collection Name"
                  value={editingItem?.collection || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, collection: e.target.value })
                  }
                  fullWidth
                  margin="normal"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
