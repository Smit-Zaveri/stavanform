import React, { useState, useEffect } from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider,
  CircularProgress,
} from "@mui/material";

import { auth } from "./firebase";  // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth";  

import EditIcon from '@mui/icons-material/Edit';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CollectionsIcon from '@mui/icons-material/Collections'; 
import MenuIcon from "@mui/icons-material/Menu";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import Form from "./Form";
import Tag from "./Tag";
import ArtistForm from "./ArtistForm";
import CollectionForm from "./CollectionForm";
import SongList from "./ListSong.js";
import Tirthankar from "./Tirthankar.js";
import SuggestionForm from "./Suggestion.js";
import Login from "./Login.js";

const drawerWidth = 245;

const App = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null); // User state
  const [loading, setLoading] = useState(true); // Loading state
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null); // Reset user state
      navigate("/login");  // Redirect to login page after logout
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // Authentication check (useEffect)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);  // Set authenticated user
        setLoading(false);  // Remove loading state
      } else {
        setUser(null);  // Reset user state if not logged in
        setLoading(false);  // Remove loading state
        navigate("/login");  // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();  // Cleanup subscription on unmount
  }, [navigate]);

  const navItems = [
    { label: "Form", icon: <EditIcon />, path: "/" }, // Form - Editing icon
    { label: "Artist Form", icon: <MusicNoteIcon />, path: "/artist-form" },
    { label: "Collection", icon: <CollectionsIcon />, path: "/collection" }, 
    { label: "Tirtankar", icon: <MusicNoteIcon />, path: "/tirtankar" },
    { label: "Tag", icon: <EditIcon />, path: "/tag" },
    { label: "Suggestion", icon: <EditIcon />, path: "/suggestion" },
    { label: "List Song", icon: <EditIcon />, path: "/list-song" },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ width: drawerWidth }}>
      <Toolbar />
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.label}
            onClick={() => {
              navigate(item.path);
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
            sx={{
              backgroundColor: location.pathname === item.path ? theme.palette.action.selected : 'transparent',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (loading) {
    // Display loading spinner while checking authentication
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Music Manager
          </Typography>

          {/* Conditionally render logout button if user is logged in */}
          {user && (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={user ? <Form /> : <Login />} />
          <Route path="/tag" element={user ? <Tag /> : <Login />} />
          <Route path="/suggestion" element={user ? <SuggestionForm /> : <Login />} />
          <Route path="/artist-form" element={user ? <ArtistForm /> : <Login />} />
          <Route path="/collection" element={user ? <CollectionForm /> : <Login />} />
          <Route path="/list-song" element={user ? <SongList /> : <Login />} />
          <Route path="/tirtankar" element={user ? <Tirthankar /> : <Login />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Box>
    </Box>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
