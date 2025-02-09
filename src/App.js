// src/App.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
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
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";

// MUI Icons
import HomeIcon from '@mui/icons-material/Home';
import CollectionsIcon from "@mui/icons-material/Collections";
import LabelIcon from "@mui/icons-material/Label";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import MenuIcon from "@mui/icons-material/Menu";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";

import { onAuthStateChanged } from "firebase/auth";
import { Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";

import { auth, firestore } from "./firebase";
import CollectionForm from "./components/CollectionForm";
import SongList from "./ListSong";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import SuggestedSongs from "./SuggestedSongs";

// Import separated components
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import Help from "./components/Help";

const drawerWidth = 245;

const App = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  // Profile menu state
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const handleProfileMenuOpen = (event) => {
    setAnchorElProfile(event.currentTarget);
  };
  const handleProfileMenuClose = () => {
    setAnchorElProfile(null);
  };

  // Load company name from settings
  useEffect(() => {
    const loadCompanyName = async () => {
      try {
        const settingsDoc = await firestore.collection("settings").doc("general").get();
        if (settingsDoc.exists) {
          setCompanyName(settingsDoc.data().companyName || "Dashboard");
        }
      } catch (err) {
        console.error("Error loading company name:", err);
        setCompanyName("Dashboard");
      }
    };
    loadCompanyName();
  }, []);

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

  // Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      const publicRoutes = ["/login", "/reset-password"];
      if (!currentUser && !publicRoutes.includes(location.pathname)) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate, location.pathname]);

  // Navigation items for the drawer
  const navItems = useMemo(
    () => [
      { label: "List Song", icon: <PlaylistAddCheckIcon />, path: "/list-song/lyrics" },
      { label: "Tag", icon: <LabelIcon />, path: "/tag" },
      { label: "Collection", icon: <CollectionsIcon />, path: "/collection" },
      { label: "Artist Form", icon: <MusicNoteIcon />, path: "/artist-form" },
      { label: "Tirtankar", icon: <LibraryMusicIcon />, path: "/tirtankar" },
      { label: "Tirth", icon: <CollectionsIcon />, path: "/tirth" },
      { label: "Suggested Song", icon: <PlaylistAddCheckIcon />, path: "/suggestedsongs" },
    ],
    []
  );

  const handleDrawerToggle = useCallback(() => setMobileOpen((prev) => !prev), []);

  const handleCompanyNameClick = useCallback(() => {
    if (user) {
      navigate("/list-song/lyrics");
    }
  }, [user, navigate]);

  const drawerContent = useMemo(
    () => (
      <Box sx={{ width: drawerWidth }}>
        <Toolbar />
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItem
              key={item.label}
              button
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
        <CircularProgress sx={{ background: theme.palette.background.default }} />
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
          <Tooltip title="Go to home page" arrow placement="bottom">
            <Typography 
              variant="h6" 
              noWrap 
              component="div"
              sx={{ 
                flexGrow: 1,
                cursor: 'pointer',
                userSelect: 'none',
                '&:hover': {
                  opacity: 0.85,
                },
                '&:active': {
                  opacity: 0.7,
                },
                display: 'flex',
                alignItems: 'center',
                transition: 'opacity 0.2s ease',
              }}
              onClick={handleCompanyNameClick}
            >
              {companyName}
            </Typography>
          </Tooltip>
          {user && (
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{ ml: 2 }}
            >
              <Avatar alt={user.displayName || user.email} src={user.photoURL || ""}>
                {user.displayName
                  ? user.displayName.charAt(0)
                  : user.email
                  ? user.email.charAt(0).toUpperCase()
                  : ""}
              </Avatar>
            </IconButton>
          )}
          <Menu
            id="profile-menu"
            anchorEl={anchorElProfile}
            keepMounted
            open={Boolean(anchorElProfile)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem disabled>{user && user.displayName}</MenuItem>
            <MenuItem
              onClick={() => {
                handleProfileMenuClose();
                navigate("/profile");
              }}
            >
              My Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleProfileMenuClose();
                navigate("/settings");
              }}
            >
              Settings
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleProfileMenuClose();
                navigate("/help");
              }}
            >
              Help
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleProfileMenuClose();
                handleLogout();
              }}
            >
              Sign Out
            </MenuItem>
          </Menu>
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
          sx={{ "& .MuiDrawer-paper": { width: drawerWidth } }}
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
          <Route path="/" element={user ? <Navigate to="/list-song/lyrics" replace /> : <Login />} />
          <Route path="/tag" element={user ? <CollectionForm collectionName="tags" /> : <Login />} />
          <Route path="/artist-form" element={user ? <CollectionForm collectionName="artists" /> : <Login />} />
          <Route path="/collection" element={user ? <CollectionForm collectionName="collections" /> : <Login />} />
          <Route path="/tirth" element={user ? <CollectionForm collectionName="tirth" /> : <Login />} />
          <Route path="/list-song/:collectionName" element={user ? <SongList /> : <Login />} />
          <Route path="/tirtankar" element={user ? <CollectionForm collectionName="tirtankar" /> : <Login />} />
          <Route path="/suggestedsongs" element={user ? <SuggestedSongs /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={user ? <Profile /> : <Login />} />
          <Route path="/settings" element={user ? <Settings /> : <Login />} />
          <Route path="/help" element={user ? <Help /> : <Login />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
