import { useState, useEffect } from 'react';
import { firestore } from '../firebase';

export const useCollectionForm = (collectionName) => {
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    numbering: 1,
    picture: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  // Add effect to set default numbering based on collection length
  useEffect(() => {
    const fetchCollectionLength = async () => {
      try {
        const snapshot = await firestore.collection(collectionName).get();
        const length = snapshot.docs.length;
        setFormData(prev => ({
          ...prev,
          numbering: length + 1
        }));
      } catch (error) {
        console.error("Error fetching collection length:", error);
      }
    };

    if (!editingId) {
      fetchCollectionLength();
    }
  }, [collectionName, editingId]);

  const resetForm = () => {
    setEditingId(null);
    setError("");
    // Don't reset numbering here as it will be handled by the useEffect
    setFormData(prev => ({
      name: "",
      displayName: "",
      numbering: prev.numbering,
      picture: "",
    }));
  };

  const setEditData = (collection) => {
    setEditingId(collection.id);
    setFormData({
      name: collection.name,
      displayName: collection.displayName,
      numbering: collection.numbering,
      picture: collection.picture,
    });
    setError("");
  };

  const validateForm = () => {
    const { name, displayName, numbering } = formData;
    if (!name || !displayName || !numbering) {
      setError("Please fill in all required fields and provide a valid order number.");
      return false;
    }
    return true;
  };

  return {
    formData,
    setFormData,
    editingId,
    error,
    resetForm,
    setEditData,
    validateForm,
  };
};