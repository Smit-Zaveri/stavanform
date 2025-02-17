import { useState, useEffect } from 'react';
import { firestore, auth, checkSuperAdmin, storage } from '../firebase';
import { logActivity } from '../utils/analyticsUtils';

export const useAdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalSongs: 0,
    totalCollections: 0,
    totalSuggestions: 0,
    recentActivity: [],
    collectionStats: {},
    storageUsage: 0,
    languages: [],
    categories: [],
    monthlyGrowth: [],
    totalDuration: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    if (!auth.currentUser) {
      setError("You must be logged in to view analytics");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const isAdmin = await checkSuperAdmin(auth.currentUser.uid);
      if (!isAdmin) {
        setError("You don't have permission to view analytics");
        setLoading(false);
        return;
      }

      const collections = {};
      let totalSongs = 0;
      let totalDuration = 0;
      let allLanguages = new Set();
      let allCategories = new Set();
      let monthlyData = {};

      const collectionsSnapshot = await firestore.collection('collections').get();
      const collectionPromises = collectionsSnapshot.docs.map(async (doc) => {
        const collData = doc.data();
        if (!collData?.name) return null;

        const songsSnapshot = await firestore.collection(collData.name).get();
        const songs = songsSnapshot.docs.map(song => song.data());
        
        const collStats = {
          name: collData.name,
          count: songs.length,
          totalDuration: songs.reduce((sum, song) => sum + (parseFloat(song.duration) || 0), 0),
          languages: {},
          categories: {},
          monthlyGrowth: {},
        };

        songs.forEach(song => {
          // Track duration
          const duration = parseFloat(song.duration) || 0;
          totalDuration += duration;

          // Language stats
          if (song.language) {
            collStats.languages[song.language] = (collStats.languages[song.language] || 0) + 1;
            allLanguages.add(song.language);
          }

          // Category stats
          if (song.category) {
            collStats.categories[song.category] = (collStats.categories[song.category] || 0) + 1;
            allCategories.add(song.category);
          }

          // Monthly growth
          const createdAt = song.createdAt?.toDate() || new Date();
          const monthKey = createdAt.toISOString().slice(0, 7);
          collStats.monthlyGrowth[monthKey] = (collStats.monthlyGrowth[monthKey] || 0) + 1;
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        });

        totalSongs += collStats.count;
        collections[collData.name] = collStats;
        return collStats;
      });

      await Promise.all(collectionPromises);

      // Get suggestions count
      const suggestionsCount = await firestore.collection('suggestions_new').get()
        .then(snap => snap.size)
        .catch(err => {
          console.error('Error counting suggestions:', err);
          return 0;
        });

      // Calculate storage usage
      let totalSize = 0;
      try {
        const storageStats = await storage.ref().child('songs').listAll();
        const metadataResults = await Promise.allSettled(
          storageStats.items.map(item => item.getMetadata())
        );
        
        totalSize = metadataResults.reduce((sum, result) => {
          if (result.status === 'fulfilled') {
            return sum + (result.value?.size || 0);
          }
          return sum;
        }, 0);
      } catch (err) {
        console.error('Error calculating storage usage:', err);
      }

      setAnalyticsData({
        totalSongs,
        totalDuration,
        totalCollections: collectionsSnapshot.size,
        totalSuggestions: suggestionsCount,
        collectionStats: collections,
        storageUsage: totalSize,
        languages: Array.from(allLanguages),
        categories: Array.from(allCategories),
        monthlyGrowth: Object.entries(monthlyData)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count })),
        recentActivity: analyticsData.recentActivity
      });

    } catch (error) {
      console.error('Error in analytics load:', error);
      setError(error.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    const unsubscribe = firestore.collection('activity_log')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .onSnapshot(snapshot => {
        const activities = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        setAnalyticsData(prev => ({
          ...prev,
          recentActivity: activities
        }));
      }, error => {
        console.error('Error listening to activity log:', error);
      });

    return () => unsubscribe();
  }, []);

  return {
    analyticsData,
    loading,
    error,
    loadAnalytics
  };
};

export const useCollectionAnalytics = (selectedCollection, analyticsData) => {
  const [collectionAnalytics, setCollectionAnalytics] = useState({
    songCount: 0,
    totalDuration: 0,
    averageDuration: 0,
    lastUpdated: null,
    songsByLanguage: {},
    songsByCategory: {},
    monthlyGrowth: [],
  });

  useEffect(() => {
    if (selectedCollection && analyticsData.collectionStats[selectedCollection]) {
      const stats = analyticsData.collectionStats[selectedCollection];
      setCollectionAnalytics({
        songCount: stats.count,
        totalDuration: stats.totalDuration,
        averageDuration: stats.count ? stats.totalDuration / stats.count : 0,
        songsByLanguage: stats.languages || {},
        songsByCategory: stats.categories || {},
        monthlyGrowth: Object.entries(stats.monthlyGrowth || {})
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count })),
      });
    }
  }, [selectedCollection, analyticsData]);

  return collectionAnalytics;
};