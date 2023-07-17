import React, { useState, useEffect } from "react";
import { firestore } from "./firebase";
import "./CollectionForm.css";

const CollectionForm = () => {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const snapshot = await firestore.collection("collections").get();
      const collectionList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCollections(collectionList);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!name || !displayName) {
        setError("Please fill in all fields.");
        return;
      }

      const collectionData = {
        name,
        displayName,
      };

      await firestore.collection("collections").add(collectionData);
      console.log("Collection added successfully.");

      setName("");
      setDisplayName("");
      setError(null);

      fetchCollections(); // Reload data after submission
    } catch (error) {
      console.error("Error adding collection:", error);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      try {
        await firestore.collection("collections").doc(collectionId).delete();
        console.log("Collection deleted with ID:", collectionId);

        fetchCollections(); // Reload data after deletion
      } catch (error) {
        console.error("Error deleting collection:", error);
      }
    }
  };

  return (
    <div>
      <form className="form" onSubmit={handleSubmit}>
        <label className="form-label">Name:</label>
        <input
          type="text"
          className="form-input"
          placeholder="Name"
          value={name}
          onChange={handleNameChange}
        />
        <label className="form-label">Display Name:</label>
        <input
          type="text"
          className="form-input"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="form-button">
          Submit
        </button>
      </form>

      <div className="collection-list">
        <h2>Collections:</h2>
        <ul>
          {collections.map((collection) => (
            <li key={collection.id}>
              {collection.name} - {collection.displayName}{" "}
              <button onClick={() => handleDeleteCollection(collection.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CollectionForm;
