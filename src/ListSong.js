import React, { useState, useEffect } from "react";
import { firestore } from "./firebase";
import "./SongList.css";

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [artistOptions, setArtistOptions] = useState([]);
  const [editNumbering, setEditNumbering] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editYoutubeLink, setEditYoutubeLink] = useState("");
  const [editContent, setEditContent] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [collectionList, setCollectionList] = useState([]);

  const [searchResults, setSearchResults] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const snapshot = await firestore.collection("reports").get();
        const reportsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(reportsData);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  const handleResolve = async (id) => {
    try {
      await firestore.collection("reports").doc(id).delete();
      setReports(reports.filter((report) => report.id !== id));
      console.log("Report resolved and deleted with ID:", id);
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await firestore.collection(selectedCollection).get();
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
  }, [selectedCollection]);

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
        await firestore.collection(selectedCollection).doc(id).delete();
        setSongs(songs.filter((song) => song.id !== id));
        console.log("Document deleted with ID:", id);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleEdit = async (id) => {
    try {
      if (!editTitle || !editNumbering || !editTags || !editContent) {
        console.log("Form fields are empty. Cannot submit.");
        return;
      }
      await firestore
        .collection(selectedCollection)
        .doc(id)
        .update({
          title: editTitle,
          numbering: editNumbering,
          artist: editArtist,
          tags: editTags.split(",").map((tag) => tag.trim().toLowerCase()),
          content: editContent,
          youtube: editYoutubeLink, // Add the youtubeLink field
        });

      console.log("Document updated with ID:", id);
      setEditId("");
      setEditTitle("");
      setEditNumbering("");
      setEditArtist("");
      setEditTags("");
      setEditYoutubeLink("");
      setEditContent("");

      // Refresh the data
      const snapshot = await firestore.collection(selectedCollection).get();
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
    setEditYoutubeLink(song.youtube);
    setEditContent(song.content);
  };

  return (
    <div className="song-list-container">
      <h2>Song List</h2>
      <div className="collection-select">
        <label>Select Collection:</label>
        <select
          className="form-input"
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
        >
          <option value="">Select a collection</option>
          <option selected value="lyrics">
            {" "}
            lyrics
          </option>
          {collectionList.map((collection) => (
            <option key={collection.id} value={collection.name}>
              {collection.name}
            </option>
          ))}
        </select>
      </div>

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
        {[
          ...searchResults.filter((song) =>
            reports.some(
              (report) =>
                report.lyricsId === song.id && report.lyricsTitle === song.title
            )
          ),
          ...searchResults.filter(
            (song) =>
              !reports.some(
                (report) =>
                  report.lyricsId === song.id &&
                  report.lyricsTitle === song.title
              )
          ),
        ].map((song) => {
          const hasReport = reports.some(
            (report) =>
              report.lyricsId === song.id && report.lyricsTitle === song.title
          );
          return (
            <li
              key={song.id}
              className={`song-item ${hasReport ? "has-report" : ""}`}
            >
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
                  <label>Artist:</label>
                  <select
                    className="edit-input"
                    value={editArtist}
                    onChange={(e) => setEditArtist(e.target.value)}
                  >
                    <option value="">Select an artist</option>
                    {artistOptions.map((option) => (
                      <option key={option.id} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>

                  <label>Tags:</label>
                  <input
                    type="text"
                    className="edit-input"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                  />
                  <label>YouTube Link:</label>
                  <input
                    type="text"
                    className="edit-input"
                    value={editYoutubeLink}
                    onChange={(e) => setEditYoutubeLink(e.target.value)}
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
              )}{" "}
              {reports.map((report) => {
                if (
                  report.lyricsId === song.id &&
                  report.lyricsTitle === song.title
                ) {
                  return (
                    <div key={report.id} className="report-item">
                      <div className="report-text">{report.reportText}</div>
                      <button
                        className="resolve-button"
                        onClick={() => handleResolve(report.id)}
                      >
                        Resolve
                      </button>
                    </div>
                  );
                }
                return null;
              })}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SongList;
