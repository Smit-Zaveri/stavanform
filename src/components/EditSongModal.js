import React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Modal,
  Paper,
  Autocomplete,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const EditSongModal = ({
  editModalOpen,
  setEditModalOpen,
  formData,
  handleInputChange,
  artistOptions,
  handleEditorBlur,
  handleSave,
}) => {
  const theme = useTheme();

  // Style for the outer modal container (centering content)
  const modalStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    p: 2,
  };

  // Style for the modal content (using Paper for a card-like look)
  const contentStyle = {
    p: 4,
    borderRadius: 2,
    width: "100%",
    maxWidth: 600,
    maxHeight: "80vh",
    overflowY: "auto",
    backgroundColor: theme.palette.background.paper,
  };

  return (
    <Modal
      open={editModalOpen}
      onClose={() => setEditModalOpen(false)}
      aria-labelledby="edit-song-modal-title"
      aria-describedby="edit-song-modal-description"
    >
      <Box sx={modalStyle}>
        <Paper sx={contentStyle} elevation={3}>
          <Typography
            id="edit-song-modal-title"
            variant="h6"
            gutterBottom
            sx={{ mb: 2 }}
          >
            Edit Song
          </Typography>

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

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save Changes
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
};

export default EditSongModal;
