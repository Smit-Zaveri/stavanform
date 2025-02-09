import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { createFilterOptions } from "@mui/material/Autocomplete";

const filter = createFilterOptions();

const TagsInput = ({
  tags,
  setTags,
  tagInput,
  setTagInput,
  combinedTagSuggestions
}) => {
  // eslint-disable-next-line no-unused-vars
  const commitTagInput = () => {
    const newTags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");
    if (newTags.length > 0) {
      setTags((prevTags) => [...prevTags, ...newTags]);
    }
    setTagInput("");
  };

  return (
    <Autocomplete
      multiple
      freeSolo
      options={combinedTagSuggestions}
      value={tags}
      onChange={(event, newValue) => setTags(newValue)}
      inputValue={tagInput}
      onInputChange={(event, newInputValue) => {
        if (newInputValue.endsWith(",")) {
          const newTags = newInputValue
            .split(",")
            .map((t) => t.trim().replace(/,/g, ""))
            .filter((t) => t !== "");

          if (newTags.length > 0) {
            setTags((prev) => [...prev, ...newTags]);
            setTagInput("");
            return;
          }
        }
        setTagInput(newInputValue);
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        const inputValue = params.inputValue.trim();

        if (inputValue && !filtered.includes(inputValue.replace(/,/g, ""))) {
          filtered.push(inputValue.replace(/,/g, ""));
        }

        return filtered;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Tags"
          variant="outlined"
          fullWidth
          helperText="Separate tags with commas"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Tab") {
              if (tagInput.trim()) {
                setTags((prev) => [...prev, tagInput.trim()]);
                setTagInput("");
              }
              e.preventDefault();
            }
          }}
          onBlur={() => {
            if (tagInput.trim()) {
              setTags((prev) => [...prev, tagInput.trim()]);
              setTagInput("");
            }
          }}
        />
      )}
    />
  );
};

export default TagsInput;