import { useState, useEffect } from "react";
import { firestore } from "./firebase";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControlLabel,
} from "@mui/material";

const Form = () => {
  const [numbering, setNumbering] = useState(1); // Initial numbering value
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [youtube, setYoutube] = useState("");
  const [newFlag, setNewFlag] = useState(false); // New flag default set to false
  const [artistOptions, setArtistOptions] = useState([]);

  useEffect(() => {
    // Fetch the artist options from the artist collection
    const fetchArtistOptions = async () => {
      try {
        const snapshot = await firestore.collection("artists").get();
        const artistList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setArtistOptions(artistList);
      } catch (error) {
        console.error("Error fetching artist options:", error);
      }
    };

    fetchArtistOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!title || !numbering || !tags || !content) {
        console.log("Form fields are empty. Cannot submit.");
        return;
      }

      const publishDate = firebase.firestore.Timestamp.now(); // Get the current timestamp

      const docRef = await firestore.collection("lyrics").add({
        numbering,
        title,
        artist,
        tags: tags.split(",").map((tag) => tag.trim().toLowerCase()),
        content,
        youtube, // Add the youtubeLink field
        publishDate,
        newFlag, // Add the newFlag field
      });
      console.log("Document written with ID:", docRef.id);

      // Reset form fields
      setNumbering(numbering + 1);
      setTitle("");
      setArtist("");
      setTags("");
      setContent("");
      setYoutube("");
      setNewFlag(false); // Reset newFlag to false after submission
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 600, mx: "auto", p: 2, display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Typography variant="h5" gutterBottom>
        Add New Song
      </Typography>

      {/* Numbering Field */}
      <TextField
        label="Numbering"
        type="number"
        variant="outlined"
        fullWidth
        value={numbering}
        onChange={(e) => setNumbering(parseInt(e.target.value))}
      />

      {/* Title Field */}
      <TextField
        label="Title"
        variant="outlined"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Artist Selection */}
      <FormControl fullWidth>
        <InputLabel>Artist</InputLabel>
        <Select
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          label="Artist"
        >
          <MenuItem value="">
            <em>Select an artist</em>
          </MenuItem>
          {artistOptions.map((option) => (
            <MenuItem key={option.id} value={option.name}>
              {option.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Tags Field */}
      <TextField
        label="Tags (comma-separated)"
        variant="outlined"
        fullWidth
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      {/* YouTube Link */}
      <TextField
        label="YouTube Link"
        variant="outlined"
        fullWidth
        value={youtube}
        onChange={(e) => setYoutube(e.target.value)}
      />

      {/* Content Field */}
      <TextField
        label="Content"
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* New Flag */}
      <FormControlLabel
        control={
          <Checkbox
            checked={newFlag}
            onChange={(e) => setNewFlag(e.target.checked)}
          />
        }
        label="New"
      />

      {/* Submit Button */}
      <Button variant="contained" color="primary" type="submit">
        Submit
      </Button>
    </Box>
  );
};

export default Form;
