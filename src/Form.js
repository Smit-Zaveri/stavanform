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
        tags: tags.split(',').map((tag) => tag.trim()),
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
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Numbering"
        value={numbering}
        onChange={(e) => setNumbering(parseInt(e.target.value))}
      />
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Artist"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
      />
      <input
        type="text"
        placeholder="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default Form;
