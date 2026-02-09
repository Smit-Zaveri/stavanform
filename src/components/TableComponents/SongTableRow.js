import React from 'react';
import {
  TableRow as MuiTableRow,
  TableCell,
  Checkbox,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import { Delete, ReportProblem } from '@mui/icons-material';

const SongTableRow = ({
  song,
  report,
  isItemSelected,
  handleSelectSong,
  handleEditClick,
  handleDeleteClick,
  handleResolveClick,
}) => {
  // Function to determine which languages are available for a song
  const getAvailableLanguages = (song) => {
    const languages = [];
    
    // Check Gujarati (always primary language, index 0)
    const gujaratiTitle = Array.isArray(song.title) ? song.title[0] : song.title;
    const gujaratiContent = Array.isArray(song.content) ? song.content[0] : song.content;
    if (gujaratiTitle?.trim() || gujaratiContent?.trim()) {
      languages.push('GU');
    }
    
    // Check Hindi (index 1)
    const hindiTitle = Array.isArray(song.title) ? song.title[1] : '';
    const hindiContent = Array.isArray(song.content) ? song.content[1] : '';
    if (hindiTitle?.trim() || hindiContent?.trim()) {
      languages.push('HI');
    }
    
    // Check English (index 2)
    const englishTitle = Array.isArray(song.title) ? song.title[2] : '';
    const englishContent = Array.isArray(song.content) ? song.content[2] : '';
    if (englishTitle?.trim() || englishContent?.trim()) {
      languages.push('EN');
    }
    
    return languages;
  };

  // Function to get display title (only primary title)
  const getDisplayTitle = (song) => {
    const primaryTitle = Array.isArray(song.title) ? song.title[0] : song.title;
    return primaryTitle || 'Untitled';
  };

  // Function to get tooltip content showing all titles
  const getTitleTooltip = (song) => {
    const titles = [];
    
    // Gujarati title (primary)
    const gujaratiTitle = Array.isArray(song.title) ? song.title[0] : song.title;
    if (gujaratiTitle?.trim()) {
      titles.push(`🇮🇳 Gujarati: ${gujaratiTitle}`);
    }
    
    // Hindi title
    const hindiTitle = Array.isArray(song.title) ? song.title[1] : '';
    if (hindiTitle?.trim()) {
      titles.push(`🇮🇳 Hindi: ${hindiTitle}`);
    }
    
    // English title
    const englishTitle = Array.isArray(song.title) ? song.title[2] : '';
    if (englishTitle?.trim()) {
      titles.push(`🇺🇸 English: ${englishTitle}`);
    }
    
    return titles.length > 1 ? titles.join('\n') : '';
  };

  const availableLanguages = getAvailableLanguages(song);
  const displayTitle = getDisplayTitle(song);
  const titleTooltip = getTitleTooltip(song);
  return (
    <MuiTableRow
      sx={{
        backgroundColor: report ? "rgba(255,107,53,0.04)" : "transparent",
        '&:hover': {
          backgroundColor: report ? "rgba(255,107,53,0.08)" : "rgba(255,255,255,0.05)",
        },
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <TableCell padding="checkbox">
        <Checkbox
          checked={isItemSelected}
          onChange={() => handleSelectSong(song.id)}
          sx={{
            color: '#999',
            '&.Mui-checked': { color: '#fff' }
          }}
        />
      </TableCell>
      <TableCell sx={{ color: '#fff', pl: report ? 2 : 1 }}>
        {report ? (
          <Tooltip 
            title={`Report: ${report.reportText}`} 
            arrow 
            placement="top"
            sx={{
              '& .MuiTooltip-tooltip': {
                bgcolor: '#ff6b35',
                color: '#fff',
                fontSize: '0.8rem',
              }
            }}
          >
            <ReportProblem 
              sx={{ 
                color: '#ff6b35', 
                fontSize: 20,
                cursor: 'pointer'
              }} 
            />
          </Tooltip>
        ) : (
          <Typography variant="body2" sx={{ color: '#666' }}>
            —
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ color: '#fff' }}>{song.order != null ? song.order : "—"}</TableCell>
        <TableCell>
          <Tooltip 
            title={titleTooltip} 
            arrow 
            placement="top"
            disableHoverListener={!titleTooltip}
            sx={{
              '& .MuiTooltip-tooltip': {
                bgcolor: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '0.875rem',
                whiteSpace: 'pre-line',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  maxWidth: availableLanguages.length > 1 ? "170px" : "200px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: '#fff',
                  cursor: titleTooltip ? 'pointer' : 'default',
                }}
              >
                {displayTitle}
              </Typography>
              {availableLanguages.length > 1 && (
                <Typography variant="caption" sx={{ color: '#90caf9', fontSize: '0.75rem' }}>
                  🌐
                </Typography>
              )}
            </Box>
          </Tooltip>
        </TableCell>
       
       <TableCell>
         <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
           {availableLanguages.map((lang) => (
             <Chip
               key={lang}
               label={lang}
               size="small"
               sx={{
                 height: '20px',
                 fontSize: '0.7rem',
                 fontWeight: 600,
                 bgcolor: lang === 'GU' ? '#4caf50' : lang === 'HI' ? '#2196f3' : '#ff9800',
                 color: '#fff',
                 borderRadius: '4px',
                 minWidth: '28px',
               }}
             />
           ))}
           {availableLanguages.length === 0 && (
             <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
               No content
             </Typography>
           )}
         </Box>
        </TableCell>
       <TableCell>
         <Typography
           variant="body2"
           sx={{
             maxWidth: "150px",
             whiteSpace: "nowrap",
             overflow: "hidden",
             textOverflow: "ellipsis",
             color: '#999',
           }}
         >
           {song.tags ? song.tags.join(", ") : "—"}
         </Typography>
       </TableCell>
       <TableCell sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => handleEditClick(song)}
          sx={{
            backgroundColor: '#fff',
            color: '#1a1a1a',
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
            minHeight: '32px',
            height: '32px',
            fontSize: '0.75rem',
            px: 1.5,
          }}
        >
          Edit
        </Button>
        <IconButton 
          onClick={() => handleDeleteClick(song.id)}
          sx={{ color: '#ff6b6b' }}
        >
          <Delete />
        </IconButton>
        {report && (
          <Button
            variant="contained"
            size="small"
            onClick={() => handleResolveClick(report.id)}
            sx={{
              backgroundColor: '#fff',
              color: '#1a1a1a',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
              minHeight: '32px',
              height: '32px',
              fontSize: '0.75rem',
              px: 1.5,
            }}
          >
            Resolve
          </Button>
        )}
      </TableCell>
    </MuiTableRow>
  );
};

export default SongTableRow;