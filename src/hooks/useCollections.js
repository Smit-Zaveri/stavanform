import { useState, useCallback } from 'react';
import { firestore } from '../firebase';

export const useCollections = (collectionName) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState('');

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await firestore
        .collection(collectionName)
        .orderBy("numbering")
        .get();
      const collectionList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCollections(collectionList);
      setError("");
      return { success: true, collections: collectionList };
    } catch (error) {
      setError("Error fetching collections. Please try again.");
      console.error("Error fetching collections:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  const addCollection = async (collectionData) => {
    try {
      await firestore.collection(collectionName).add(collectionData);
      return { success: true };
    } catch (error) {
      console.error("Error adding collection:", error);
      return { success: false, error };
    }
  };

  const updateCollection = async (id, collectionData) => {
    try {
      await firestore.collection(collectionName).doc(id).update(collectionData);
      return { success: true };
    } catch (error) {
      console.error("Error updating collection:", error);
      return { success: false, error };
    }
  };

  const deleteCollection = async (id) => {
    try {
      await firestore.collection(collectionName).doc(id).delete();
      return { success: true };
    } catch (error) {
      console.error("Error deleting collection:", error);
      return { success: false, error };
    }
  };

  const deleteMultipleCollections = async (ids) => {
    try {
      const batch = firestore.batch();
      ids.forEach((id) => {
        const docRef = firestore.collection(collectionName).doc(id);
        batch.delete(docRef);
      });
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error("Error deleting collections:", error);
      return { success: false, error };
    }
  };

  return {
    collections,
    loading,
    error,
    fetchCollections,
    addCollection,
    updateCollection,
    deleteCollection,
    deleteMultipleCollections,
  };
};