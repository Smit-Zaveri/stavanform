import { useState, useEffect } from "react";
import { firestore } from "./firebase";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

const Catagory = () => {
  const [numbering, setNumbering] = useState(1);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [youtube, setYoutube] = useState("");
  const [artistOptions, setArtistOptions] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [collectionList, setCollectionList] = useState([]);

  useEffect(() => {
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

  useEffect(() => {
    const fetchCollectionList = async () => {
      try {
        const snapshot = await firestore.collection("collections").get();
        const collectionList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCollectionList(collectionList);
      } catch (error) {
        console.error("Error fetching collection list:", error);
      }
    };

    fetchCollectionList();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!title || !numbering || !tags || !content) {
        console.log("Form fields are empty. Cannot submit.");
        return;
      }

      const publishDate = firebase.firestore.Timestamp.now();

      const collection = collectionList.find(
        (collection) => collection.id === selectedCollection
      );

      if (!collection) {
        console.log("Invalid collection selected. Cannot submit.");
        return;
      }

      const collectionRef = firestore.collection(collection.name);

      const docRef = await collectionRef.add({
        numbering,
        title,
        artist,
        tags: tags.split(",").map((tag) => tag.trim().toLowerCase()),
        content,
        youtube,
        publishDate,
      });
      console.log("Document written with ID:", docRef.id);

      // Reset form fields
      setNumbering(numbering + 1);
      setTitle("");
      setArtist("");
      setTags("");
      setContent("");
      setYoutube("");
      setSelectedCollection("");
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
        Add New Entry
      </Typography>

      {/* Select Collection */}
      <FormControl fullWidth>
        <InputLabel>Select Collection</InputLabel>
        <Select
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
        >
          <MenuItem value="">
            <em>Select a collection</em>
          </MenuItem>
          {collectionList.map((collection) => (
            <MenuItem key={collection.id} value={collection.id}>
              {collection.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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

      {/* Submit Button */}
      <Button variant="contained" color="primary" type="submit">
        Submit
      </Button>
    </Box>
  );
};

export default Catagory;
