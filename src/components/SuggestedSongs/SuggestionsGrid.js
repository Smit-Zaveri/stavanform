import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  IconButton,
  Chip,
  Checkbox,
  Fade,
  TablePagination,
} from '@mui/material';
import {
  Edit,
  Delete,
  Info,
  CalendarToday,
  Person,
  Folder,
} from '@mui/icons-material';

const SuggestionsGrid = ({ 
  suggestions, 
  onApply, 
  onDelete, 
  onOpenModal,
  onSelect,
  selectedIds,
  onSelectAll,
  allSelected,
  someSelected,
  page,
  rowsPerPage,
  count,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Box>
      {/* Select All Header */}
      {suggestions.length > 0 && (
        <Box sx={{
          mb: 2,
          p: 2,
          bgcolor: '#252525',
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={onSelectAll}
            sx={{ color: '#fff', '&.Mui-checked': { color: '#fff' } }}
          />
          <Typography variant="body2" sx={{ color: '#999' }}>
            Select all on this page ({suggestions.length} items)
          </Typography>
        </Box>
      )}

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
        gap: 2,
      }}>
        {suggestions.map((song, index) => (
          <Fade in timeout={300 + index * 50} key={song.id}>
            <Card
              elevation={0}
              sx={{
                backgroundColor: '#252525',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease-in-out',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.2)',
                  backgroundColor: '#2a2a2a',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 2.5, pb: 1.5 }}>
                {/* Checkbox and Collection Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Checkbox
                    checked={selectedIds.includes(song.id)}
                    onChange={() => onSelect(song.id)}
                    sx={{ 
                      color: '#666', 
                      '&.Mui-checked': { color: '#fff' },
                      p: 0.5,
                    }}
                  />
                  <Chip
                    icon={<Folder sx={{ fontSize: 14 }} />}
                    label={song.collection}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: '#ccc',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textTransform: 'capitalize',
                      '& .MuiChip-icon': {
                        color: '#999',
                      },
                    }}
                  />
                </Box>

                {/* Title */}
                <Typography 
                  variant="h6" 
                  sx={{
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    lineHeight: 1.4,
                    mb: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {song.title}
                </Typography>

                {/* Artist */}
                {song.artistName && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Person sx={{ fontSize: 14, color: '#999' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#999',
                        fontSize: '0.875rem',
                      }}
                    >
                      {song.artistName}
                    </Typography>
                  </Box>
                )}

                {/* Preview */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#999',
                    lineHeight: 1.6,
                    fontSize: '0.875rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2,
                  }}
                >
                  {song.content}
                </Typography>

                {/* Date */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday sx={{ fontSize: 12, color: '#666' }} />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#666',
                      fontSize: '0.75rem',
                    }}
                  >
                    {formatDate(song.createdAt)}
                  </Typography>
                </Box>
              </CardContent>

              {/* Actions */}
              <Box sx={{ 
                p: 2, 
                pt: 1,
                display: 'flex',
                gap: 1,
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Edit sx={{ fontSize: 16 }} />}
                  onClick={() => onApply(song)}
                  sx={{
                    flex: 1,
                    backgroundColor: '#fff',
                    color: '#1a1a1a',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    py: 0.5,
                    '&:hover': {
                      backgroundColor: '#e0e0e0',
                    },
                  }}
                >
                  Apply
                </Button>

                <IconButton
                  size="small"
                  onClick={() => onOpenModal(song)}
                  sx={{
                    color: '#999',
                    backgroundColor: 'transparent',
                    '&:hover': {
                      color: '#fff',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  <Info sx={{ fontSize: 18 }} />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => onDelete(song)}
                  sx={{
                    color: '#ff6b6b',
                    backgroundColor: 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,107,107,0.1)',
                    },
                  }}
                >
                  <Delete sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Card>
          </Fade>
        ))}
      </Box>

      {/* Pagination */}
      {count > rowsPerPage && (
        <Box sx={{
          mt: 3,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <Box sx={{
            backgroundColor: '#252525',
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            '& .MuiTablePagination-root': { 
              color: '#fff',
            },
            '& .MuiTablePagination-selectIcon': { 
              color: '#999' 
            },
            '& .MuiIconButton-root': { 
              color: '#fff',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.05)',
              }
            },
            '& .Mui-disabled': {
              color: 'rgba(255,255,255,0.3) !important',
            },
          }}>
            <TablePagination
              component="div"
              count={count}
              page={page}
              onPageChange={onPageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={onRowsPerPageChange}
              rowsPerPageOptions={[6, 9, 12, 24]}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SuggestionsGrid;
