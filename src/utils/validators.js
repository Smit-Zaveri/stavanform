export const isValidYouTubeURL = (url) => {
  if (!url) return true;
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return regex.test(url);
};

export const validateSongForm = ({ title, content, selectedCollection, youtube, order, tags = [], previousCollection, mode }) => {
  if (!selectedCollection || !title) {
    return "Please fill in all required fields.";
  }
  
  // Check content - either as a string or as an array (for multilingual content)
  if (Array.isArray(content)) {
    // Check if at least one language has content (preferably Gujarati - index 0)
    if (!content[0] || content[0].trim() === '') {
      return "Please add content in at least Gujarati language.";
    }
  } else if (!content || content.trim() === '') {
    return "Content is required.";
  }

  if (youtube && !isValidYouTubeURL(youtube)) {
    return "Please enter a valid YouTube URL.";
  }
  if (order && isNaN(Number(order))) {
    return "Please enter a valid number for the order field.";
  }
  if (!Array.isArray(tags)) {
    return "Invalid tags format. Tags must be an array.";
  }
  if (mode === 'edit' && selectedCollection !== previousCollection) {
    // Additional validation for collection change
    if (!selectedCollection || !previousCollection) {
      return "Both old and new collection must be specified when moving a song.";
    }
  }
  return "";
};