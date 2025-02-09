import React from "react";
import { TextField, Autocomplete } from "@mui/material";

const SongFormFields = ({
  formData,
  handleInputChange,
  artistOptions,
  handleEditorBlur,
}) => {
  return (
    <>
      <TextField
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        fullWidth
        required
        inputProps={{ maxLength: 100 }}
        sx={{ mb: 2 }}
      />

      <Autocomplete
        freeSolo
        options={artistOptions.map((option) => option.name)}
        value={formData.artist}
        onInputChange={(e, value) => {
          handleInputChange({ target: { name: "artist", value } });
          handleEditorBlur();
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Artist"
            name="artist"
            required
            sx={{ mb: 2 }}
          />
        )}
      />

      <TextField
        label="Tags"
        name="tags"
        value={formData.tags}
        onChange={handleInputChange}
        fullWidth
        helperText="Separate tags with commas"
        sx={{ mb: 2 }}
      />

      <TextField
        label="Order"
        name="order"
        type="number"
        value={formData.order}
        onChange={handleInputChange}
        inputProps={{ min: 1 }}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="YouTube Link"
        name="youtube"
        value={formData.youtube}
        onChange={handleInputChange}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="Lyrics Content"
        name="content"
        value={formData.content}
        onChange={handleInputChange}
        multiline
        minRows={3}
        fullWidth
        required
        sx={{ mb: 3 }}
      />
    </>
  );
};

export default SongFormFields;