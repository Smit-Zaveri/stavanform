import React, { useMemo } from 'react';
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
  Alert
} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { isValidYouTubeURL } from '../../utils/validators';
import CancelIcon from '@mui/icons-material/Cancel';

const filter = createFilterOptions();

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
  mode
}) => {
  const {
    title,
    artist,
    tags = [],
    order,
    content,
    youtube,
    newFlag,
    newTts,
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
    setNewTts,
    setSelectedTirthankar,
    setTagInput,
    commitTagInput
  } = setters;

  // Memoize the combined tags to prevent unnecessary recalculations
  const combinedTagSuggestions = useMemo(() => {
    const uniqueTags = new Set([
      ...tagsOptions,
      ...(tags || []),
      ...(tirthankarList?.map(t => t.name) || []),
      ...(tirthankarList?.map(t => t.displayName) || [])
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
      if (window.confirm('Changing collection will move this song to the new collection. Continue?')) {
        setSelectedCollection(newCollection);
      }
    } else {
      setSelectedCollection(newCollection);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Song Details
        </Typography>
        {mode === 'edit' && selectedCollection !== previousCollection && (
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

          <Grid item xs={12} md={6}>
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!title && !!error}
            />
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
            <TextField
              label="Content"
              variant="outlined"
              fullWidth
              required
              multiline
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              error={!content && !!error}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={newTts}
                  onChange={(e) => setNewTts(e.target.checked)}
                />
              }
              label="TTS"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SongFormControls;
