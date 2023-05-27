import React, { useState } from 'react';
import { firestore } from './firebase';

const Form = () => {
  const [numbering, setNumbering] = useState(1); // Initial numbering value
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const docRef = await firestore.collection('lyrics').add({
        numbering, // Include the numbering value
        title,
        artist,
        tags: tags.split(',').map((tag) => tag.trim().toLowerCase()), // Convert tags to lowercase
        content,
      });
      console.log('Document written with ID:', docRef.id);

      // Reset form fields
      setNumbering(numbering + 1); // Increment the numbering value
      setTitle('');
      setArtist('');
      setTags('');
      setContent('');
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
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
      <input
        type="text"
        className="form-input"
        placeholder="Artist"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
      />

      <label className="form-label">Tags (comma-separated):</label>
      <input
        type="text"
        className="form-input"
        placeholder="Tags"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <label className="form-label">Content:</label>
      <textarea
        className="form-textarea"
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button type="submit" className="form-button">Submit</button>
    </form>
  );
};

export default Form;
