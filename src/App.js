import CollectionsIcon from "@mui/icons-material/Collections";
import EditIcon from "@mui/icons-material/Edit";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import LabelIcon from "@mui/icons-material/Label";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import MenuIcon from "@mui/icons-material/Menu";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
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
import { onAuthStateChanged } from "firebase/auth";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { auth } from "./firebase"; // Import Firebase auth

import ArtistForm from "./ArtistForm";
import CollectionForm from "./CollectionForm";
import Form from "./Form";
import SongList from "./ListSong";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import SuggestedSongs from "./SuggestedSongs";

const drawerWidth = 245;

const App = ({ darkMode, toggleTheme }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  // Function to handle logout
  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }, [navigate]);

  // Authentication check (useEffect)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Only redirect to login if the user is not logged in AND they are trying to access a protected route
      const publicRoutes = ["/login", "/reset-password"];
      if (!currentUser && !publicRoutes.includes(location.pathname)) {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  const navItems = useMemo(
    () => [
      { label: "Form", icon: <EditIcon />, path: "/" },
      { label: "Artist Form", icon: <MusicNoteIcon />, path: "/artist-form" },
      { label: "Collection", icon: <CollectionsIcon />, path: "/collection" },
      { label: "Tirth", icon: <CollectionsIcon />, path: "/tirth" },
      { label: "Tirtankar", icon: <LibraryMusicIcon />, path: "/tirtankar" },
      { label: "Tag", icon: <LabelIcon />, path: "/tag" },
      { label: "Suggestion", icon: <EmojiObjectsIcon />, path: "/suggestion" },
      {
        label: "List Song",
        icon: <PlaylistAddCheckIcon />,
        path: "/list-song",
      },
      {
        label: "Suggested Song",
        icon: <PlaylistAddCheckIcon />,
        path: "/suggestedsongs",
      },
    ],
    []
  );

  const handleDrawerToggle = useCallback(
    () => setMobileOpen((prev) => !prev),
    []
  );

  const drawerContent = useMemo(
    () => (
      <Box sx={{ width: drawerWidth }}>
        <Toolbar />
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItem
              key={item.label}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                backgroundColor:
                  location.pathname === item.path
                    ? theme.palette.action.selected
                    : "transparent",
                "&:hover": {
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
    ),
    [isMobile, location.pathname, navItems, navigate, theme]
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: theme.palette.background.default,
        }}
      >
        <CircularProgress
          sx={{ background: theme.palette.background.default }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", background: theme.palette.background.default }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && user && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            DashBoard{" "}
          </Typography>
          <Button color="inherit" onClick={toggleTheme}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
          {user && (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {user && !isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 250,
            flexShrink: 0,
            "& .MuiDrawer-paper": { width: 250, boxSizing: "border-box" },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {user && isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": { width: drawerWidth },
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
          <Route
            path="/tag"
            element={
              user ? <CollectionForm collectionName="tags" /> : <Login />
            }
          />
          <Route
            path="/suggestion"
            element={
              user ? <CollectionForm collectionName="suggestions" /> : <Login />
            }
          />
          <Route
            path="/artist-form"
            element={user ? <ArtistForm /> : <Login />}
          />
          <Route
            path="/collection"
            element={
              user ? <CollectionForm collectionName="collections" /> : <Login />
            }
          />
          <Route
            path="/tirth"
            element={
              user ? <CollectionForm collectionName="tirth" /> : <Login />
            }
          />
          <Route path="/list-song/:collectionName" element={user ? <SongList /> : <Login />} />

          <Route
            path="/tirtankar"
            element={
              user ? <CollectionForm collectionName="tirtankar" /> : <Login />
            }
          />
          <Route
            path="/suggestedsongs"
            element={user ? <SuggestedSongs /> : <Login />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
