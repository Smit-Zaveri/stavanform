import React, { useState, useEffect } from 'react';
import { firestore } from './firebase';
import './TagForm.css';

const TagForm = () => {
  const [tags, setTags] = useState([]);
  const [tagName, setTagName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const snapshot = await firestore.collection('tags').get();
        const fetchedTags = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTags(fetchedTags);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const docRef = await firestore.collection('tags').add({
        name: tagName,
      });
      console.log('Tag added successfully');

      const updatedTags = [...tags, { id: docRef.id, name: tagName }];
      setTags(updatedTags);
      setTagName('');
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleDelete = async (tagId) => {
    setConfirmDeleteId(tagId);
  };

  const confirmDelete = async () => {
    try {
      await firestore.collection('tags').doc(confirmDeleteId).delete();
      console.log('Tag deleted successfully');

      const updatedTags = tags.filter((tag) => tag.id !== confirmDeleteId);
      setTags(updatedTags);
      setConfirmDeleteId(null);
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="tag-form">
        <input
          type="text"
          placeholder="Tag Name"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
        />
        <button type="submit">Add Tag</button>
      </form>
      <div className="tag-list">
        {tags.map((tag) => (
          <div key={tag.id} className="tag-item">
            <span>{tag.name}</span>
            <button onClick={() => handleDelete(tag.id)}>Delete</button>
          </div>
        ))}
      </div>
      {confirmDeleteId && (
        <div className="confirm-dialog">
          <p>Are you sure you want to delete this tag?</p>
          <div>
            <button onClick={confirmDelete}>Confirm</button>
            <button onClick={cancelDelete}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagForm;
