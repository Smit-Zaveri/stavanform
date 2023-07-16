import { useState, useEffect } from "react";
import { firestore } from "./firebase";
import firebase from "firebase/compat/app";
import "firebase/firestore";

const Catagory = () => {
  const [numbering, setNumbering] = useState(1); // Initial numbering value
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [youtube, setYoutube] = useState("");
  const [artistOptions, setArtistOptions] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [collectionList, setCollectionList] = useState([]);

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

  useEffect(() => {
    // Fetch the collection list from the "collections" collection
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

      const publishDate = firebase.firestore.Timestamp.now(); // Get the current timestamp

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
        youtube, // Add the youtubeLink field
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
    <form className="form" onSubmit={handleSubmit}>
      <label className="form-label">Select Collection:</label>
      <select
        className="form-input"
        value={selectedCollection}
        onChange={(e) => setSelectedCollection(e.target.value)}
      >
        <option value="">Select a collection</option>
        {collectionList.map((collection) => (
          <option key={collection.id} value={collection.id}>
            {collection.name}
          </option>
        ))}
      </select>

      <label className="form-label">Numbering:</label>
      <input
        type="number"
        className="form-input"
        placeholder="Numbering"
        value={numbering}
        onChange={(e) => setNumbering(parseInt(e.target.value))}
      />

      <label className="form-label">Title:</label>
      <input
        type="text"
        className="form-input"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="form-label">Artist:</label>
      <select
        className="form-input"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
      >
        <option value="">Select an artist</option>
        {artistOptions.map((option) => (
          <option key={option.id} value={option.name}>
            {option.name}
          </option>
        ))}
      </select>

      <label className="form-label">Tags (comma-separated):</label>
      <input
        type="text"
        className="form-input"
        placeholder="Tags"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <label className="form-label">YouTube Link:</label>
      <input
        type="text"
        className="form-input"
        placeholder="YouTube Link"
        value={youtube}
        onChange={(e) => setYoutube(e.target.value)}
      />

      <label className="form-label">Content:</label>
      <textarea
        className="form-textarea"
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button type="submit" className="form-button">
        Submit
      </button>
    </form>
  );
};

export default Catagory;
