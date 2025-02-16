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

export const importSongsFromCSV = async (file, collectionName, onProgress) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const collectionRef = firestore.collection(collectionName);
          const incomingSongs = results.data;
          let successCount = 0;

          for (let i = 0; i < incomingSongs.length; i++) {
            const row = incomingSongs[i];
            onProgress(`Importing: ${row.Title}`);
            
            const existing = await collectionRef
              .where("title", "==", row.Title)
              .where("artistName", "==", row.Artist)  // Update query to use artistName
              .get();

            if (existing.empty) {
              await collectionRef.add({
                title: row.Title,
                artistName: row.Artist,  // Save as artistName in Firestore
                tags: row.Tags?.split(",").map((tag) => tag.trim().toLowerCase()) || [],
                order: row.Order ? Number(row.Order) : null,
                youtube: row.YouTube,
                publishDate: firebase.firestore.Timestamp.now(),
                content: row.Content,
              });
              successCount++;
            }
          }
          resolve(successCount);
        } catch (error) {
          reject(error);
        }
      },
      error: reject,
    });
  });
};