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
import { themeColors } from "./utils/themeConfig";
import { auth, firestore, checkSuperAdmin } from "./firebase";

// Components
import Header from "./components/layout/Header";
import Navigation from "./components/layout/Navigation";
import CollectionForm from "./components/CollectionForm/CollectionForm";
import SongList from "./ListSong";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import Help from "./components/Help";
import AdminDashboard from "./components/AdminDashboard";
import MainContent from "./components/SuggestedSongs/MainContent";

const drawerWidth = 245;

const App = () => {
  // State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState('default');
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Theme and responsiveness
  const customTheme = useMemo(() => {
    const selectedTheme = themeColors.find(t => t.id === themeColor) || themeColors[0];
    return createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: { main: selectedTheme.primary },
        secondary: { main: selectedTheme.secondary },
      },
    });
  }, [darkMode, themeColor]);

  const isMobileView = useMediaQuery(customTheme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  // Theme handlers
  const handleThemeColorChange = useCallback((newThemeColor) => {
    setThemeColor(newThemeColor);
    localStorage.setItem('themeColor', newThemeColor);
  }, []);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  }, []);

  // Load preferences and data
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedThemeColor = localStorage.getItem('themeColor');
    
    if (savedDarkMode === null) {
      setDarkMode(true);
      localStorage.setItem('darkMode', 'true');
    } else {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    if (savedThemeColor) {
      setThemeColor(savedThemeColor);
    }
  }, []);

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
      if (currentUser) {
        const adminStatus = await checkSuperAdmin(currentUser.uid);
        setIsAdmin(adminStatus);
      }
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
                borderRight: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden',
                '&:hover': {
                  overflowY: 'auto',
                },
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'rgba(255,255,255,0.3)',
                },
              },
            }}
          >
            <Navigation 
              isMobileView={isMobileView} 
              setMobileOpen={setMobileOpen}
              customTheme={customTheme} 
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
                borderRight: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden',
                '&:hover': {
                  overflowY: 'auto',
                },
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'rgba(255,255,255,0.3)',
                },
              } 
            }}
          >
            <Navigation 
              isMobileView={isMobileView} 
              setMobileOpen={setMobileOpen}
              customTheme={customTheme}
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
          {!isPublicRoute && <Toolbar />}
          <Routes>
            <Route path="/" element={user ? <Navigate to="/list-song/lyrics" replace /> : <Login />} />
            <Route path="/list-song/:collectionName" element={user ? <SongList /> : <Login />} />
            <Route path="/suggestedsongs" element={user ? <MainContent /> : <Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={user ? <Profile /> : <Login />} />
            <Route path="/:path" element={user ? <CollectionForm collectionName={window.location.pathname.substring(1)} /> : <Login />} />
            <Route 
              path="/settings" 
              element={
                user ? (
                  <Settings 
                    darkMode={darkMode} 
                    toggleTheme={toggleTheme}
                    onThemeColorChange={handleThemeColorChange}
                    currentTheme={themeColor}
                  />
                ) : (
                  <Login />
                )
              } 
            />
            <Route path="/help" element={user ? <Help /> : <Login />} />
            <Route 
              path="/admin" 
              element={
                user && isAdmin ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
