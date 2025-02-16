export const isValidYouTubeURL = (url) => {
  if (!url) return true;
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return regex.test(url);
};

export const validateSongForm = ({ title, content, selectedCollection, youtube, order, tags = [] }) => {
  if (!selectedCollection || !title || !content) {
    return "Please fill in all required fields.";
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
  return null;
};