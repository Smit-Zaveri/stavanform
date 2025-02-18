import { firestore } from '../firebase';
import firebase from 'firebase/compat/app';
import Papa from 'papaparse';

export const sortSongs = (songs, reports) => {
  return [...songs].sort((a, b) => {
    const aReported = reports.some((r) => r.lyricsId === a.id);
    const bReported = reports.some((r) => r.lyricsId === b.id);
    if (aReported && !bReported) return -1;
    if (!aReported && bReported) return 1;

    if (a.order != null && b.order != null) {
      return a.order - b.order;
    } else if (a.order != null) {
      return -1;
    } else if (b.order != null) {
      return 1;
    } else {
      return a.title.localeCompare(b.title);
    }
  });
};

export const filterSongs = (songs, searchInput) => {
  return songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchInput.toLowerCase()) ||
      (song.tags &&
        song.tags.some((tag) =>
          tag.toLowerCase().includes(searchInput.toLowerCase())
        ))
  );
};

export const exportSongsToCSV = (songs, selectedCollection) => {
  const exportData = songs.map((song) => ({
    Title: song.title,
    Artist: song.artistName || song.artist || "",  // Handle both fields
    Tags: song.tags ? song.tags.join(", ") : "",
    Order: song.order,
    YouTube: song.youtube,
    Content: song.content,
  }));

  const csv = Papa.unparse({
    fields: ["Title", "Artist", "Tags", "Order", "YouTube", "Content"],
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
    onProgress(`Processing: ${song.Title}`);
    
    const existing = await collectionRef
      .where("title", "==", song.Title)
      .get();
    
    const songData = {
      title: song.Title,
      artistName: song.Artist,
      tags: song.Tags?.split(",").map((tag) => tag.trim().toLowerCase()) || [],
      order: song.Order ? Number(song.Order) : null,
      youtube: song.YouTube,
      publishDate: firebase.firestore.Timestamp.now(),
      content: song.Content,
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