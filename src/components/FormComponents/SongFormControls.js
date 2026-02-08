import React, { useMemo, useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Box,
  Badge,
  Stack,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { isValidYouTubeURL } from '../../utils/validators';
import CancelIcon from '@mui/icons-material/Cancel';
import TranslateIcon from '@mui/icons-material/Translate';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

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
  const [selectedLangTab, setSelectedLangTab] = useState(0);
  const [selectedTitleLangTab, setSelectedTitleLangTab] = useState(0);
  const [translatingContent, setTranslatingContent] = useState(false);
  const [translatingTitle, setTranslatingTitle] = useState(false);
  const [translationError, setTranslationError] = useState(null);
  

  // Debug content changes
  useEffect(() => {
    console.log('Content changed:', content);
  }, [content]);

  

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
      'ે': 'े', 'ૈ': 'ै', 'ો': 'ो', 'ૌ': 'ौ', 'ં': 'ं', 'ઃ': 'ः',
'્': '्',
      // Numbers and punctuation
      '૦': '०', '૧': '१', '૨': '२', '૩': '३', '૪': '४',
      '૫': '५', '૬': '૬', '૭': '७', '૮': '૮', '૯': '૯',
      '।': '।',
      // Additional special combinations
      'ત્ર': 'त्र',
      'દ્વ': 'द्व', 'દ્ય': 'द्य', 'દ્મ': 'द्म'
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
    // Consonants (without inherent vowel)
    const consonants = {
      'ક': 'k', 'ખ': 'kh', 'ગ': 'g', 'ઘ': 'gh', 'ઙ': 'ng',
      'ચ': 'ch', 'છ': 'chh', 'જ': 'j', 'ઝ': 'jh', 'ઞ': 'ny',
      'ટ': 't', 'ઠ': 'th', 'ડ': 'd', 'ઢ': 'dh', 'ણ': 'n',
      'ત': 't', 'થ': 'th', 'દ': 'd', 'ધ': 'dh', 'ન': 'n',
      'પ': 'p', 'ફ': 'ph', 'બ': 'b', 'ભ': 'bh', 'મ': 'm',
      'ય': 'y', 'ર': 'r', 'લ': 'l', 'વ': 'v', 'શ': 'sh',
      'ષ': 'sh', 'સ': 's', 'હ': 'h', 'ળ': 'l',
    };
    
    // Independent vowels (at start of word or standalone)
    const vowels = {
      'અ': 'a', 'આ': 'aa', 'ઇ': 'i', 'ઈ': 'i', 'ઉ': 'u', 'ઊ': 'u',
      'એ': 'e', 'ઐ': 'ai', 'ઓ': 'o', 'ઔ': 'au', 'ઋ': 'ru',
    };
    
    // Vowel signs (matras) - simpler, natural pronunciation
    const matras = {
      'ા': 'a', 'િ': 'i', 'ી': 'i', 'ુ': 'u', 'ૂ': 'u',
      'ે': 'e', 'ૈ': 'ai', 'ો': 'o', 'ૌ': 'au', 'ૃ': 'ru',
    };
    
    // Special characters
    const special = {
      'ં': 'n', 'ઁ': 'n', 'ઃ': 'h', '્': '', // halant removes inherent vowel
      '।': '.', '॥': '.',
      // Numbers
      '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4',
      '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',
    };
    
    // Helper to check if character is a word boundary
    const isWordBoundary = (ch) => {
      return !ch || ch === ' ' || ch === '\n' || ch === '\t' || 
             ch === ',' || ch === '।' || ch === '॥' || ch === '.' ||
             ch === '(' || ch === ')' || ch === '-' || ch === '…';
    };
    
    // Helper to check if next char is end of word or special
    const isEndContext = (nextCh) => {
      return isWordBoundary(nextCh) || special[nextCh] !== undefined;
    };
    
    let result = '';
    let i = 0;
    let isStartOfSentence = true;
    
    while (i < text.length) {
      const char = text[i];
      const nextChar = text[i + 1] || '';
      
      // Track sentence starts for capitalization
      if (char === '\n' || char === '.' || char === '।' || char === '॥') {
        isStartOfSentence = true;
        result += char;
        i++;
        continue;
      }
      
      // Skip spaces but track them
      if (char === ' ' || char === '\t') {
        result += char;
        i++;
        continue;
      }
      
      // Check for independent vowels (2-char like આ first)
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
      
      // Check for single independent vowel
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
      
      // Check for consonant
      if (consonants[char]) {
        let consonantRoman = consonants[char];
        
        // Capitalize if start of sentence
        if (isStartOfSentence) {
          consonantRoman = consonantRoman[0].toUpperCase() + consonantRoman.slice(1);
          isStartOfSentence = false;
        }
        
        // Check what follows the consonant
        if (nextChar === '્') {
          // Halant - no vowel, consonant continues to next
          result += consonantRoman;
          i += 2; // skip consonant and halant
          continue;
        } else if (matras[nextChar]) {
          // Matra - use the matra vowel instead of inherent 'a'
          let matraValue = matras[nextChar];
          
          // Special handling for 'e' matra at end of word - add 'y' for natural sound
          // e.g., આંગણે → aanganey, બારણે → baraney
          const afterMatra = text[i + 2] || '';
          if (nextChar === 'ે' && isEndContext(afterMatra)) {
            matraValue = 'ey';
          }
          
          result += consonantRoman + matraValue;
          i += 2;
          continue;
        } else if (special[nextChar] !== undefined && nextChar !== '્') {
          // Special character like anusvara - add inherent 'a' then process special
          result += consonantRoman + 'a';
          i++;
          continue;
        } else if (isEndContext(nextChar) || consonants[nextChar] || vowels[nextChar] || vowels[nextChar + (text[i + 2] || '')]) {
          // End of word, next consonant, or next vowel - add inherent 'a'
          result += consonantRoman + 'a';
          i++;
          continue;
        } else {
          // Default: add consonant with inherent 'a'
          result += consonantRoman + 'a';
          i++;
          continue;
        }
      }
      
      // Check for special characters
      if (special[char] !== undefined) {
        result += special[char];
        i++;
        continue;
      }
      
      // Keep original character (punctuation, etc.)
      result += char;
      i++;
    }
    
    return result;
  };

  

  // Fallback: Open text in Google Translate
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

  const handleAutoTranslateContent = async (targetLangIndex) => {
    const gujaratiContent = getContentByLanguage(0);

    if (!gujaratiContent || !gujaratiContent.trim()) {
      setTranslationError('Please enter Gujarati content first');
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

  const handleAutoTranslateTitle = async (targetLangIndex) => {
    const gujaratiTitle = getTitleByLanguage(0);

    if (!gujaratiTitle || !gujaratiTitle.trim()) {
      setTranslationError('Please enter Gujarati title first');
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

  const getContentByLanguage = (langIndex) => {
    if (Array.isArray(content)) {
      return content[langIndex] || '';
    } else if (langIndex === 0 && typeof content === 'string') {
      return content;
    }
    return '';
  };

  const getTitleByLanguage = (langIndex) => {
    if (Array.isArray(title)) {
      return title[langIndex] || '';
    } else if (langIndex === 0 && typeof title === 'string') {
      return title;
    }
    return '';
  };

  const hasTitleForLanguage = (langIndex) => {
    return getTitleByLanguage(langIndex)?.trim().length > 0;
  };

  const hasContentForLanguage = (langIndex) => {
    return getContentByLanguage(langIndex)?.trim().length > 0;
  };

  const handleContentChange = (e, langIndex) => {
    const newValue = e.target.value;
    let newContent;

    if (Array.isArray(content)) {
      newContent = [...content];
      while (newContent.length <= langIndex) {
        newContent.push('');
      }
      newContent[langIndex] = newValue;
    } else {
      // Convert string to array, preserving existing content
      newContent = ['', '', ''];
      if (typeof content === 'string') {
        newContent[0] = content; // Always preserve Gujarati at index 0
      }
      newContent[langIndex] = newValue;
    }

    console.log('handleContentChange:', { langIndex, newValue, newContent, originalContent: content });
    setContent(newContent);
  };

  const handleTitleChange = (e, langIndex) => {
    const newValue = e.target.value;
    let newTitle;
    
    if (Array.isArray(title)) {
      newTitle = [...title];
      while (newTitle.length <= langIndex) {
        newTitle.push('');
      }
      newTitle[langIndex] = newValue;
    } else {
      newTitle = ['', '', ''];
      if (typeof title === 'string') {
        newTitle[0] = title;
      }
      newTitle[langIndex] = newValue;
    }
    
    setTitle(newTitle);
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

  const handleLanguageTabChange = (event, newValue) => {
    setSelectedLangTab(newValue);
  };

  const handleTitleLanguageTabChange = (event, newValue) => {
    setSelectedTitleLangTab(newValue);
  };

  const getLanguageName = (index) => {
    const languages = ['Gujarati', 'Hindi', 'English'];
    return languages[index] || '';
  };

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
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <TranslateIcon sx={{ color: '#fff' }} />
                    <Typography variant="subtitle1" fontWeight="medium" sx={{ color: '#fff' }}>
                      Song Title in Multiple Languages
                    </Typography>
                  </Stack>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Tabs 
                      value={selectedTitleLangTab} 
                      onChange={handleTitleLanguageTabChange} 
                      variant="scrollable"
                      scrollButtons="auto"
                      textColor="primary"
                      indicatorColor="primary"
                      sx={{ 
                        borderBottom: 1, 
                        borderColor: 'rgba(255,255,255,0.1)',
                        minHeight: '48px',
                        flex: 1,
                        '& .MuiTab-root': {
                          color: '#999',
                          '&.Mui-selected': {
                            color: '#fff',
                          },
                        },
                      }}
                    >
                      <Tab 
                        icon={
                          <Box sx={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
                            <span>Gujarati</span>
                            <LanguageIndicator filled={hasTitleForLanguage(0)} />
                          </Box>
                        } 
                        sx={{ minHeight: '48px' }}
                      />
                      <Tab 
                        icon={
                          <Box sx={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
                            <span>Hindi</span>
                            <LanguageIndicator filled={hasTitleForLanguage(1)} />
                          </Box>
                        } 
                        sx={{ minHeight: '48px' }}
                      />
                      <Tab 
                        icon={
                          <Box sx={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
                            <span>English</span>
                            <LanguageIndicator filled={hasTitleForLanguage(2)} />
                          </Box>
                        } 
                        sx={{ minHeight: '48px' }}
                      />
                    </Tabs>
                  </Box>

                  <Box sx={{ p: 1 }}>
                    {selectedTitleLangTab === 0 && (
                      <TextField
                        label={`${getLanguageName(selectedTitleLangTab)} Title`}
                        variant="outlined"
                        fullWidth
                        required={selectedTitleLangTab === 0}
                        value={getTitleByLanguage(0)}
                        onChange={(e) => handleTitleChange(e, 0)}
                        error={(!getTitleByLanguage(0) && selectedTitleLangTab === 0) && !!error}
                        helperText={(!getTitleByLanguage(0) && selectedTitleLangTab === 0 && !!error) ? 
                          "Gujarati title is required" : "Primary title (required)"}
                        sx={darkTextFieldSx}
                      />
                    )}
                    {selectedTitleLangTab === 1 && (
                      <Box>
                        <TextField
                          label={`${getLanguageName(selectedTitleLangTab)} Title`}
                          variant="outlined"
                          fullWidth
                          value={getTitleByLanguage(1)}
                          onChange={(e) => handleTitleChange(e, 1)}
                          helperText="Same pronunciation in Devanagari script (not translation)"
                          sx={darkTextFieldSx}
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Tooltip title="Convert to same pronunciation in Hindi/Devanagari script (transliteration, not translation)" arrow>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={translatingTitle ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
                              onClick={() => handleAutoTranslateTitle(1)}
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
                      </Box>
                    )}
                    {selectedTitleLangTab === 2 && (
                      <Box>
                        <TextField
                          label={`${getLanguageName(selectedTitleLangTab)} Title`}
                          variant="outlined"
                          fullWidth
                          value={getTitleByLanguage(2)}
                          onChange={(e) => handleTitleChange(e, 2)}
                          helperText="Same pronunciation in Roman/English script (not translation)"
                          sx={darkTextFieldSx}
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Tooltip title="Convert to same pronunciation in Roman/English script (transliteration, not translation)" arrow>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={translatingTitle ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
                              onClick={() => handleAutoTranslateTitle(2)}
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
                      </Box>
                    )}
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
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <TranslateIcon sx={{ color: '#fff' }} />
                    <Typography variant="subtitle1" fontWeight="medium" sx={{ color: '#fff' }}>
                      Content in Multiple Languages
                    </Typography>
                  </Stack>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Tabs 
                      value={selectedLangTab} 
                      onChange={handleLanguageTabChange} 
                      variant="scrollable"
                      scrollButtons="auto"
                      textColor="primary"
                      indicatorColor="primary"
                      sx={{ 
                        borderBottom: 1, 
                        borderColor: 'rgba(255,255,255,0.1)',
                        minHeight: '48px',
                        flex: 1,
                        '& .MuiTab-root': {
                          color: '#999',
                          '&.Mui-selected': {
                            color: '#fff',
                          },
                        },
                      }}
                    >
                      <Tab 
                        icon={
                          <Box sx={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
                            <span>Gujarati</span>
                            <LanguageIndicator filled={hasContentForLanguage(0)} />
                          </Box>
                        } 
                        sx={{ minHeight: '48px' }}
                      />
                      <Tab 
                        icon={
                          <Box sx={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
                            <span>Hindi</span>
                            <LanguageIndicator filled={hasContentForLanguage(1)} />
                          </Box>
                        } 
                        sx={{ minHeight: '48px' }}
                      />
                      <Tab 
                        icon={
                          <Box sx={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
                            <span>English</span>
                            <LanguageIndicator filled={hasContentForLanguage(2)} />
                          </Box>
                        } 
                        sx={{ minHeight: '48px' }}
                      />
                    </Tabs>
                  </Box>

                  <Box sx={{ p: 1 }}>
                    {selectedLangTab === 0 && (
                      <TextField
                        label={`${getLanguageName(selectedLangTab)} Content`}
                        variant="outlined"
                        fullWidth
                        required={selectedLangTab === 0}
                        multiline
                        rows={4}
                        value={getContentByLanguage(0)}
                        onChange={(e) => handleContentChange(e, 0)}
                        error={(!getContentByLanguage(0) && selectedLangTab === 0) && !!error}
                        helperText={(!getContentByLanguage(0) && selectedLangTab === 0 && !!error) ? 
                          "Gujarati content is required" : "Primary content (required)"}
                        sx={darkTextFieldSx}
                      />
                    )}
                    {selectedLangTab === 1 && (
                      <Box>
                        <TextField
                          label={`${getLanguageName(selectedLangTab)} Content`}
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
                          <Tooltip title="Convert to same pronunciation in Hindi/Devanagari script (transliteration, not translation)" arrow>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={translatingContent ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
                              onClick={() => handleAutoTranslateContent(1)}
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
                      </Box>
                    )}
                    {selectedLangTab === 2 && (
                      <Box>
                        <TextField
                          label={`${getLanguageName(selectedLangTab)} Content`}
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
                          <Tooltip title="Convert to same pronunciation in Roman/English script (transliteration, not translation)" arrow>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={translatingContent ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
                              onClick={() => handleAutoTranslateContent(2)}
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
                      </Box>
                    )}
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
