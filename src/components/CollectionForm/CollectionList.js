import React from "react";
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Checkbox,
  IconButton,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const CollectionList = ({
  collections,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  collectionName,
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {collectionName.charAt(0).toUpperCase() + collectionName.slice(1)} List
      </Typography>
      {collections.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          No collections found.
        </Typography>
      ) : (
        <List>
          <ListItem key="select-all">
            <Checkbox
              edge="start"
              checked={
                collections.length > 0 &&
                selectedIds.length === collections.length
              }
              indeterminate={
                selectedIds.length > 0 &&
                selectedIds.length < collections.length
              }
              onChange={onToggleSelectAll}
              tabIndex={-1}
              disableRipple
            />
            <ListItemText primary="Select All" />
          </ListItem>

          {collections.map((collection) => (
            <React.Fragment key={collection.id}>
              <ListItem
                sx={{
                  display: "flex",
                  alignItems: "center",
                  py: 1,
                }}
                secondaryAction={
                  <Box>
                    <IconButton onClick={() => onEdit(collection)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => onDelete(collection.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <Checkbox
                  edge="start"
                  checked={selectedIds.includes(collection.id)}
                  onChange={() => onToggleSelect(collection.id)}
                  tabIndex={-1}
                  disableRipple
                />
                {collection.picture && (
                  <ListItemAvatar>
                    <Avatar
                      variant="rounded"
                      src={collection.picture}
                      alt={collection.name}
                      sx={{ width: 50, height: 50, mr: 2 }}
                    />
                  </ListItemAvatar>
                )}
                <ListItemText
                  primary={`#${collection.numbering} - ${collection.name}`}
                  secondary={collection.displayName}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default CollectionList;