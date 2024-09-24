import React from "react";
import ReactDOM from "react-dom/client";
import AppWrapper from "./App";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Define your custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#673bb7", // Customize your primary color
    },
    secondary: {
      main: "#673bb7", // Customize your secondary color
    },
  },
  typography: {
    // Customize typography as needed
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <AppWrapper />
    </ThemeProvider>
  </React.StrictMode>
);
