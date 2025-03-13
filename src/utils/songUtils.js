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
  const exportData = songs.map((song) => {
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

    return {
      Title: song.title || "",
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
    onProgress(`Processing: ${song.Title}`);

    const existing = await collectionRef
      .where("title", "==", song.Title)
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

    const songData = {
      title: song.Title,
      artistName: song.Artist,
      tags: song.Tags?.split(",").map((tag) => tag.trim().toLowerCase()) || [],
      order: song.Order ? Number(song.Order) : null,
      youtube: song.YouTube,
      publishDate: firebase.firestore.Timestamp.now(),
      content: contentArray.length > 0 ? contentArray : song.Content || "",
      newFlag: Boolean(song.NewFlag === "true" || song.NewFlag === true),
      tirthankarId: song.TirthankarId || ""
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