import React, { useState, useEffect } from "react";
import { firestore } from "./firebase";
import "./SongList.css";

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editNumbering, setEditNumbering] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editContent, setEditContent] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await firestore.collection("lyrics").get();
        const songsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSongs(songsData);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const performSearch = () => {
      const searchTerm = searchInput.toLowerCase();
      const filteredSongs = songs.filter((song) => {
        const { title, numbering, tags } = song;
        const lowercaseNumbering = String(numbering).toLowerCase(); // Convert numbering to string before calling toLowerCase
        return (
          title.toLowerCase().includes(searchTerm) ||
          lowercaseNumbering.includes(searchTerm) ||
          tags.some((tag) => tag.toLowerCase().includes(searchTerm))
        );
      });
      setSearchResults(filteredSongs);
    };

    performSearch();
  }, [searchInput, songs]);

  const handleDelete = async (id) => {
    try {
      const confirmation = window.confirm(
        "Are you sure you want to delete this song?"
      );
      if (confirmation) {
        await firestore.collection("lyrics").doc(id).delete();
        setSongs(songs.filter((song) => song.id !== id));
        console.log("Document deleted with ID:", id);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleEdit = async (id) => {
    try {
      if (
        !editTitle ||
        !editNumbering ||
        !editArtist ||
        !editTags ||
        !editContent
      ) {
        console.log("Form fields are empty. Cannot submit.");
        return;
      }
      await firestore
        .collection("lyrics")
        .doc(id)
        .update({
          title: editTitle,
          numbering: editNumbering,
          artist: editArtist,
          tags: editTags.split(",").map((tag) => tag.trim().toLowerCase()), // Convert tags to lowercase
          content: editContent,
        });
      console.log("Document updated with ID:", id);
      setEditId("");
      setEditTitle("");
      setEditNumbering("");
      setEditArtist("");
      setEditTags("");
      setEditContent("");

      // Refresh the data
      const snapshot = await firestore.collection("lyrics").get();
      const songsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSongs(songsData);
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const handleEditClick = (song) => {
    setEditId(song.id);
    setEditTitle(song.title);
    setEditNumbering(song.numbering);
    setEditArtist(song.artist);
    setEditTags(song.tags.join(", "));
    setEditContent(song.content);
  };

  return (
    <div className="song-list-container">
      <h2>Song List</h2>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by title, numbering, or tag"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      <ul className="song-list">
        {searchResults.map((song) => (
          <li key={song.id} className="song-item">
            <div className="song-id">ID: {song.id}</div>
            {editId === song.id ? (
              <div>
                <label>Title:</label>
                <input
                  type="text"
                  className="edit-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <label>Numbering:</label>
                <input
                  type="text"
                  className="edit-input"
                  value={editNumbering}
                  onChange={(e) => setEditNumbering(e.target.value)}
                />
                <label>Artist:</label>
                <input
                  type="text"
                  className="edit-input"
                  value={editArtist}
                  onChange={(e) => setEditArtist(e.target.value)}
                />
                <label>Tags:</label>
                <input
                  type="text"
                  className="edit-input"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                />
                <label>Content:</label>
                <textarea
                  className="edit-textarea"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <button
                  className="save-button"
                  onClick={() => handleEdit(song.id)}
                >
                  Save
                </button>
              </div>
            ) : (
              <div>
                <div className="song-title">Title: {song.title}</div>
                <div className="song-numbering">
                  Numbering: {song.numbering}
                </div>
                <div className="song-artist">Artist: {song.artist}</div>
                <div className="song-tags">Tags: {song.tags.join(", ")}</div>
                <button
                  className="edit-button"
                  onClick={() => handleEditClick(song)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(song.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SongList;
