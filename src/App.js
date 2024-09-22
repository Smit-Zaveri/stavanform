import React, { useState } from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";

import EditIcon from '@mui/icons-material/Edit';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LabelIcon from '@mui/icons-material/Label';
import ListIcon from '@mui/icons-material/List';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import CollectionsIcon from '@mui/icons-material/Collections'; 
import MenuIcon from "@mui/icons-material/Menu";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import Form from "./Form";
import Tag from "./Tag";
import ArtistForm from "./ArtistForm";
import CollectionForm from "./CollectionForm";
import SongList from "./ListSong.js";
import Tirthankar from "./Tirthankar.js";
import SuggestionForm from "./Suggetion.js";

const drawerWidth = 245;

const App = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

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
              backgroundColor: location.pathname === item.path ? theme.palette.action.selected : 'transparent', // Change background color if selected
              '&:hover': {
                backgroundColor: theme.palette.action.hover, // Change background color on hover
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

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
          <Typography variant="h6" noWrap component="div">
            Music Manager
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar for Desktop */}
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

      {/* Drawer for Mobile */}
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

      {/* Main Content */}
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
          <Route path="/" element={<Form />} />
          <Route path="/tag" element={<Tag />} />
          <Route path="/suggestion" element={<SuggestionForm />} />
          <Route path="/artist-form" element={<ArtistForm />} />
          <Route path="/collection" element={<CollectionForm />} />
          <Route path="/list-song" element={<SongList />} />
          <Route path="/tirtankar" element={<Tirthankar/>} />
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
