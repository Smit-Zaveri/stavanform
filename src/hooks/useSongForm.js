import { useState, useEffect } from 'react';
import { firestore } from '../firebase';

export const useSongForm = (initialData, mode) => {
  // Initialize state with empty values instead of null
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [tags, setTags] = useState([]); 
  const [order, setOrder] = useState('');
  const [content, setContent] = useState('');
  const [youtube, setYoutube] = useState('');
  const [newFlag, setNewFlag] = useState(false);
  const [selectedTirthankar, setSelectedTirthankar] = useState('');
  const [artistOptions, setArtistOptions] = useState([]);
  const [tirthankarList, setTirthankarList] = useState([]);
  const [tagsOptions, setTagsOptions] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      // Process tags before setting state to ensure it's always an array
      const processedTags = initialData.tags 
        ? Array.isArray(initialData.tags) 
          ? initialData.tags
          : initialData.tags.split(',').map(t => t.trim())
        : [];

      // Set all form fields with initialData values
      setTitle(initialData.title || '');
      setArtist(initialData.artist || initialData.artistName || '');
      setTags(processedTags);
      setOrder(initialData.order?.toString() || '');
      setContent(initialData.content || '');
      setYoutube(initialData.youtube || '');
      setNewFlag(Boolean(initialData.newFlag));
      setSelectedTirthankar(initialData.tirthankarId || '');
      setTagInput('');
    } else {
      // Reset form if no initialData
      setTitle('');
      setArtist('');
      setTags([]);
      setOrder('');
      setContent('');
      setYoutube('');
      setNewFlag(false);
      setSelectedTirthankar('');
      setTagInput('');
    }
  }, [initialData]);

  // Fetch artist options
  useEffect(() => {
    const fetchArtistOptions = async () => {
      try {
        const snapshot = await firestore.collection('artists').get();
        const options = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArtistOptions(options);
        
        if (artist && !options.some(opt => opt.name === artist)) {
          const matchingArtist = options.find(opt => 
            opt.name.toLowerCase() === artist.toLowerCase()
          );
          if (matchingArtist) {
            setArtist(matchingArtist.name);
          }
        }
      } catch (err) {
        console.error('Error fetching artist options:', err);
      }
    };
    fetchArtistOptions();
  }, [artist]);

  // Fetch tag suggestions
  useEffect(() => {
    const fetchTagsOptions = async () => {
      try {
        const [tagsSnapshot, tirthSnapshot] = await Promise.all([
          firestore.collection('tags').get(),
          firestore.collection('tirth').get()
        ]);
        
        const firebaseTags = tagsSnapshot.docs.map(doc => doc.data().name);
        const tirthTags = tirthSnapshot.docs.map(doc => doc.data().name);
        setTagsOptions([...new Set([...firebaseTags, ...tirthTags])]);
      } catch (err) {
        console.error('Error fetching tags options:', err);
      }
    };
    fetchTagsOptions();
  }, []);

  // Fetch Tirthankar list
  useEffect(() => {
    const fetchTirthankarList = async () => {
      try {
        const snapshot = await firestore.collection('tirtankar').orderBy('numbering').get();
        const tirthData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTirthankarList(tirthData);

        if (initialData?.tags && !selectedTirthankar) {
          const initialTagsLower = initialData.tags.map(tag => tag.toLowerCase());
          const matching = tirthData.find(t => initialTagsLower.includes(t.name.toLowerCase()));
          setSelectedTirthankar(current => current || matching?.id || '');
        }
      } catch (err) {
        console.error('Error fetching Tirthankar list:', err);
      }
    };
    fetchTirthankarList();
  }, [initialData?.tags, selectedTirthankar]);

  // Handle Tirthankar tag management
  useEffect(() => {
    if (!tags || !tirthankarList.length) return; // Guard against null/empty values

    const allTirthTags = new Set();
    tirthankarList.forEach(t => {
      allTirthTags.add(t.name.toLowerCase());
      allTirthTags.add(t.displayName.toLowerCase());
    });

    if (selectedTirthankar) {
      const selectedObj = tirthankarList.find(t => t.id === selectedTirthankar);
      if (selectedObj) {
        const currentTirthTags = [selectedObj.name, selectedObj.displayName];
        const currentTirthTagsLower = currentTirthTags.map(t => t.toLowerCase());

        const filteredTags = tags.filter(tag => {
          const lowerTag = tag.toLowerCase();
          return !allTirthTags.has(lowerTag) || currentTirthTagsLower.includes(lowerTag);
        });

        const missingTags = currentTirthTags.filter(
          t => !filteredTags.some(ft => ft.toLowerCase() === t.toLowerCase())
        );

        const newTags = [...filteredTags, ...missingTags];
        if (JSON.stringify(newTags) !== JSON.stringify(tags)) {
          setTags(newTags);
        }
      }
    } else {
      const filteredTags = tags.filter(tag => !allTirthTags.has(tag.toLowerCase()));
      if (JSON.stringify(filteredTags) !== JSON.stringify(tags)) {
        setTags(filteredTags);
      }
    }
  }, [selectedTirthankar, tirthankarList, tags]);

  const commitTagInput = () => {
    if (!tagInput.trim()) return;
    const newTags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '');
    if (newTags.length > 0) {
      setTags(prev => [...(prev || []), ...newTags]); // Guard against null prev value
    }
    setTagInput('');
  };

  const formData = {
    title,
    artist,
    tags,
    order,
    content,
    youtube,
    newFlag,
    selectedTirthankar
  };

  const setters = {
    setTitle,
    setArtist,
    setTags,
    setOrder,
    setContent,
    setYoutube,
    setNewFlag,
    setSelectedTirthankar,
    setTagInput,
    commitTagInput
  };

  return {
    formData,
    setters,
    tagInput,
    artistOptions,
    tirthankarList,
    tagsOptions
  };
};