// src/components/Profile.js
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { auth } from "../firebase";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Profile = () => {
  // State for profile info
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  // State for file upload and preview
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  // State for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  // State for feedback
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Reference for hidden file input
  const fileInputRef = useRef(null);

  // Load initial profile info from current user
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
      setPreview(user.photoURL || ""); // Show current photo if available
    }
  }, []);

  // When a new file is selected, update the preview
  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, [file]);

  // Trigger file selection dialog
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Upload the file to Firebase Storage and return the download URL
  const uploadFileAndGetURL = async (file) => {
    const storage = getStorage();
    const storageRef = ref(storage, `profilePhotos/${auth.currentUser.uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  // Update profile with new display name and photo URL
  const handleUpdateProfile = async () => {
    setError("");
    setSuccessMessage("");
    try {
      let newPhotoURL = photoURL;
      // If a new file is selected, upload it and get the download URL
      if (file) {
        newPhotoURL = await uploadFileAndGetURL(file);
      }
      await updateProfile(auth.currentUser, { displayName, photoURL: newPhotoURL });
      setPhotoURL(newPhotoURL);
      setSuccessMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  // Change password after reauthentication
  const handleChangePassword = async () => {
    setError("");
    setSuccessMessage("");
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setSuccessMessage("Password updated successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      {error && (
        <Typography variant="body1" color="error" gutterBottom>
          {error}
        </Typography>
      )}
      {successMessage && (
        <Typography variant="body1" color="primary" gutterBottom>
          {successMessage}
        </Typography>
      )}
      <Grid container spacing={4}>
        {/* Photo Upload and Preview Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar
                src={preview}
                sx={{ width: 150, height: 150, margin: "auto" }}
              >
                {displayName ? displayName.charAt(0).toUpperCase() : ""}
              </Avatar>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={handleUploadClick}
              >
                Change Photo
              </Button>
              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </CardContent>
          </Card>
        </Grid>
        {/* Profile Information and Password Update Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Update Profile Information
              </Typography>
              <TextField
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                fullWidth
                margin="normal"
              />
            </CardContent>
            <CardActions>
              <Button variant="contained" color="primary" onClick={handleUpdateProfile}>
                Update Profile
              </Button>
            </CardActions>
          </Card>
          <Box mt={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
                <TextField
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </CardContent>
              <CardActions>
                <Button variant="contained" color="primary" onClick={handleChangePassword}>
                  Change Password
                </Button>
              </CardActions>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
