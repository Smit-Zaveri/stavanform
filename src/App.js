import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; // Import Firebase auth

import CollectionsIcon from '@mui/icons-material/Collections';
import EditIcon from '@mui/icons-material/Edit';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import LabelIcon from '@mui/icons-material/Label';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import MenuIcon from "@mui/icons-material/Menu";
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { Route, BrowserRouter as Router, Routes, useLocation, useNavigate } from 'react-router-dom';

import ArtistForm from "./ArtistForm";
import CollectionForm from "./CollectionForm";
import Form from "./Form";
import SongList from "./ListSong.js";
import Login from "./Login.js";
import SuggestionForm from "./Suggestion.js";
import Tag from "./Tag";
import Tirthankar from "./Tirthankar.js";

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
    { label: "Artist Form", icon: <MusicNoteIcon />, path: "/artist-form" }, // Music-related form
    { label: "Collection", icon: <CollectionsIcon />, path: "/collection" }, // Collections icon
    { label: "Tirtankar", icon: <LibraryMusicIcon />, path: "/tirtankar" }, // Sacred music collection
    { label: "Tag", icon: <LabelIcon />, path: "/tag" }, // Tagging
    { label: "Suggestion", icon: <EmojiObjectsIcon />, path: "/suggestion" }, // Suggestions
    { label: "List Song", icon: <PlaylistAddCheckIcon />, path: "/list-song" }, // Playlist for song listing
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
