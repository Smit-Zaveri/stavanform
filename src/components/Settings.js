// src/components/Settings.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  TextField,
  Button,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import { firestore } from "../firebase";
import { themeColors } from "../utils/themeConfig";

const Settings = ({ darkMode, toggleTheme, onThemeColorChange, currentTheme }) => {
  const [companyName, setCompanyName] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Load settings on component mount
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
            sx={{ mb: 3 }}
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Theme Color
            </Typography>
            <Grid container spacing={2}>
              {themeColors.map((theme) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={theme.id}>
                  <Box
                    onClick={() => onThemeColorChange(theme.id)}
                    sx={{
                      p: 2,
                      border: '2px solid',
                      borderColor: currentTheme === theme.id ? theme.primary : 'transparent',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    }}
                  >
                    {/* Color Preview Container */}
                    <Box 
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: 80,
                        mb: 1,
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      {/* Primary Color Wave */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '100%',
                          backgroundColor: theme.primary,
                          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 70%)',
                        }}
                      />
                      {/* Secondary Color Wave */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '60%',
                          backgroundColor: theme.secondary,
                          clipPath: 'polygon(0 30%, 100% 0, 100% 100%, 0 100%)',
                          opacity: 0.9,
                        }}
                      />
                    </Box>
                    
                    {/* Theme Name and Selection Indicator */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography 
                        variant="subtitle2"
                        sx={{ 
                          fontWeight: currentTheme === theme.id ? 'bold' : 'normal',
                          color: currentTheme === theme.id ? theme.primary : 'text.primary'
                        }}
                      >
                        {theme.name}
                      </Typography>
                      {currentTheme === theme.id && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: theme.primary,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
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
