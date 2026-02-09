import { firestore } from '../firebase';
import firebase from 'firebase/compat/app';
import Papa from 'papaparse';

export const sortSongs = (songs, reports, sortBy = 'default', sortOrder = 'asc') => {
  const sorted = [...songs].sort((a, b) => {
    // Check if song has a report by id or title
    const aReported = reports.some((r) => r.lyricsId === a.id || r.lyricsTitle === a.title);
    const bReported = reports.some((r) => r.lyricsId === b.id || r.lyricsTitle === b.title);
    
    let comparison = 0;
    
    switch (sortBy) {
      case 'default':
        // Songs with reports come first
        if (aReported && !bReported) comparison = -1;
        else if (!aReported && bReported) comparison = 1;
        // Then sort by order
        else if (a.order != null && b.order != null) comparison = a.order - b.order;
        else if (a.order != null) comparison = -1;
        else if (b.order != null) comparison = 1;
        else {
          const aTitle = Array.isArray(a.title) ? a.title[0] : a.title;
          const bTitle = Array.isArray(b.title) ? b.title[0] : b.title;
          comparison = aTitle.localeCompare(bTitle);
        }
        break;
        
      case 'title':
        const aTitle = Array.isArray(a.title) ? a.title[0] : a.title || '';
        const bTitle = Array.isArray(b.title) ? b.title[0] : b.title || '';
        comparison = aTitle.localeCompare(bTitle);
        break;
        
      case 'order':
        const aOrder = a.order != null ? a.order : Infinity;
        const bOrder = b.order != null ? b.order : Infinity;
        comparison = aOrder - bOrder;
        break;
        
      case 'date':
        const aDate = a.publishDate?.toDate?.() || a.publishDate || new Date(0);
        const bDate = b.publishDate?.toDate?.() || b.publishDate || new Date(0);
        comparison = aDate - bDate;
        break;
        
      case 'artist':
        const aArtist = (a.artistName || '').toLowerCase();
        const bArtist = (b.artistName || '').toLowerCase();
        comparison = aArtist.localeCompare(bArtist);
        break;
        
      case 'newFlag':
        const aNew = a.newFlag ? 1 : 0;
        const bNew = b.newFlag ? 1 : 0;
        comparison = bNew - aNew; // New items first by default
        break;
        
      case 'reports':
        const aHasReport = aReported ? 1 : 0;
        const bHasReport = bReported ? 1 : 0;
        comparison = bHasReport - aHasReport; // Reported items first
        break;
        
      default:
        comparison = 0;
    }
    
    // Apply sort order
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
};

export const filterSongs = (songs, searchInput, filterOptions = {}) => {
  let filtered = songs;
  
  // Text search filter
  if (searchInput) {
    const searchLower = searchInput.toLowerCase();
    filtered = filtered.filter((song) => {
      // Check if title matches (handling both string and array formats)
      if (Array.isArray(song.title)) {
        if (song.title.some(titleVersion => 
          titleVersion && titleVersion.toLowerCase().includes(searchLower)
        )) {
          return true;
        }
      } else if (typeof song.title === 'string' && song.title.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Check if order matches
      if (song.order && song.order.toString().toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Check if any tag matches
      if (song.tags && song.tags.some((tag) => 
        tag.toLowerCase().includes(searchLower)
      )) {
        return true;
      }
      
      // Check artist name
      if (song.artistName && song.artistName.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      return false;
    });
  }
  
  // Tag filter
  if (filterOptions.tagFilter) {
    const tagFilterLower = filterOptions.tagFilter.toLowerCase();
    filtered = filtered.filter((song) => 
      song.tags && song.tags.some((tag) => 
        tag.toLowerCase().includes(tagFilterLower)
      )
    );
  }
  
  // Artist filter
  if (filterOptions.artistFilter) {
    const artistFilterLower = filterOptions.artistFilter.toLowerCase();
    filtered = filtered.filter((song) => 
      song.artistName && song.artistName.toLowerCase().includes(artistFilterLower)
    );
  }
  
  // New flag filter
  if (filterOptions.newFlagFilter !== undefined && filterOptions.newFlagFilter !== '') {
    const showNew = filterOptions.newFlagFilter === 'new';
    filtered = filtered.filter((song) => song.newFlag === showNew);
  }
  
  // Report filter
  if (filterOptions.reportFilter) {
    filtered = filtered.filter((song) => {
      const hasReport = filterOptions.reports?.some(
        (r) => r.lyricsId === song.id || r.lyricsTitle === song.title
      );
      return filterOptions.reportFilter === 'reported' ? hasReport : !hasReport;
    });
  }
  
  return filtered;
};

export const exportSongsToCSV = (songs, selectedCollection) => {
  // Sort songs by order before export
  const sortedSongs = [...songs].sort((a, b) => {
    if (a.order != null && b.order != null) {
      return a.order - b.order;
    } else if (a.order != null) {
      return -1;
    } else if (b.order != null) {
      return 1;
    }
    return 0;
  });

  const exportData = sortedSongs.map((song) => {
    // Handle content based on whether it's an array or string
    let gujaratiContent = "";
    let hindiContent = "";
    let englishContent = "";

    if (Array.isArray(song.content)) {
      gujaratiContent = song.content[0] || "";
      hindiContent = song.content[1] || "";
      englishContent = song.content[2] || "";
    } else {
      // Legacy format - put in Gujarati content
      gujaratiContent = song.content || "";
    }

    // Handle title based on whether it's an array or string
    let gujaratiTitle = "";
    let hindiTitle = "";
    let englishTitle = "";

    if (Array.isArray(song.title)) {
      gujaratiTitle = song.title[0] || "";
      hindiTitle = song.title[1] || "";
      englishTitle = song.title[2] || "";
    } else {
      // Legacy format - put in Gujarati title
      gujaratiTitle = song.title || "";
    }

    return {
      Title: gujaratiTitle,
      TitleHindi: hindiTitle,
      TitleEnglish: englishTitle,
      Artist: song.artistName || "",
      ContentGujarati: gujaratiContent,
      ContentHindi: hindiContent,
      ContentEnglish: englishContent,
      Order: song.order || "",
      Tags: Array.isArray(song.tags) ? song.tags.join(", ") : "",
      YouTube: song.youtube || "",
      NewFlag: song.newFlag || false,
      PublishDate: song.publishDate ? song.publishDate.toDate().toISOString() : "",
      TirthankarId: song.tirthankarId || song.selectedTirthankar || ""
    };
  });

  const csv = Papa.unparse({
    fields: [
      "Title",
      "TitleHindi",
      "TitleEnglish",
      "Artist",
      "ContentGujarati",
      "ContentHindi",
      "ContentEnglish",
      "Order",
      "Tags",
      "YouTube",
      "NewFlag",
      "PublishDate",
      "TirthankarId"
    ],
    data: exportData,
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${selectedCollection}-songs-export-${Date.now()}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const processRemainingImports = async (remainingSongs, collectionName, onProgress) => {
  const collectionRef = firestore.collection(collectionName);
  let successCount = 0;

  for (const song of remainingSongs) {
    onProgress(`Processing: ${song.Title || song.title}`);

    // Create a title query to check for duplicates
    // Use primary title (Gujarati) for duplicate check
    const titleToCheck = song.Title || song.title || "";
    
    const existing = await collectionRef
      .where("title", "==", titleToCheck)
      .get();

    // Handle multilingual content from import
    const contentArray = [];
    if (song.ContentGujarati !== undefined || song.ContentHindi !== undefined || song.ContentEnglish !== undefined) {
      // New format with separate language columns
      contentArray[0] = song.ContentGujarati || "";
      contentArray[1] = song.ContentHindi || "";
      contentArray[2] = song.ContentEnglish || "";
    } else if (song.Content) {
      // Legacy format - put in first position (Gujarati)
      contentArray[0] = song.Content || "";
    }

    // Handle multilingual title from import
    const titleArray = [];
    let finalTitle = "";
    
    if (song.Title !== undefined || song.TitleHindi !== undefined || song.TitleEnglish !== undefined) {
      // New format with separate language columns
      titleArray[0] = song.Title || "";  // Gujarati title
      titleArray[1] = song.TitleHindi || "";  // Hindi title
      titleArray[2] = song.TitleEnglish || "";  // English title
      
      // If we only have one non-empty title (the primary one), use string format for backward compatibility
      finalTitle = (!titleArray[1] && !titleArray[2]) ? titleArray[0] : titleArray;
    } else {
      // Legacy format with single title field
      finalTitle = song.title || "";
    }

    const songData = {
      title: finalTitle,
      artistName: song.Artist || song.artist || "",
      tags: (song.Tags || song.tags || "").toString().split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean),
      order: song.Order || song.order ? Number(song.Order || song.order) : null,
      youtube: song.YouTube || song.youtube || "",
      publishDate: firebase.firestore.Timestamp.now(),
      content: contentArray.length > 0 ? contentArray : (song.Content || song.content || ""),
      newFlag: Boolean(song.NewFlag === "true" || song.NewFlag === true || song.newFlag === true),
      tirthankarId: song.TirthankarId || song.tirthankarId || ""
    };

    if (!existing.empty) {
      // Return for next individual confirmation, including total remaining count
      return {
        duplicateFound: true,
        songData,
        existingDoc: existing.docs[0],
        remainingSongs: remainingSongs.slice(1),
        processedCount: successCount,
        totalRemaining: remainingSongs.length
      };
    }

    // If no duplicate, add the song
    await collectionRef.add(songData);
    successCount++;
  }

  return { success: true, count: successCount };
};

export const importSongsFromCSV = async (file, collectionName, onProgress) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const result = await processRemainingImports(results.data, collectionName, onProgress);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      error: reject,
    });
  });
};

export const handleSingleDuplicate = async (action, songData, existingDoc, collectionName) => {
  const collectionRef = firestore.collection(collectionName);
  
  switch (action) {
    case 'replace':
      await existingDoc.ref.set(songData);
      return true;
    case 'add':
      await collectionRef.add(songData);
      return true;
    case 'skip':
      return true; // Return true for skip to indicate successful handling
    default:
      return false;
  }
};