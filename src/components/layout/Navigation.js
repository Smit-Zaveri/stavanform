import React, { useEffect, useState } from 'react';
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import CollectionsIcon from "@mui/icons-material/Collections";
import LabelIcon from "@mui/icons-material/Label";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { checkSuperAdmin, sidebarConfigRef, auth } from '../../firebase';

const drawerWidth = 245;

const Navigation = ({ isMobileView, setMobileOpen, customTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (auth.currentUser) {
        const adminStatus = await checkSuperAdmin(auth.currentUser.uid);
        setIsAdmin(adminStatus);
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    const unsubscribe = sidebarConfigRef.doc('main').onSnapshot((doc) => {
      if (doc.exists) {
        const items = doc.data().items || [];
        // Sort by order, handle missing order values
        const sortedItems = items.sort((a, b) => {
          if (typeof a.order !== 'number') return 1;
          if (typeof b.order !== 'number') return -1;
          return a.order - b.order;
        });
        setMenuItems(sortedItems);
      }
    }, (error) => {
      console.error("Error listening to menu items:", error);
      // Fallback to static load if realtime updates fail
      loadMenuItems();
    });

    return () => unsubscribe();
  }, []);

  const loadMenuItems = async () => {
    try {
      const doc = await sidebarConfigRef.doc('main').get();
      if (doc.exists) {
        const items = doc.data().items || [];
        setMenuItems(items.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
    } catch (error) {
      console.error("Error loading menu items:", error);
    }
  };

  const getIcon = (iconName, type) => {
    switch (type) {
      case 'listSong':
        return <LibraryMusicIcon />;
      case 'suggestedSongs':
        return <QueueMusicIcon />;
      default:
        switch (iconName) {
          case 'collections':
            return <CollectionsIcon />;
          case 'label':
            return <LabelIcon />;
          case 'music':
            return <LibraryMusicIcon />;
          case 'note':
            return <MusicNoteIcon />;
          case 'playlist':
            return <PlaylistAddCheckIcon />;
          default:
            return <CollectionsIcon />;
        }
    }
  };

  const handleNavigate = (item) => {
    let path = item.path;
    
    switch (item.type) {
      case 'listSong':
        path = `/list-song/${item.collection || 'lyrics'}`;
        break;
      case 'suggestedSongs':
        path = '/suggestedsongs';
        break;
      default:
        break;
    }

    navigate(path);
    if (isMobileView) {
      setMobileOpen(false);
    }
  };

  return (
    <Box sx={{ width: drawerWidth, bgcolor: '#1a1a1a', minHeight: '100vh' }}>
      <Toolbar />
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 2 }} />
      <List sx={{ 
        py: 2,
        px: 1,
      }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.id}
            button
            onClick={() => handleNavigate(item)}
            sx={{
              backgroundColor: location.pathname === item.path
                ? 'rgba(255,255,255,0.1)'
                : "transparent",
              "&:hover": {
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
              pl: item.indentLevel ? 4 : 2,
              borderRadius: 2,
              mb: 0.5,
              py: 1,
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: location.pathname === item.path ? '#fff' : '#999' }}>
              {getIcon(item.icon, item.type)}
            </ListItemIcon>
            <ListItemText 
              primary={item.name} 
              primaryTypographyProps={{
                style: {
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  fontSize: '0.9rem',
                  color: location.pathname === item.path ? '#fff' : '#ccc'
                }
              }}
            />
          </ListItem>
        ))}

        {isAdmin && (
          <>
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)', mx: 1 }} />
            <ListItem
              button
              onClick={() => handleNavigate({ path: '/admin' })}
              sx={{
                backgroundColor: location.pathname === '/admin'
                  ? 'rgba(255,255,255,0.1)'
                  : "transparent",
                "&:hover": {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                },
                pl: 2,
                borderRadius: 2,
                py: 1,
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: location.pathname === '/admin' ? '#fff' : '#999' }}>
                <AdminPanelSettingsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Admin Dashboard"
                primaryTypographyProps={{
                  style: {
                    fontWeight: location.pathname === '/admin' ? 600 : 400,
                    fontSize: '0.9rem',
                    color: location.pathname === '/admin' ? '#fff' : '#ccc'
                  }
                }}
              />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
};

export default Navigation;