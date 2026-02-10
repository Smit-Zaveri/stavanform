import React, { useEffect, useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  IconButton,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { sidebarConfigRef } from '../../firebase';
import { auth } from '../../firebase';

const drawerWidth = 260;

const Navigation = ({ isMobileView, setMobileOpen, customTheme, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const unsubscribe = sidebarConfigRef.doc('main').onSnapshot((doc) => {
      if (doc.exists) {
        const items = doc.data().items || [];
        const sortedItems = items.sort((a, b) => {
          if (typeof a.order !== 'number') return 1;
          if (typeof b.order !== 'number') return -1;
          return a.order - b.order;
        });
        setMenuItems(sortedItems);
      }
    }, (error) => {
      console.error("Error listening to menu items:", error);
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
    const iconStyle = { fontSize: 20 };
    switch (type) {
      case 'listSong':
        return <MusicNoteIcon sx={iconStyle} />;
      case 'suggestedSongs':
        return <TaskAltOutlinedIcon sx={iconStyle} />;
      default:
        switch (iconName) {
          case 'home':
            return <HomeOutlinedIcon sx={iconStyle} />;
          case 'activity':
            return <BarChartOutlinedIcon sx={iconStyle} />;
          case 'task':
            return <TaskAltOutlinedIcon sx={iconStyle} />;
          case 'users':
            return <PeopleOutlinedIcon sx={iconStyle} />;
          case 'notification':
            return <NotificationsNoneOutlinedIcon sx={iconStyle} />;
          case 'setting':
            return <SettingsOutlinedIcon sx={iconStyle} />;
          case 'report':
            return <DescriptionOutlinedIcon sx={iconStyle} />;
          case 'support':
            return <HelpOutlineOutlinedIcon sx={iconStyle} />;
          default:
            return <MusicNoteIcon sx={iconStyle} />;
        }
    }
  };

  const getBadgeCount = (itemId) => {
    switch (itemId) {
      case 'activity':
        return 10;
      case 'notification':
        return 21;
      default:
        return null;
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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const isActive = (item) => {
    if (item.type === 'listSong') {
      return location.pathname.includes(`/list-song/${item.collection || 'lyrics'}`);
    }
    return location.pathname === item.path;
  };

  return (
    <Box sx={{ 
      width: drawerWidth, 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Logo Section */}
      <Box sx={{ p: 2.5, pt: isMobileView ? 2 : 3, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MusicNoteIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#fff', 
              fontWeight: 600, 
              fontSize: '1.1rem',
              letterSpacing: '-0.02em',
            }}
          >
            Stavan Form
          </Typography>
        </Box>
      </Box>

      {/* Menu Section */}
      <Box sx={{ px: 2.5, mb: 1, flexShrink: 0 }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#6b7280', 
            fontSize: '0.7rem', 
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Menu
        </Typography>
      </Box>

      <List sx={{ 
        py: 0.5,
        px: 1.5,
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '2px',
        },
      }}>
        {menuItems.map((item) => {
          const active = isActive(item);
          const badgeCount = getBadgeCount(item.id);
          
          return (
            <ListItem
              key={item.id}
              button
              onClick={() => handleNavigate(item)}
              sx={{
                backgroundColor: active
                  ? 'rgba(59, 130, 246, 0.15)'
                  : "transparent",
                borderRadius: 2,
                mb: 0.5,
                py: 1,
                px: 1.5,
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::before': active ? {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: '60%',
                  backgroundColor: '#3b82f6',
                  borderRadius: '0 4px 4px 0',
                } : {},
                '&:hover': {
                  backgroundColor: active 
                    ? 'rgba(59, 130, 246, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 32, 
                  color: active ? '#3b82f6' : '#9ca3af',
                  transition: 'color 0.2s ease',
                }}
              >
                {getIcon(item.icon, item.type)}
              </ListItemIcon>
              <ListItemText 
                primary={item.name} 
                primaryTypographyProps={{
                  style: {
                    fontWeight: active ? 500 : 400,
                    fontSize: '0.875rem',
                    color: active ? '#fff' : '#d1d5db'
                  }
                }}
              />
              {badgeCount && (
                <Box
                  sx={{
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    borderRadius: '50%',
                    minWidth: 22,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    ml: 1,
                  }}
                >
                  {badgeCount}
                </Box>
              )}
            </ListItem>
          );
        })}
      </List>

      {/* Bottom Section */}
      <Box sx={{ p: 2, flexShrink: 0, pb: isMobileView ? 4 : 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 2 }} />

        {/* User Profile */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <Avatar
            src={user?.photoURL}
            sx={{
              width: 36,
              height: 36,
              backgroundColor: '#3b82f6',
              fontSize: '0.875rem',
            }}
          >
            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#fff', 
                fontWeight: 500,
                fontSize: '0.85rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.displayName || 'User'}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#6b7280', 
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email}
            </Typography>
          </Box>
          <IconButton
            onClick={handleLogout}
            sx={{
              color: '#6b7280',
              p: 0.5,
              '&:hover': {
                color: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
              },
            }}
          >
            <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Navigation;
