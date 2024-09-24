import React, { useState, useCallback, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App"; // Make sure to import the App component

const AppWrapper = () => {
  const [darkMode, setDarkMode] = useState(false); // State for dark mode

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  // Function to toggle the theme
  const toggleTheme = useCallback(() => {
    setDarkMode((prev) => {
      const newTheme = !prev ? "dark" : "light";
      localStorage.setItem("theme", newTheme); // Save to localStorage
      return !prev;
    });
  }, []);

  // Create the theme based on the darkMode state
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light", // Set mode based on darkMode
      primary: {
        main: "#673bb7", // Customize your primary color
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Router> {/* Ensure App is wrapped in Router */}
        <App darkMode={darkMode} toggleTheme={toggleTheme} />
      </Router>
    </ThemeProvider>
  );
};

export default AppWrapper;
