import React from 'react';
import { Autocomplete, TextField, Chip } from '@mui/material';
import { createFilterOptions } from "@mui/material/Autocomplete";

const filter = createFilterOptions();

const TagsInput = ({
  tags,
  setTags,
  tagInput,
  setTagInput,
  combinedTagSuggestions
}) => {
  return (
    <Autocomplete
      multiple
      freeSolo
      options={combinedTagSuggestions}
      value={tags}
      onChange={(event, newValue) => {
        setTags(newValue);
      }}
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
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            label={option}
            color="secondary"
            variant="outlined"
            size="small"
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Tags"
          variant="outlined"
          fullWidth
          helperText="Separate tags with commas."
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