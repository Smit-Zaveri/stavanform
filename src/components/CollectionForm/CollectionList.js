import React from "react";
import {
  Paper,
  Card,
  CardContent,
  Avatar,
  Checkbox,
  IconButton,
  Box,
  Typography,
  Stack,
  Chip,
  Grid,
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
  const getLanguageLabel = (index) => {
    switch(index) {
      case 0: return "ગુજરાતી";
      case 1: return "हिंदी";
      case 2: return "English";
      default: return "";
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {collectionName.charAt(0).toUpperCase() + collectionName.slice(1)} List
      </Typography>
      
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Checkbox
          checked={
            collections.length > 0 &&
            selectedIds.length === collections.length
          }
          indeterminate={
            selectedIds.length > 0 &&
            selectedIds.length < collections.length
          }
          onChange={onToggleSelectAll}
        />
        <Typography variant="body2">Select All</Typography>
      </Box>

      {collections.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          No collections found.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {collections.map((collection) => (
            <Grid item xs={12} sm={6} lg={4} xl={3} key={collection.id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%',
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                    <Checkbox
                      checked={selectedIds.includes(collection.id)}
                      onChange={() => onToggleSelect(collection.id)}
                      size="small"
                    />
                    {collection.picture && (
                      <Avatar
                        variant="rounded"
                        src={collection.picture}
                        alt={collection.name}
                        sx={{ width: 50, height: 50, flexShrink: 0 }}
                      />
                    )}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                        #{collection.numbering} - {collection.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <IconButton 
                        onClick={() => onEdit(collection)} 
                        size="small"
                        sx={{ p: 0.5 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        onClick={() => onDelete(collection.id)} 
                        size="small"
                        sx={{ p: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Stack direction="column" spacing={0.75}>
                    {Array.isArray(collection.displayName) && collection.displayName.map((name, index) => (
                      name && (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={getLanguageLabel(index)}
                            size="small"
                            sx={{ 
                              minWidth: 55,
                              height: 20,
                              fontSize: '0.7rem',
                              fontFamily: index === 0 ? 'Noto Sans Gujarati' :
                                        index === 1 ? 'Noto Sans Devanagari' :
                                        'inherit'
                            }}
                          />
                          <Typography 
                            variant="body2" 
                            noWrap
                            sx={{ 
                              fontSize: '0.85rem',
                              fontFamily: index === 0 ? 'Noto Sans Gujarati' :
                                        index === 1 ? 'Noto Sans Devanagari' :
                                        'inherit'
                            }}
                          >
                            {name}
                          </Typography>
                        </Box>
                      )
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default CollectionList;