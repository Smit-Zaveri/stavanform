import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  MenuItem,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

export const MenuConfig = ({
  newMenuItem,
  sidebarItems,
  editingItem,
  isEditDialogOpen,
  onNewMenuItemChange,
  onAddMenuItem,
  onEditClick,
  onEditSave,
  onDeleteItem,
  onEditDialogClose,
  onEditingItemChange,
  onDragStart,
  onDragOver,
  onDrop,
}) => (
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
            onChange={(e) => onNewMenuItemChange({ ...newMenuItem, name: e.target.value })}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Path"
            value={newMenuItem.path}
            onChange={(e) => onNewMenuItemChange({ ...newMenuItem, path: e.target.value })}
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
            onChange={(e) => onNewMenuItemChange({ ...newMenuItem, icon: e.target.value })}
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
            onChange={(e) => onNewMenuItemChange({ ...newMenuItem, type: e.target.value })}
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
              onChange={(e) => onNewMenuItemChange({ ...newMenuItem, collection: e.target.value })}
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
            onClick={onAddMenuItem}
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
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, index)}
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
                      onEditClick(item);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
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

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={onEditDialogClose}
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
                onChange={(e) => onEditingItemChange({ ...editingItem, name: e.target.value })}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Path"
                value={editingItem?.path || ''}
                onChange={(e) => onEditingItemChange({ ...editingItem, path: e.target.value })}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Icon"
                value={editingItem?.icon || 'collections'}
                onChange={(e) => onEditingItemChange({ ...editingItem, icon: e.target.value })}
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
                onChange={(e) => onEditingItemChange({ ...editingItem, type: e.target.value })}
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
                    onEditingItemChange({ ...editingItem, collection: e.target.value })
                  }
                  fullWidth
                  margin="normal"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onEditDialogClose}>Cancel</Button>
          <Button onClick={onEditSave} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </CardContent>
  </Card>
);