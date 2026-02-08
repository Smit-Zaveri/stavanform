import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Tabs,
  Tab,
  Stack,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import TranslateIcon from "@mui/icons-material/Translate";

const CollectionFormFields = ({
  formData,
  setFormData,
  editingId,
  error,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [selectedLangTab, setSelectedLangTab] = useState(0);
  const [translating, setTranslating] = useState(false);

  const handleDisplayNameChange = (index, value) => {
    const newDisplayNames = [...formData.displayName];
    newDisplayNames[index] = value;
    setFormData({ ...formData, displayName: newDisplayNames });
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

  const handleAutoTranslate = async (targetLangIndex) => {
    const gujaratiName = formData.displayName[0];

    if (!gujaratiName || !gujaratiName.trim()) {
      return;
    }

    setTranslating(true);

    try {
      const targetLanguage = targetLangIndex === 1 ? 'Hindi' : 'English';
      const transliteratedText = transliterateGujarati(gujaratiName, targetLanguage);

      const newDisplayNames = [...formData.displayName];
      newDisplayNames[targetLangIndex] = transliteratedText;
      setFormData({ ...formData, displayName: newDisplayNames });
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslating(false);
    }
  };

  const handleLanguageTabChange = (event, newValue) => {
    setSelectedLangTab(newValue);
  };

  const getLanguageName = (index) => {
    const languages = ['Gujarati', 'Hindi', 'English'];
    return languages[index] || '';
  };

  return (
    <Card variant="outlined" sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {editingId ? "Edit Collection" : "Create New Collection"}
        </Typography>
        <Box component="form" onSubmit={onSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                error={!!error}
                helperText={error && " "}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Order Number"
                variant="outlined"
                fullWidth
                type="number"
                value={formData.numbering}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numbering: Number(e.target.value),
                  })
                }
                error={!!error}
                helperText={error && " "}
              />
            </Grid>
            
             {/* Multilingual Display Names */}
             <Grid item xs={12}>
               <Card variant="outlined" sx={{ mb: 2, bgcolor: '#252525', borderColor: 'rgba(255,255,255,0.1)' }}>
                 <CardContent>
                   <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                     <TranslateIcon sx={{ color: '#fff' }} />
                     <Typography variant="subtitle1" fontWeight="medium" sx={{ color: '#fff' }}>
                       Display Name in Multiple Languages
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
                       <Tab label="Gujarati" sx={{ minHeight: '48px' }} />
                       <Tab label="Hindi" sx={{ minHeight: '48px' }} />
                       <Tab label="English" sx={{ minHeight: '48px' }} />
                     </Tabs>
                   </Box>

                   <Box sx={{ p: 1 }}>
                     {selectedLangTab === 0 && (
                       <TextField
                         label={`${getLanguageName(selectedLangTab)} Display Name`}
                         variant="outlined"
                         fullWidth
                         required={selectedLangTab === 0}
                         value={formData.displayName[0]}
                         onChange={(e) => handleDisplayNameChange(0, e.target.value)}
                         error={!!error}
                         helperText={error && "Gujarati display name is required"}
                         placeholder="સ્મિત"
                         InputProps={{
                           style: { fontFamily: 'Noto Sans Gujarati, sans-serif' }
                         }}
                         sx={{
                           '& .MuiOutlinedInput-root': {
                             backgroundColor: '#1a1a1a',
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
                         }}
                       />
                     )}
                     {selectedLangTab === 1 && (
                       <Box>
                         <TextField
                           label={`${getLanguageName(selectedLangTab)} Display Name`}
                           variant="outlined"
                           fullWidth
                           value={formData.displayName[1]}
                           onChange={(e) => handleDisplayNameChange(1, e.target.value)}
                           helperText="Same pronunciation in Devanagari script (not translation)"
                           placeholder="स्मित"
                           InputProps={{
                             style: { fontFamily: 'Noto Sans Devanagari, sans-serif' }
                           }}
                           sx={{
                             '& .MuiOutlinedInput-root': {
                               backgroundColor: '#1a1a1a',
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
                           }}
                         />
                         <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                           <Tooltip title="Convert to same pronunciation in Hindi/Devanagari script (transliteration, not translation)" arrow>
                             <Button
                               variant="outlined"
                               size="small"
                               startIcon={translating ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
                               onClick={() => handleAutoTranslate(1)}
                               disabled={translating || !formData.displayName[0]?.trim()}
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
                               {translating ? 'Converting...' : 'Convert to Hindi script'}
                             </Button>
                           </Tooltip>
                           <Button
                             variant="text"
                             size="small"
                             onClick={() => openInGoogleTranslate(formData.displayName[0], 'Hindi')}
                             disabled={!formData.displayName[0]?.trim()}
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
                           label={`${getLanguageName(selectedLangTab)} Display Name`}
                           variant="outlined"
                           fullWidth
                           value={formData.displayName[2]}
                           onChange={(e) => handleDisplayNameChange(2, e.target.value)}
                           helperText="Same pronunciation in Roman/English script (not translation)"
                           placeholder="Smit"
                           sx={{
                             '& .MuiOutlinedInput-root': {
                               backgroundColor: '#1a1a1a',
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
                           }}
                         />
                         <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                           <Tooltip title="Convert to same pronunciation in Roman/English script (transliteration, not translation)" arrow>
                             <Button
                               variant="outlined"
                               size="small"
                               startIcon={translating ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
                               onClick={() => handleAutoTranslate(2)}
                               disabled={translating || !formData.displayName[0]?.trim()}
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
                               {translating ? 'Converting...' : 'Convert to English script'}
                             </Button>
                           </Tooltip>
                           <Button
                             variant="text"
                             size="small"
                             onClick={() => openInGoogleTranslate(formData.displayName[0], 'English')}
                             disabled={!formData.displayName[0]?.trim()}
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

            <Grid item xs={12}>
              <TextField
                label="Picture URL (Optional)"
                variant="outlined"
                fullWidth
                value={formData.picture}
                onChange={(e) =>
                  setFormData({ ...formData, picture: e.target.value })
                }
                error={!!error}
                helperText={error && " "}
              />
            </Grid>
            
            {/* Picture Preview */}
            {formData.picture && (
              <Grid item xs={12}>
                <Box
                  component="img"
                  src={formData.picture}
                  alt="Preview"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "150px",
                    mt: 1,
                    borderRadius: 1,
                    border: "1px solid #ccc",
                  }}
                />
              </Grid>
            )}
            
            <Grid item xs={12} md={editingId ? 6 : 12}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? "Loading..." : editingId ? "Update Collection" : "Submit"}
              </Button>
            </Grid>
            {editingId && (
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={onCancel}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Cancel Edit
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CollectionFormFields;