import { useState } from 'react';

export const useCollectionForm = (initialCollections = []) => {
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    numbering: initialCollections.length + 1,
    picture: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const resetForm = () => {
    setFormData({
      name: "",
      displayName: "",
      numbering: initialCollections.length + 1,
      picture: "",
    });
    setEditingId(null);
    setError("");
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