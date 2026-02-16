import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  createTheme,
  CssBaseline,
  Drawer,
  ThemeProvider,
  Toolbar,
  useMediaQuery,
} from "@mui/material";

import { onAuthStateChanged } from "firebase/auth";
import { Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";

import { auth } from "./firebase";

// Components
import Header from "./components/layout/Header";
import Navigation from "./components/layout/Navigation";
import CollectionForm from "./components/CollectionForm/CollectionForm";
import SongList from "./ListSong";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import Profile from "./components/Profile";
import Help from "./components/Help";

import MainContent from "./components/SuggestedSongs/MainContent";
import Dashboard from "./components/Dashboard/Dashboard";

const drawerWidth = 260;

const App = () => {
  // State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyName] = useState("Lyrics");
  const [anchorElProfile, setAnchorElProfile] = useState(null);

  
  // Theme - always dark mode
  const customTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: 'dark',
        primary: { main: '#fff' },
        secondary: { main: '#666' },
      },
    });
  }, []);

  const isMobileView = useMediaQuery(customTheme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  // Auth handlers
  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      const publicRoutes = ["/login", "/reset-password"];
      if (!currentUser && !publicRoutes.includes(location.pathname)) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate, location.pathname]);

  // UI handlers
  const handleDrawerToggle = useCallback(() => setMobileOpen(prev => !prev), []);
  const handleProfileMenuClose = () => setAnchorElProfile(null);
  const handleProfileMenuOpen = (event) => setAnchorElProfile(event.currentTarget);

  // Check if current route is a public route (no header)
  const publicRoutes = ["/login", "/reset-password"];
  const isPublicRoute = publicRoutes.includes(location.pathname) || (!user && location.pathname === "/");

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: customTheme.palette.background.default,
        }}
      >
        <CircularProgress sx={{ background: customTheme.palette.background.default }} />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ display: "flex", background: customTheme.palette.background.default }}>
        <CssBaseline />
        
        {!isPublicRoute && (
          <Header 
            user={user}
            isMobileView={isMobileView}
            handleDrawerToggle={handleDrawerToggle}
            companyName={companyName}
            anchorElProfile={anchorElProfile}
            handleProfileMenuOpen={handleProfileMenuOpen}
            handleProfileMenuClose={handleProfileMenuClose}
            handleLogout={handleLogout}
            customTheme={customTheme}
          />
        )}

        {user && !isMobileView && (
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              "& .MuiDrawer-paper": { 
                width: drawerWidth, 
                boxSizing: "border-box",
                bgcolor: '#1a1a1a',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden',
                height: '100vh',
                maxHeight: '100vh',
              },
            }}
          >
            <Navigation 
              isMobileView={isMobileView} 
              setMobileOpen={setMobileOpen}
              customTheme={customTheme}
              user={user}
            />
          </Drawer>
        )}

        {user && isMobileView && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ 
              "& .MuiDrawer-paper": { 
                width: drawerWidth,
                bgcolor: '#1a1a1a',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden',
                height: '100vh',
                maxHeight: '100vh',
              } 
            }}
          >
            <Navigation 
              isMobileView={isMobileView} 
              setMobileOpen={setMobileOpen}
              customTheme={customTheme}
              user={user}
            />
          </Drawer>
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: isPublicRoute ? 0 : 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          {!isPublicRoute && <Toolbar sx={{ minHeight: '80px' }} />}
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Login />} />
            <Route path="/list-song/:collectionName" element={user ? <SongList /> : <Login />} />
            <Route path="/suggestedsongs" element={user ? <MainContent /> : <Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={user ? <Profile /> : <Login />} />
            <Route path="/:path" element={user ? <CollectionForm collectionName={window.location.pathname.substring(1)} /> : <Login />} />

            <Route path="/help" element={user ? <Help /> : <Login />} />

          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
