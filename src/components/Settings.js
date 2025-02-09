// src/components/Settings.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Card,
  CardContent,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { firestore } from "../firebase";

const Settings = ({ darkMode, toggleTheme }) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [autoSave, setAutoSave] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleEmailToggle = () => setEmailNotifications((prev) => !prev);
  const handleLanguageChange = (e) => setSelectedLanguage(e.target.value);
  const handleAutoSaveToggle = () => setAutoSave((prev) => !prev);

  // Load company name on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsDoc = await firestore.collection("settings").doc("general").get();
        if (settingsDoc.exists) {
          setCompanyName(settingsDoc.data().companyName || "");
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      await firestore.collection("settings").doc("general").set({
        companyName
      }, { merge: true });
      setSnackbar({
        open: true,
        message: "Settings saved successfully",
        severity: "success"
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error saving settings",
        severity: "error"
      });
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {/* Display Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Display Settings
          </Typography>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={toggleTheme} />}
            label="Dark Mode"
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Company Settings
          </Typography>
          <TextField
            fullWidth
            label="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleSave}>
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
