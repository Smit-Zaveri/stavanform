import React, { useMemo, useState } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Paper,
  Card,
  CardContent,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  Box,
  Badge,
  Stack,
  CircularProgress,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { isValidYouTubeURL } from '../../utils/validators';
import CancelIcon from '@mui/icons-material/Cancel';
import TranslateIcon from '@mui/icons-material/Translate';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const filter = createFilterOptions();

const LanguageIndicator = ({ filled }) => (
  <Badge 
    variant="dot"
    sx={{ 
      '& .MuiBadge-badge': {
        right: -4,
        top: 13,
        bgcolor: filled ? '#4caf50' : 'rgba(255,255,255,0.3)',
      }
    }}
  >
    <div style={{ width: 12, height: 12 }} />
  </Badge>
);

// Common text field styling for dark theme
const darkTextFieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#252525',
    borderRadius: 2,
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  '& .MuiOutlinedInput-input': {
    color: '#fff',
  },
  '& .MuiInputLabel-root': {
    color: '#999',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#fff',
  },
  '& .MuiFormHelperText-root': {
    color: '#666',
  },
  // Hide scrollbar for multiline textareas
  '& .MuiOutlinedInput-inputMultiline': {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '-ms-overflow-style': 'none',
    'scrollbar-width': 'none',
  },
};

// Common select styling for dark theme
const darkSelectSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#252525',
    borderRadius: 2,
    color: '#fff',
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#999',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#fff',
  },
  '& .MuiSelect-icon': {
    color: '#999',
  },
};

export const SongFormControls = ({
  formData,
  setters,
  tagInput,
  artistOptions,
  tirthankarList,
  tagsOptions,
  error,
  collectionOptions,
  selectedCollection,
  setSelectedCollection,
  handleArtistInputBlur,
  mode,
  previousCollection
}) => {
  const {
    title,
    artist,
    tags = [],
    order,
    content,
    youtube,
    newFlag,
    selectedTirthankar
  } = formData;

  const {
    setTitle,
    setArtist,
    setTags,
    setOrder,
    setContent,
    setYoutube,
    setNewFlag,
    setSelectedTirthankar,
    setTagInput,
  } = setters;

  const [openChangeCollectionDialog, setOpenChangeCollectionDialog] = useState(false);
  const [pendingCollectionChange, setPendingCollectionChange] = useState('');
  const [translatingContent, setTranslatingContent] = useState(false);
  const [translatingTitle, setTranslatingTitle] = useState(false);
  const [translationError, setTranslationError] = useState(null);
  const [expandedTitlePanels, setExpandedTitlePanels] = useState(['gujarati']); // Track expanded panels
  const [expandedContentPanels, setExpandedContentPanels] = useState(['gujarati']); // Track expanded content panels

  // Helper functions
  const getTitleByLanguage = (langIndex) => {
    if (Array.isArray(title)) {
      return title[langIndex] || '';
    }
    return langIndex === 0 ? (title || '') : '';
  };

  const getContentByLanguage = (langIndex) => {
    if (Array.isArray(content)) {
      return content[langIndex] || '';
    }
    return langIndex === 0 ? (content || '') : '';
  };

  const hasTitleForLanguage = (langIndex) => {
    return !!getTitleByLanguage(langIndex)?.trim();
  };

  const hasContentForLanguage = (langIndex) => {
    return !!getContentByLanguage(langIndex)?.trim();
  };

  const handleTitleChange = (event, langIndex) => {
    const value = event.target.value;
    const newTitle = Array.isArray(title) ? [...title] : ['', '', ''];
    newTitle[langIndex] = value;
    setTitle(newTitle);
  };

  const handleContentChange = (event, langIndex) => {
    const value = event.target.value;
    const newContent = Array.isArray(content) ? [...content] : ['', '', ''];
    newContent[langIndex] = value;
    setContent(newContent);
  };

  const handleTitlePanelChange = (panel) => (event, isExpanded) => {
    setExpandedTitlePanels(prev => 
      isExpanded 
        ? [...prev, panel] 
        : prev.filter(p => p !== panel)
    );
  };

  const handleContentPanelChange = (panel) => (event, isExpanded) => {
    setExpandedContentPanels(prev => 
      isExpanded 
        ? [...prev, panel] 
        : prev.filter(p => p !== panel)
    );
  };

  const getLanguageName = (index) => {
    const languages = ['Gujarati', 'Hindi', 'English'];
    return languages[index] || '';
  };

  const handleTagChange = (event, newValue) => {
    const cleanedTags = (newValue || [])
      .map(tag => (typeof tag === 'string' ? tag.trim() : tag))
      .filter(Boolean);
    setTags(cleanedTags);
  };

  const handleCollectionChange = (e) => {
    const newCollection = e.target.value;
    if (mode === 'edit' && newCollection !== selectedCollection) {
      setPendingCollectionChange(newCollection);
      setOpenChangeCollectionDialog(true);
    } else {
      setSelectedCollection(newCollection);
    }
  };

  const handleConfirmCollectionChange = () => {
    setSelectedCollection(pendingCollectionChange);
    setOpenChangeCollectionDialog(false);
  };

  const handleCancelCollectionChange = () => {
    setPendingCollectionChange('');
    setOpenChangeCollectionDialog(false);
  };

  const handleBulkTransliterateTitle = async () => {
    const gujaratiTitle = getTitleByLanguage(0);
    if (!gujaratiTitle || !gujaratiTitle.trim()) {
      setTranslationError('Please enter Gujarati title first');
      return;
    }

    setTranslatingTitle(true);
    setTranslationError(null);

    try {
      // Transliterat Hindi if empty
      if (!getTitleByLanguage(1)?.trim()) {
        const hindiTitle = transliterateGujarati(gujaratiTitle, 'Hindi');
        handleTitleChange({ target: { value: hindiTitle } }, 1);
      }

      // Transliterat English if empty
      if (!getTitleByLanguage(2)?.trim()) {
        const englishTitle = transliterateGujarati(gujaratiTitle, 'English');
        handleTitleChange({ target: { value: englishTitle } }, 2);
      }
    } catch (error) {
      setTranslationError(error.message);
    } finally {
      setTranslatingTitle(false);
    }
  };

  const handleBulkTransliterateContent = async () => {
    const gujaratiContent = getContentByLanguage(0);
    if (!gujaratiContent || !gujaratiContent.trim()) {
      setTranslationError('Please enter Gujarati content first');
      return;
    }

    setTranslatingContent(true);
    setTranslationError(null);

    try {
      // Transliterat Hindi if empty
      if (!getContentByLanguage(1)?.trim()) {
        const hindiContent = transliterateGujarati(gujaratiContent, 'Hindi');
        handleContentChange({ target: { value: hindiContent } }, 1);
      }

      // Transliterat English if empty
      if (!getContentByLanguage(2)?.trim()) {
        const englishContent = transliterateGujarati(gujaratiContent, 'English');
        handleContentChange({ target: { value: englishContent } }, 2);
      }
    } catch (error) {
      setTranslationError(error.message);
    } finally {
      setTranslatingContent(false);
    }
  };

  const handleAutoTranslateTitle = async (targetLangIndex) => {
    const gujaratiTitle = getTitleByLanguage(0);

    if (!gujaratiTitle || !gujaratiTitle.trim()) {
      setTranslationError('Please enter Gujarati title first');
      return;
    }

    // Check if target language title is already available
    const targetTitle = getTitleByLanguage(targetLangIndex);
    if (targetTitle && targetTitle.trim()) {
      setTranslationError(`${getLanguageName(targetLangIndex)} title already exists. Transliteration skipped.`);
      return;
    }

    console.log('Translating title:', { gujaratiTitle, targetLangIndex, currentTitle: title });

    setTranslatingTitle(true);
    setTranslationError(null);

    try {
      const targetLanguage = targetLangIndex === 1 ? 'Hindi' : 'English';
      const transliteratedText = transliterateGujarati(gujaratiTitle, targetLanguage);

      console.log('Title transliteration result:', { transliteratedText, targetLangIndex });

      // Ensure title is an array and preserve Gujarati title
      let newTitle;
      if (Array.isArray(title)) {
        newTitle = [...title];
      } else {
        newTitle = [gujaratiTitle, '', ''];
      }

      // Ensure array has enough length
      while (newTitle.length <= targetLangIndex) {
        newTitle.push('');
      }

      newTitle[targetLangIndex] = transliteratedText;

      console.log('Setting new title:', newTitle);
      setTitle(newTitle);
    } catch (error) {
      setTranslationError(error.message);
    } finally {
      setTranslatingTitle(false);
    }
  };

  const handleAutoTranslateContent = async (targetLangIndex) => {
    const gujaratiContent = getContentByLanguage(0);

    if (!gujaratiContent || !gujaratiContent.trim()) {
      setTranslationError('Please enter Gujarati content first');
      return;
    }

    // Check if target language content is already available
    const targetContent = getContentByLanguage(targetLangIndex);
    if (targetContent && targetContent.trim()) {
      setTranslationError(`${getLanguageName(targetLangIndex)} content already exists. Transliteration skipped.`);
      return;
    }

    console.log('Translating content:', { gujaratiContent, targetLangIndex, currentContent: content });

    setTranslatingContent(true);
    setTranslationError(null);

    try {
      const targetLanguage = targetLangIndex === 1 ? 'Hindi' : 'English';
      // Use transliteration instead of translation
      const transliteratedText = transliterateGujarati(gujaratiContent, targetLanguage);

      console.log('Transliteration result:', { transliteratedText, targetLangIndex });

      // Ensure content is an array and preserve Gujarati content
      let newContent;
      if (Array.isArray(content)) {
        newContent = [...content];
      } else {
        newContent = [gujaratiContent, '', ''];
      }

      // Ensure array has enough length
      while (newContent.length <= targetLangIndex) {
        newContent.push('');
      }

      newContent[targetLangIndex] = transliteratedText;

      console.log('Setting new content:', newContent);
      setContent(newContent);
    } catch (error) {
      setTranslationError(error.message);
    } finally {
      setTranslatingContent(false);
    }
  };

  // Transliteration: Convert Gujarati to Hindi or English (same pronunciation)
  const transliterateGujarati = (text, targetScript) => {
    if (!text || !text.trim()) {
      return '';
    }

    // Gujarati to Hindi (Devanagari) mapping
    const gujaratiToHindi = {
      'અ': 'अ', 'આ': 'आ', 'ઇ': 'इ', 'ઈ': 'ई', 'ઉ': 'उ', 'ઊ': 'ऊ',
      'એ': 'ए', 'ઐ': 'ऐ', 'ઓ': 'ओ', 'ઔ': 'औ', 'અં': 'अं', 'અઃ': 'अः',
      'ક': 'क', 'ખ': 'ख', 'ગ': 'ग', 'ઘ': 'घ', 'ઙ': 'ङ',
      'ચ': 'च', 'છ': 'छ', 'જ': 'ज', 'ઝ': 'झ', 'ઞ': 'ञ',
      'ટ': 'ट', 'ઠ': 'ठ', 'ડ': 'ड', 'ઢ': 'ढ', 'ણ': 'ण',
      'ત': 'त', 'થ': 'थ', 'દ': 'द', 'ધ': 'ध', 'ન': 'न',
      'પ': 'प', 'ફ': 'फ', 'બ': 'ब', 'ભ': 'भ', 'મ': 'म',
      'ય': 'य', 'ર': 'र', 'લ': 'ल', 'વ': 'व', 'શ': 'श',
      'ષ': 'ष', 'સ': 'स', 'હ': 'ह', 'ળ': 'ळ', 'ક્ષ': 'क्ष',
      'જ્ઞ': 'ज्ञ', 'શ્ર': 'श्र',
      // Matras (vowel signs)
      'ા': 'ा', 'િ': 'ि', 'ી': 'ी', 'ુ': 'ु', 'ૂ': 'ू',
      'ે': 'े', 'ૈ': 'ै', 'ો': 'ो', 'ૌ': 'ौ', 'ં': 'ं', 'ઃ': 'ः', '્': '्',
      // Numbers and punctuation
      '૦': '०', '૧': '१', '૨': '२', '૩': '३', '૪': '४',
      '૫': '५', '૬': '६', '૭': '७', '૮': '૮', '૯': '૯',
      '।': '।',
    };

    // For Hindi script, use simple character mapping
    if (targetScript === 'Hindi') {
      let result = '';
      let i = 0;
      
      while (i < text.length) {
        // Try 3-character combinations first
        if (i + 2 < text.length) {
          const threeChars = text[i] + text[i + 1] + text[i + 2];
          if (gujaratiToHindi[threeChars]) {
            result += gujaratiToHindi[threeChars];
            i += 3;
            continue;
          }
        }
        // Try 2-character combinations
        if (i + 1 < text.length) {
          const twoChars = text[i] + text[i + 1];
          if (gujaratiToHindi[twoChars]) {
            result += gujaratiToHindi[twoChars];
            i += 2;
            continue;
          }
        }
        
        // Single character
        const char = text[i];
        if (gujaratiToHindi[char]) {
          result += gujaratiToHindi[char];
        } else {
          result += char;
        }
        i++;
      }
      
      return result;
    }
    
    // For English transliteration - natural pronunciation style
    // Similar logic as in SongFormControls
    const consonants = {
      'ક': 'k', 'ખ': 'kh', 'ગ': 'g', 'ઘ': 'gh', 'ઙ': 'ng',
      'ચ': 'ch', 'છ': 'chh', 'જ': 'j', 'ઝ': 'jh', 'ઞ': 'ny',
      'ટ': 't', 'ઠ': 'th', 'ડ': 'd', 'ઢ': 'dh', 'ણ': 'n',
      'ત': 't', 'થ': 'th', 'દ': 'd', 'ધ': 'dh', 'ન': 'n',
      'પ': 'p', 'ફ': 'ph', 'બ': 'b', 'ભ': 'bh', 'મ': 'm',
      'ય': 'y', 'ર': 'r', 'લ': 'l', 'વ': 'v', 'શ': 'sh',
      'ષ': 'sh', 'સ': 's', 'હ': 'h', 'ળ': 'l',
    };
    
    const vowels = {
      'અ': 'a', 'આ': 'aa', 'ઇ': 'i', 'ઈ': 'i', 'ઉ': 'u', 'ઊ': 'u',
      'એ': 'e', 'ઐ': 'ai', 'ઓ': 'o', 'ઔ': 'au', 'ઋ': 'ru',
    };
    
    const matras = {
      'ા': 'a', 'િ': 'i', 'ી': 'i', 'ુ': 'u', 'ૂ': 'u',
      'ે': 'e', 'ૈ': 'ai', 'ો': 'o', 'ૌ': 'au', 'ૃ': 'ru',
    };
    
    const special = {
      'ં': 'n', 'ઁ': 'n', 'ઃ': 'h', '્': '', // halant removes inherent vowel
      '।': '.', '॥': '.',
      '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4',
      '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',
    };
    
    const isWordBoundary = (ch) => {
      return !ch || ch === ' ' || ch === '\n' || ch === '\t' || 
             ch === ',' || ch === '।' || ch === '॥' || ch === '.' ||
             ch === '(' || ch === ')' || ch === '-' || ch === '…';
    };
    
    const isEndContext = (nextCh) => {
      return isWordBoundary(nextCh) || special[nextCh] !== undefined;
    };
    
    let result = '';
    let i = 0;
    let isStartOfSentence = true;
    
    while (i < text.length) {
      const char = text[i];
      const nextChar = text[i + 1] || '';
      
      if (char === '\n' || char === '.' || char === '।' || char === '॥') {
        isStartOfSentence = true;
        result += char;
        i++;
        continue;
      }
      
      if (char === ' ' || char === '\t') {
        result += char;
        i++;
        continue;
      }
      
      if (vowels[char + nextChar]) {
        let vowelResult = vowels[char + nextChar];
        if (isStartOfSentence && /[a-z]/.test(vowelResult[0])) {
          vowelResult = vowelResult[0].toUpperCase() + vowelResult.slice(1);
          isStartOfSentence = false;
        }
        result += vowelResult;
        i += 2;
        continue;
      }
      
      if (vowels[char]) {
        let vowelResult = vowels[char];
        if (isStartOfSentence && /[a-z]/.test(vowelResult[0])) {
          vowelResult = vowelResult[0].toUpperCase() + vowelResult.slice(1);
          isStartOfSentence = false;
        }
        result += vowelResult;
        i++;
        continue;
      }
      
      if (consonants[char]) {
        let consonantRoman = consonants[char];
        
        if (isStartOfSentence) {
          consonantRoman = consonantRoman[0].toUpperCase() + consonantRoman.slice(1);
          isStartOfSentence = false;
        }
        
        if (nextChar === '્') {
          result += consonantRoman;
          i += 2;
          continue;
        } else if (matras[nextChar]) {
          let matraValue = matras[nextChar];
          
          if (nextChar === 'ે' && isEndContext(text[i + 2] || '')) {
            matraValue = 'ey';
          }
          
          result += consonantRoman + matraValue;
          i += 2;
          continue;
        } else if (special[nextChar] !== undefined && nextChar !== '્') {
          result += consonantRoman + 'a';
          i++;
          continue;
        } else if (isEndContext(nextChar) || consonants[nextChar] || vowels[nextChar] || vowels[nextChar + (text[i + 2] || '')]) {
          result += consonantRoman + 'a';
          i++;
          continue;
        } else {
          result += consonantRoman + 'a';
          i++;
          continue;
        }
      }
      
      if (special[char] !== undefined) {
        result += special[char];
        i++;
        continue;
      }
      
      result += char;
      i++;
    }
    
    return result;
  };

  const openInGoogleTranslate = (text, targetLanguage) => {
    const langCodes = {
      'Hindi': 'hi',
      'English': 'en'
    };
    const targetCode = langCodes[targetLanguage] || 'en';
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.google.com/?sl=gu&tl=${targetCode}&text=${encodedText}&op=translate`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const combinedTagSuggestions = useMemo(() => {
    const uniqueTags = new Set([
      ...tagsOptions,
      ...(tags || []),
      ...(tirthankarList?.map(t => t.name) || []),
      ...(tirthankarList?.map(t => 
        typeof t.displayName === 'string' ? t.displayName : ''
      ).filter(Boolean) || [])
    ]);
    return Array.from(uniqueTags);
  }, [tagsOptions, tags, tirthankarList]);

  return (
    <>
      <Card sx={{ bgcolor: '#252525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#fff', fontWeight: 600 }}>
            Song Details
          </Typography>
          {mode === 'edit' && selectedCollection !== previousCollection && previousCollection && (
            <Alert severity="info" sx={{ mb: 2, bgcolor: 'rgba(33, 150, 243, 0.15)', color: '#90caf9', border: '1px solid rgba(33, 150, 243, 0.3)' }}>
              This song will be moved from "{previousCollection}" to "{selectedCollection}"
            </Alert>
          )}
          {translationError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                bgcolor: 'rgba(211, 47, 47, 0.15)', 
                color: '#ef5350',
                border: '1px solid rgba(211, 47, 47, 0.3)'
              }}
              onClose={() => setTranslationError(null)}
            >
              {translationError}
            </Alert>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!selectedCollection && !!error} sx={darkSelectSx}>
                <InputLabel sx={{ color: '#999' }}>Select Collection</InputLabel>
                <Select
                  value={selectedCollection}
                  onChange={handleCollectionChange}
                  label="Select Collection"
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: '#1a1a1a',
                        color: '#fff',
                        '& .MuiMenuItem-root': {
                          color: '#fff',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.1)',
                          },
                          '&.Mui-selected': {
                            bgcolor: 'rgba(255,255,255,0.15)',
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em style={{ color: '#666' }}>Select a collection</em>
                  </MenuItem>
                  {collectionOptions.map((coll) => (
                    <MenuItem key={coll.id} value={coll.name}>
                      {coll.name.charAt(0).toUpperCase() + coll.name.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {mode === 'edit' && (
                  <Typography variant="caption" sx={{ mt: 0.5, color: '#666' }}>
                    Changing collection will move this song to the selected collection
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2, overflow: 'visible', bgcolor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}>
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TranslateIcon sx={{ color: '#fff' }} />
                      <Typography variant="subtitle1" fontWeight="medium" sx={{ color: '#fff' }}>
                        Song Title in Multiple Languages
                      </Typography>
                    </Stack>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleBulkTransliterateTitle}
                      disabled={translatingTitle || !getTitleByLanguage(0)?.trim()}
                      sx={{
                        color: '#fff',
                        borderColor: 'rgba(255,255,255,0.3)',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: 'rgba(255,255,255,0.5)',
                          bgcolor: 'rgba(255,255,255,0.05)',
                        },
                        '&.Mui-disabled': {
                          color: 'rgba(255,255,255,0.3)',
                          borderColor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      {translatingTitle ? <CircularProgress size={16} /> : 'Fill All'}
                    </Button>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Accordion 
                      expanded={expandedTitlePanels.includes('gujarati')} 
                      onChange={handleTitlePanelChange('gujarati')}
                      defaultExpanded
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.05)', 
                        '&:before': { display: 'none' },
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />} sx={{ minHeight: '48px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography sx={{ color: '#fff', mr: 1 }}>Gujarati</Typography>
                          <LanguageIndicator filled={hasTitleForLanguage(0)} />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 2 }}>
                        <TextField
                          label="Gujarati Title"
                          variant="outlined"
                          fullWidth
                          required
                          value={getTitleByLanguage(0)}
                          onChange={(e) => handleTitleChange(e, 0)}
                          error={(!getTitleByLanguage(0) && !!error)}
                          helperText={(!getTitleByLanguage(0) && !!error) ? "Gujarati title is required" : "Primary title (required)"}
                          sx={darkTextFieldSx}
                        />
                      </AccordionDetails>
                    </Accordion>

                    <Accordion 
                      expanded={expandedTitlePanels.includes('hindi')} 
                      onChange={handleTitlePanelChange('hindi')}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.05)', 
                        '&:before': { display: 'none' },
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />} sx={{ minHeight: '48px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography sx={{ color: '#fff', mr: 1 }}>Hindi</Typography>
                          <LanguageIndicator filled={hasTitleForLanguage(1)} />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 2 }}>
                        <TextField
                          label="Hindi Title"
                          variant="outlined"
                          fullWidth
                          value={getTitleByLanguage(1)}
                          onChange={(e) => handleTitleChange(e, 1)}
                          helperText="Same pronunciation in Devanagari script (not translation)"
                          sx={darkTextFieldSx}
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Tooltip title="Convert to same pronunciation in Hindi/Devanagari script (only if field is empty)" arrow>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={translatingTitle ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
                              onClick={() => handleAutoTranslateTitle(1)}
                              disabled={translatingTitle || !getTitleByLanguage(0)?.trim() || getTitleByLanguage(1)?.trim()}
                              sx={{
                                color: '#fff',
                                borderColor: 'rgba(255,255,255,0.3)',
                                textTransform: 'none',
                                '&:hover': {
                                  borderColor: 'rgba(255,255,255,0.5)',
                                  bgcolor: 'rgba(255,255,255,0.05)',
                                },
                                '&.Mui-disabled': {
                                  color: 'rgba(255,255,255,0.3)',
                                  borderColor: 'rgba(255,255,255,0.1)',
                                },
                              }}
                            >
                              {translatingTitle ? 'Converting...' : 'Convert to Hindi script'}
                            </Button>
                          </Tooltip>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => openInGoogleTranslate(getTitleByLanguage(0), 'Hindi')}
                            disabled={!getTitleByLanguage(0)?.trim()}
                            sx={{
                              color: '#90caf9',
                              textTransform: 'none',
                              '&:hover': {
                                bgcolor: 'rgba(144, 202, 249, 0.1)',
                              },
                            }}
                          >
                            Open in Google Translate →
                          </Button>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion 
                      expanded={expandedTitlePanels.includes('english')} 
                      onChange={handleTitlePanelChange('english')}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.05)', 
                        '&:before': { display: 'none' },
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />} sx={{ minHeight: '48px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography sx={{ color: '#fff', mr: 1 }}>English</Typography>
                          <LanguageIndicator filled={hasTitleForLanguage(2)} />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 2 }}>
                        <TextField
                          label="English Title"
                          variant="outlined"
                          fullWidth
                          value={getTitleByLanguage(2)}
                          onChange={(e) => handleTitleChange(e, 2)}
                          helperText="Same pronunciation in Roman/English script (not translation)"
                          sx={darkTextFieldSx}
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Tooltip title="Convert to same pronunciation in Roman/English script (only if field is empty)" arrow>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={translatingTitle ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
                              onClick={() => handleAutoTranslateTitle(2)}
                              disabled={translatingTitle || !getTitleByLanguage(0)?.trim() || getTitleByLanguage(2)?.trim()}
                              sx={{
                                color: '#fff',
                                borderColor: 'rgba(255,255,255,0.3)',
                                textTransform: 'none',
                                '&:hover': {
                                  borderColor: 'rgba(255,255,255,0.5)',
                                  bgcolor: 'rgba(255,255,255,0.05)',
                                },
                                '&.Mui-disabled': {
                                  color: 'rgba(255,255,255,0.3)',
                                  borderColor: 'rgba(255,255,255,0.1)',
                                },
                              }}
                            >
                              {translatingTitle ? 'Converting...' : 'Convert to English script'}
                            </Button>
                          </Tooltip>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => openInGoogleTranslate(getTitleByLanguage(0), 'English')}
                            disabled={!getTitleByLanguage(0)?.trim()}
                            sx={{
                              color: '#90caf9',
                              textTransform: 'none',
                              '&:hover': {
                                bgcolor: 'rgba(144, 202, 249, 0.1)',
                              },
                            }}
                          >
                            Open in Google Translate →
                          </Button>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={artistOptions.map((opt) => opt.name)}
                value={artist || ''}
                onChange={(event, newValue) => setArtist(newValue || '')}
                onBlur={handleArtistInputBlur}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#252525',
                    borderRadius: 2,
                    color: '#fff',
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#999',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#fff',
                  },
                }}
                PaperComponent={({ children }) => (
                  <Paper sx={{ bgcolor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                    {children}
                  </Paper>
                )}
                renderInput={(params) => (
                  <TextField {...params} label="Artist" variant="outlined" fullWidth sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#252525',
                      borderRadius: 2,
                    },
                    '& .MuiOutlinedInput-input': {
                      color: '#fff',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#999',
                    },
                  }} />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={darkSelectSx}>
                <InputLabel sx={{ color: '#999' }}>Select Tirthankar</InputLabel>
                <Select
                  value={selectedTirthankar}
                  onChange={(e) => setSelectedTirthankar(e.target.value)}
                  label="Select Tirthankar"
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: '#1a1a1a',
                        color: '#fff',
                        '& .MuiMenuItem-root': {
                          color: '#fff',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.1)',
                          },
                          '&.Mui-selected': {
                            bgcolor: 'rgba(255,255,255,0.15)',
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em style={{ color: '#666' }}>Clear Selection</em>
                  </MenuItem>
                  {tirthankarList.map((tirth) => (
                    <MenuItem key={tirth.id} value={tirth.id}>
                      {tirth.numbering}. {tirth.name} ({tirth.displayName})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                freeSolo
                ChipProps={{
                  deleteIcon: <CancelIcon />,
                  sx: {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    borderRadius: '16px',
                    '& .MuiChip-deleteIcon': {
                      color: 'rgba(255,255,255,0.6)',
                      '&:hover': {
                        color: 'rgba(255,255,255,0.87)'
                      }
                    }
                  }
                }}
                options={combinedTagSuggestions}
                value={tags || []}
                onChange={handleTagChange}
                inputValue={tagInput || ''}
                onInputChange={(event, newValue, reason) => {
                  if (reason === 'reset') {
                    setTagInput('');
                    return;
                  }

                  if (newValue?.includes(',')) {
                    const newTags = newValue
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean);

                    if (newTags.length > 0) {
                      setTags((prev) => [...prev, ...newTags]);
                      setTagInput('');
                      return;
                    }
                  }

                  setTagInput(newValue || '');
                }}
                filterOptions={(options, params) => {
                  const filtered = filter(options, params);
                  const inputValue = params.inputValue?.trim() || '';
                  if (inputValue && !filtered.includes(inputValue)) {
                    filtered.push(inputValue);
                  }
                  return filtered;
                }}
                PaperComponent={(props) => (
                  <Paper {...props} sx={{ maxHeight: 200, overflowY: 'auto', bgcolor: '#1a1a1a', color: '#fff' }} />
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    variant="outlined"
                    fullWidth
                    helperText="Separate tags with commas or press enter"
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === 'Tab') && tagInput?.trim()) {
                        e.preventDefault();
                        const newTag = tagInput.trim();
                        if (!tags.includes(newTag)) {
                          setTags([...tags, newTag]);
                        }
                        setTagInput('');
                      }
                    }}
                    onBlur={() => {
                      if (tagInput?.trim()) {
                        const newTag = tagInput.trim();
                        if (!tags.includes(newTag)) {
                          setTags([...tags, newTag]);
                        }
                        setTagInput('');
                      }
                    }}
                    sx={{
                      ...darkTextFieldSx,
                      '& .MuiOutlinedInput-root': {
                        ...darkTextFieldSx['& .MuiOutlinedInput-root'],
                        flexWrap: 'wrap',
                        gap: 0.5,
                        '& .MuiChip-root': {
                          margin: '2px'
                        }
                      }
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="YouTube Link"
                variant="outlined"
                fullWidth
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                error={youtube && !isValidYouTubeURL(youtube)}
                helperText={youtube && !isValidYouTubeURL(youtube) ? 'Invalid YouTube URL' : ''}
                sx={darkTextFieldSx}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Order"
                variant="outlined"
                fullWidth
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                error={order && isNaN(Number(order))}
                sx={darkTextFieldSx}
              />
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2, overflow: 'visible', bgcolor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}>
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TranslateIcon sx={{ color: '#fff' }} />
                      <Typography variant="subtitle1" fontWeight="medium" sx={{ color: '#fff' }}>
                        Content in Multiple Languages
                      </Typography>
                    </Stack>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleBulkTransliterateContent}
                      disabled={translatingContent || !getContentByLanguage(0)?.trim()}
                      sx={{
                        color: '#fff',
                        borderColor: 'rgba(255,255,255,0.3)',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: 'rgba(255,255,255,0.5)',
                          bgcolor: 'rgba(255,255,255,0.05)',
                        },
                        '&.Mui-disabled': {
                          color: 'rgba(255,255,255,0.3)',
                          borderColor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      {translatingContent ? <CircularProgress size={16} /> : 'Fill All'}
                    </Button>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Accordion 
                      expanded={expandedContentPanels.includes('gujarati')} 
                      onChange={handleContentPanelChange('gujarati')}
                      defaultExpanded
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.05)', 
                        '&:before': { display: 'none' },
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />} sx={{ minHeight: '48px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography sx={{ color: '#fff', mr: 1 }}>Gujarati</Typography>
                          <LanguageIndicator filled={hasContentForLanguage(0)} />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 2 }}>
                        <TextField
                          label="Gujarati Content"
                          variant="outlined"
                          fullWidth
                          required
                          multiline
                          rows={4}
                          value={getContentByLanguage(0)}
                          onChange={(e) => handleContentChange(e, 0)}
                          error={(!getContentByLanguage(0) && !!error)}
                          helperText={(!getContentByLanguage(0) && !!error) ? "Gujarati content is required" : "Primary content (required)"}
                          sx={darkTextFieldSx}
                        />
                      </AccordionDetails>
                    </Accordion>

                    <Accordion 
                      expanded={expandedContentPanels.includes('hindi')} 
                      onChange={handleContentPanelChange('hindi')}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.05)', 
                        '&:before': { display: 'none' },
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />} sx={{ minHeight: '48px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography sx={{ color: '#fff', mr: 1 }}>Hindi</Typography>
                          <LanguageIndicator filled={hasContentForLanguage(1)} />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 2 }}>
                        <TextField
                          label="Hindi Content"
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={4}
                          value={getContentByLanguage(1)}
                          onChange={(e) => handleContentChange(e, 1)}
                          helperText="Same pronunciation in Devanagari script (not translation)"
                          sx={darkTextFieldSx}
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Tooltip title="Convert to same pronunciation in Hindi/Devanagari script (only if field is empty)" arrow>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={translatingContent ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
                              onClick={() => handleAutoTranslateContent(1)}
                              disabled={translatingContent || !getContentByLanguage(0)?.trim() || getContentByLanguage(1)?.trim()}
                              sx={{
                                color: '#fff',
                                borderColor: 'rgba(255,255,255,0.3)',
                                textTransform: 'none',
                                '&:hover': {
                                  borderColor: 'rgba(255,255,255,0.5)',
                                  bgcolor: 'rgba(255,255,255,0.05)',
                                },
                                '&.Mui-disabled': {
                                  color: 'rgba(255,255,255,0.3)',
                                  borderColor: 'rgba(255,255,255,0.1)',
                                },
                              }}
                            >
                              {translatingContent ? 'Converting...' : 'Convert to Hindi script'}
                            </Button>
                          </Tooltip>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => openInGoogleTranslate(getContentByLanguage(0), 'Hindi')}
                            disabled={!getContentByLanguage(0)?.trim()}
                            sx={{
                              color: '#90caf9',
                              textTransform: 'none',
                              '&:hover': {
                                bgcolor: 'rgba(144, 202, 249, 0.1)',
                              },
                            }}
                          >
                            Open in Google Translate →
                          </Button>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion 
                      expanded={expandedContentPanels.includes('english')} 
                      onChange={handleContentPanelChange('english')}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.05)', 
                        '&:before': { display: 'none' },
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />} sx={{ minHeight: '48px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography sx={{ color: '#fff', mr: 1 }}>English</Typography>
                          <LanguageIndicator filled={hasContentForLanguage(2)} />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 2 }}>
                        <TextField
                          label="English Content"
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={4}
                          value={getContentByLanguage(2)}
                          onChange={(e) => handleContentChange(e, 2)}
                          helperText="Same pronunciation in Roman/English script (not translation)"
                          sx={darkTextFieldSx}
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Tooltip title="Convert to same pronunciation in Roman/English script (only if field is empty)" arrow>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={translatingContent ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
                              onClick={() => handleAutoTranslateContent(2)}
                              disabled={translatingContent || !getContentByLanguage(0)?.trim() || getContentByLanguage(2)?.trim()}
                              sx={{
                                color: '#fff',
                                borderColor: 'rgba(255,255,255,0.3)',
                                textTransform: 'none',
                                '&:hover': {
                                  borderColor: 'rgba(255,255,255,0.5)',
                                  bgcolor: 'rgba(255,255,255,0.05)',
                                },
                                '&.Mui-disabled': {
                                  color: 'rgba(255,255,255,0.3)',
                                  borderColor: 'rgba(255,255,255,0.1)',
                                },
                              }}
                            >
                              {translatingContent ? 'Converting...' : 'Convert to English script'}
                            </Button>
                          </Tooltip>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => openInGoogleTranslate(getContentByLanguage(0), 'English')}
                            disabled={!getContentByLanguage(0)?.trim()}
                            sx={{
                              color: '#90caf9',
                              textTransform: 'none',
                              '&:hover': {
                                bgcolor: 'rgba(144, 202, 249, 0.1)',
                              },
                            }}
                          >
                            Open in Google Translate →
                          </Button>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              xs={12}
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                flexWrap: 'wrap'
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newFlag}
                    onChange={(e) => setNewFlag(e.target.checked)}
                    sx={{ 
                      color: '#999',
                      '&.Mui-checked': {
                        color: '#fff',
                      }
                    }}
                  />
                }
                label="New"
                sx={{ color: '#fff' }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Dialog
        open={openChangeCollectionDialog}
        onClose={handleCancelCollectionChange}
        aria-labelledby="change-collection-dialog-title"
        aria-describedby="change-collection-dialog-description"
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          }
        }}
      >
        <DialogTitle id="change-collection-dialog-title" sx={{ color: '#fff' }}>
          Change Collection
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="change-collection-dialog-description" sx={{ color: '#999' }}>
            Are you sure you want to move this song to a different collection? This action will move the song from "{previousCollection}" to "{pendingCollectionChange}".
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelCollectionChange} sx={{ color: '#999' }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmCollectionChange} sx={{ color: '#1a1a1a', bgcolor: '#fff', '&:hover': { bgcolor: '#e0e0e0' } }}>
            Move Song
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SongFormControls;
