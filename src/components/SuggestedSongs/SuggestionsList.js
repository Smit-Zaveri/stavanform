import React from 'react';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Button,
  Typography,
  Chip,
  Checkbox,
  TablePagination,
  Fade,
} from '@mui/material';
import {
  Edit,
  Delete,
  Info,
  CalendarToday,
  Person,
  Folder,
} from '@mui/icons-material';

const SuggestionsList = ({ 
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
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Box>
      <TableContainer 
        component={Box}
        sx={{
          backgroundColor: '#252525',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: '#2a2a2a',
              '& th': { 
                color: '#999', 
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                py: 2,
              }
            }}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={onSelectAll}
                  sx={{ color: '#fff', '&.Mui-checked': { color: '#fff' } }}
                />
              </TableCell>
              <TableCell>Song Details</TableCell>
              <TableCell>Collection</TableCell>
              <TableCell>Artist</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suggestions.map((song, index) => (
              <Fade in timeout={200 + index * 30} key={song.id}>
                <TableRow
                  sx={{
                    '& td': {
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      py: 2.5,
                    },
                    '&:last-child td': {
                      borderBottom: 'none',
                    },
                    '&:hover': {
                      backgroundColor: '#2a2a2a',
                    },
                    transition: 'background-color 0.2s ease',
                    backgroundColor: selectedIds.includes(song.id) ? 'rgba(255,255,255,0.05)' : 'transparent',
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(song.id)}
                      onChange={() => onSelect(song.id)}
                      sx={{ 
                        color: '#666', 
                        '&.Mui-checked': { color: '#fff' },
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography 
                        variant="subtitle2"
                        sx={{ 
                          color: '#fff', 
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          mb: 0.5,
                        }}
                      >
                        {song.title}
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          color: '#999',
                          fontSize: '0.8rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          maxWidth: 400,
                        }}
                      >
                        {song.content.substring(0, 100)}{song.content.length > 100 ? '...' : ''}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
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
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 16, color: '#999' }} />
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        {song.artistName || 'Unknown'}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday sx={{ fontSize: 14, color: '#666' }} />
                      <Typography variant="body2" sx={{ color: '#999', fontSize: '0.85rem' }}>
                        {formatDate(song.createdAt)}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Edit sx={{ fontSize: 16 }} />}
                        onClick={() => onApply(song)}
                        sx={{
                          backgroundColor: '#fff',
                          color: '#1a1a1a',
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: 2,
                          px: 2,
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
                          '&:hover': {
                            backgroundColor: 'rgba(255,107,107,0.1)',
                          },
                        }}
                      >
                        <Delete sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              </Fade>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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

export default SuggestionsList;
