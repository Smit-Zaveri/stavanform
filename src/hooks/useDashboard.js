import { useState, useEffect, useCallback } from 'react';
import { firestore } from '../firebase';

const useDashboard = () => {
  const [collections, setCollections] = useState([]);
  const [totalStats, setTotalStats] = useState({
    totalCollections: 0,
    totalSongs: 0,
    recentActivity: 0,
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCollectionStats = useCallback(async (collectionName) => {
    try {
      const snapshot = await firestore.collection(collectionName).get();
      const songCount = snapshot.size;

      // Get last updated timestamp from the most recent document
      let lastUpdated = null;
      if (!snapshot.empty) {
        const docs = snapshot.docs.sort((a, b) => {
          const aTime = a.data().timestamp || a.data().createdAt || 0;
          const bTime = b.data().timestamp || b.data().createdAt || 0;
          return bTime - aTime;
        });
        const latestDoc = docs[0];
        lastUpdated = latestDoc.data().timestamp || latestDoc.data().createdAt || latestDoc.updateTime?.toMillis() || null;
      }

      return {
        songCount,
        lastUpdated
      };
    } catch (error) {
      console.error(`Error fetching stats for ${collectionName}:`, error);
      return {
        songCount: 0,
        lastUpdated: null
      };
    }
  }, []);

  const fetchCollectionsOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all collections metadata
      const collectionsSnapshot = await firestore.collection('collections').orderBy('numbering').get();
      const collectionsData = collectionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch stats for each collection
      const collectionsWithStats = await Promise.all(
        collectionsData.map(async (collection) => {
          const stats = await fetchCollectionStats(collection.name);
          return {
            ...collection,
            songCount: stats.songCount,
            lastUpdated: stats.lastUpdated
          };
        })
      );

      setCollections(collectionsWithStats);

      // Calculate total stats
      const totalSongs = collectionsWithStats.reduce((sum, col) => sum + col.songCount, 0);
      const totalCollections = collectionsWithStats.length;

      // Fetch recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let recentActivity = 0;
      try {
        const activitySnapshot = await firestore
          .collection('activity_log')
          .where('timestamp', '>=', thirtyDaysAgo)
          .get();
        recentActivity = activitySnapshot.size;
      } catch (activityError) {
        console.warn('Could not fetch activity data:', activityError);
      }

      // Find the most recent update across all collections
      const lastUpdated = collectionsWithStats.length > 0
        ? Math.max(...collectionsWithStats.map(col => col.lastUpdated || 0))
        : null;

      setTotalStats({
        totalCollections,
        totalSongs,
        recentActivity,
        lastUpdated
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchCollectionStats]);

  const refetchData = useCallback(async () => {
    await fetchCollectionsOverview();
  }, [fetchCollectionsOverview]);

  useEffect(() => {
    fetchCollectionsOverview();
  }, [fetchCollectionsOverview]);

  return {
    collections,
    totalStats,
    loading,
    error,
    refetchData
  };
};

export default useDashboard;