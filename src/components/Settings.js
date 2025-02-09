// src/components/Settings.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Card,
  CardContent,
} from "@mui/material";

const Settings = ({ darkMode, toggleTheme }) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [autoSave, setAutoSave] = useState(false);

  const handleEmailToggle = () => setEmailNotifications((prev) => !prev);
  const handleLanguageChange = (e) => setSelectedLanguage(e.target.value);
  const handleAutoSaveToggle = () => setAutoSave((prev) => !prev);

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

    </Box>
  );
};

export default Settings;
