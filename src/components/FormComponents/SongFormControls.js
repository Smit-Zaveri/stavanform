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
  Chip,
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
  Stack
} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { isValidYouTubeURL } from '../../utils/validators';
import CancelIcon from '@mui/icons-material/Cancel';
import TranslateIcon from '@mui/icons-material/Translate';

const filter = createFilterOptions();

const LanguageIndicator = ({ filled }) => (
  <Badge 
    variant="dot"
    color={filled ? "success" : "default"}
    sx={{ 
      '& .MuiBadge-badge': {
        right: -4,
        top: 13,
      }
    }}
  >
    <div style={{ width: 12, height: 12 }} />
  </Badge>
);

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

  // Get content for current language or empty string
  const getContentByLanguage = (langIndex) => {
    // Handle content whether it's an array or string
    if (Array.isArray(content)) {
      return content[langIndex] || '';
    } else if (langIndex === 0 && typeof content === 'string') {
      // If we have legacy content (string), show it in the first tab
      return content;
    }
    return '';
  };

  // Get title for current language or empty string
  const getTitleByLanguage = (langIndex) => {
    // Handle title whether it's an array or string
    if (Array.isArray(title)) {
      return title[langIndex] || '';
    } else if (langIndex === 0 && typeof title === 'string') {
      // If we have legacy title (string), show it in the first tab
      return title;
    }
    return '';
  };

  // Check if a title exists for a specific language
  const hasTitleForLanguage = (langIndex) => {
    return getTitleByLanguage(langIndex)?.trim().length > 0;
  };

  // Check if content exists for a specific language
  const hasContentForLanguage = (langIndex) => {
    return getContentByLanguage(langIndex)?.trim().length > 0;
  };

  // Update content for a specific language
  const handleContentChange = (e, langIndex) => {
    const newValue = e.target.value;
    let newContent;
    
    if (Array.isArray(content)) {
      // Create a copy of the existing content array
      newContent = [...content];
      // Ensure the array has enough elements
      while (newContent.length <= langIndex) {
        newContent.push('');
      }
      // Update the specific language
      newContent[langIndex] = newValue;
    } else {
      // Convert from string to array format
      newContent = ['', '', ''];
      if (typeof content === 'string' && langIndex === 0) {
        // Preserve existing content in first language slot
        newContent[0] = content;
      }
      newContent[langIndex] = newValue;
    }
    
    setContent(newContent);
  };

  // Update title for a specific language
  const handleTitleChange = (e, langIndex) => {
    const newValue = e.target.value;
    let newTitle;
    
    if (Array.isArray(title)) {
      // Create a copy of the existing title array
      newTitle = [...title];
      // Ensure the array has enough elements
      while (newTitle.length <= langIndex) {
        newTitle.push('');
      }
      // Update the specific language
      newTitle[langIndex] = newValue;
    } else {
      // Convert from string to array format
      newTitle = ['', '', ''];
      if (typeof title === 'string') {
        // Preserve existing title in first language slot
        newTitle[0] = title;
      }
      newTitle[langIndex] = newValue;
    }
    
    setTitle(newTitle);
  };

  // Memoize the combined tags to prevent unnecessary recalculations
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
    // Ensure newValue is always an array and clean up tags
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
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Song Details
          </Typography>
          {mode === 'edit' && selectedCollection !== previousCollection && previousCollection && (
            <Alert severity="info" sx={{ mb: 2 }}>
              This song will be moved from "{previousCollection}" to "{selectedCollection}"
            </Alert>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!selectedCollection && !!error}>
                <InputLabel>Select Collection</InputLabel>
                <Select
                  value={selectedCollection}
                  onChange={handleCollectionChange}
                  label="Select Collection"
                >
                  <MenuItem value="">
                    <em>Select a collection</em>
                  </MenuItem>
                  {collectionOptions.map((coll) => (
                    <MenuItem key={coll.id} value={coll.name}>
                      {coll.name.charAt(0).toUpperCase() + coll.name.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {mode === 'edit' && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    Changing collection will move this song to the selected collection
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2, overflow: 'visible' }}>
                <CardContent sx={{ pb: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <TranslateIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight="medium">
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
                        borderColor: 'divider',
                        minHeight: '48px',
                        flex: 1
                      }}
                    >
                      <Tab 
                        icon={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <span>Gujarati</span>
                            <LanguageIndicator filled={hasTitleForLanguage(0)} />
                          </Box>
                        } 
                        sx={{ minHeight: '48px' }}
                      />
                      <Tab 
                        icon={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <span>Hindi</span>
                            <LanguageIndicator filled={hasTitleForLanguage(1)} />
                          </Box>
                        } 
                        sx={{ minHeight: '48px' }}
                      />
                      <Tab 
                        icon={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                      />
                    )}
                    {selectedTitleLangTab === 1 && (
                      <TextField
                        label={`${getLanguageName(selectedTitleLangTab)} Title`}
                        variant="outlined"
                        fullWidth
                        value={getTitleByLanguage(1)}
                        onChange={(e) => handleTitleChange(e, 1)}
                        helperText="Optional Hindi title"
                      />
                    )}
                    {selectedTitleLangTab === 2 && (
                      <TextField
                        label={`${getLanguageName(selectedTitleLangTab)} Title`}
                        variant="outlined"
                        fullWidth
                        value={getTitleByLanguage(2)}
                        onChange={(e) => handleTitleChange(e, 2)}
                        helperText="Optional English title"
                      />
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
                renderInput={(params) => (
                  <TextField {...params} label="Artist" variant="outlined" fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Tirthankar</InputLabel>
                <Select
                  value={selectedTirthankar}
                  onChange={(e) => setSelectedTirthankar(e.target.value)}
                  label="Select Tirthankar"
                >
                  <MenuItem value="">
                    <em>Clear Selection</em>
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
                  variant: 'filled'
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

                  // Handle comma-separated input
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
                  <Paper {...props} sx={{ maxHeight: 200, overflowY: 'auto' }} />
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
                      // Removed custom padding to match other fields
                      '& .MuiOutlinedInput-root': {
                        flexWrap: 'wrap',
                        gap: 0.5,
                        '& .MuiChip-root': {
                          margin: '2px'
                        }
                      }
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={index}
                      label={option}
                      onDelete={() => {
                        const newTags = tags.filter((_, i) => i !== index);
                        setTags(newTags);
                      }}
                      sx={{
                        m: 0.5,
                        borderRadius: '16px',
                        '& .MuiChip-deleteIcon': {
                          color: 'rgba(0, 0, 0, 0.6)',
                          '&:hover': {
                            color: 'rgba(0, 0, 0, 0.87)'
                          }
                        }
                      }}
                    />
                  ))
                }
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
              />
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2, overflow: 'visible' }}>
                <CardContent sx={{ pb: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <TranslateIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight="medium">
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
                        borderColor: 'divider',
                        minHeight: '48px',
                        flex: 1
                      }}
                    >
                      <Tab 
                        icon={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <span>Gujarati</span>
                            <LanguageIndicator filled={hasContentForLanguage(0)} />
                          </Box>
                        } 
                        sx={{ minHeight: '48px' }}
                      />
                      <Tab 
                        icon={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <span>Hindi</span>
                            <LanguageIndicator filled={hasContentForLanguage(1)} />
                          </Box>
                        } 
                        sx={{ minHeight: '48px' }}
                      />
                      <Tab 
                        icon={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                      />
                    )}
                    {selectedLangTab === 1 && (
                      <TextField
                        label={`${getLanguageName(selectedLangTab)} Content`}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        value={getContentByLanguage(1)}
                        onChange={(e) => handleContentChange(e, 1)}
                        helperText="Optional Hindi content"
                      />
                    )}
                    {selectedLangTab === 2 && (
                      <TextField
                        label={`${getLanguageName(selectedLangTab)} Content`}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        value={getContentByLanguage(2)}
                        onChange={(e) => handleContentChange(e, 2)}
                        helperText="Optional English content"
                      />
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
                  />
                }
                label="New"
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
      >
        <DialogTitle id="change-collection-dialog-title">
          Change Collection
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="change-collection-dialog-description">
            Are you sure you want to move this song to a different collection? This action will move the song from "{previousCollection}" to "{pendingCollectionChange}".
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCollectionChange} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmCollectionChange} color="primary" variant="contained">
            Move Song
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SongFormControls;