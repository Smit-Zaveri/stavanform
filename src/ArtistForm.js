import React, { useState, useEffect } from "react";
import { firestore } from "./firebase"; // Import the 'firestore' module from the Firebase SDK
import "./ArtistForm.css";
const ArtistForm = () => {
  const [name, setName] = useState("");
  const [pictureUrl, setPictureUrl] = useState("");
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState(null);
  const [editingArtistId, setEditingArtistId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingPictureUrl, setEditingPictureUrl] = useState("");

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const snapshot = await firestore.collection("artists").get();
      const artistList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setArtists(artistList);
    } catch (error) {
      console.error("Error fetching artists:", error);
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    setError(null);
  };

  const handlePictureUrlChange = (e) => {
    setPictureUrl(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!name || !pictureUrl) {
        setError("Please fill in all fields.");
        return;
      }

      const artistData = {
        name,
        picture: pictureUrl,
      };

      await firestore.collection("artists").add(artistData);
      console.log("Artist added successfully.");

      setName("");
      setPictureUrl("");
      setError(null);

      fetchArtists(); // Reload data after submission
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  const handleDeleteArtist = async (artistId) => {
    if (window.confirm("Are you sure you want to delete this artist?")) {
      try {
        await firestore.collection("artists").doc(artistId).delete();
        console.log("Artist deleted with ID:", artistId);

        fetchArtists(); // Reload data after deletion
      } catch (error) {
        console.error("Error deleting artist:", error);
      }
    }
  };

  const handleEditArtist = (artist) => {
    setEditingArtistId(artist.id);
    setEditingName(artist.name);
    setEditingPictureUrl(artist.picture);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editingName || !editingPictureUrl) {
        setError("Please fill in all fields.");
        return;
      }

      const artistData = {
        name: editingName,
        picture: editingPictureUrl,
      };

      await firestore
        .collection("artists")
        .doc(editingArtistId)
        .update(artistData);
      console.log("Artist updated with ID:", editingArtistId);

      setEditingArtistId(null);
      setEditingName("");
      setEditingPictureUrl("");
      setError(null);

      fetchArtists(); // Reload data after saving edit
    } catch (error) {
      console.error("Error updating artist:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingArtistId(null);
    setEditingName("");
    setEditingPictureUrl("");
    setError(null);
  };

  return (
    <div className="artist-form-container">
      <form className="form" onSubmit={handleSubmit}>
        <label className="form-label">Name:</label>
        <input
          type="text"
          className="form-input"
          placeholder="Name"
          value={name}
          onChange={handleNameChange}
        />

        <label className="form-label">Picture URL:</label>
        <input
          type="text"
          className="form-input"
          placeholder="Picture URL"
          value={pictureUrl}
          onChange={handlePictureUrlChange}
        />

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="form-button">
          Submit
        </button>
      </form>

      <div className="artist-list">
        <h2>Artists:</h2>
        <ul>
          {artists.map((artist) => (
            <li key={artist.id} className="artist-item">
              {editingArtistId === artist.id ? (
                <>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Name"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Picture URL"
                    value={editingPictureUrl}
                    onChange={(e) => setEditingPictureUrl(e.target.value)}
                  />
                  {error && <p className="form-error">{error}</p>}
                  <button className="save-button" onClick={handleSaveEdit}>
                    Save
                  </button>
                  <button className="cancel-button" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div className="artist-name">{artist.name}</div>
                  <div className="artist-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEditArtist(artist)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteArtist(artist.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ArtistForm;
