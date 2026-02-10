import React from 'react';
import {
  AppBar,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Tooltip,
  Divider,
  Box,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { useNavigate, useLocation } from "react-router-dom";

const Header = ({
  user,
  isMobileView,
  handleDrawerToggle,
  companyName,
  anchorElProfile,
  handleProfileMenuOpen,
  handleProfileMenuClose,
  handleLogout,
  customTheme,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCompanyNameClick = () => {
    if (user) {
      navigate("/list-song/lyrics");
    }
  };

  const navItems = [
    { label: 'Work', path: '/list-song/lyrics' },
    { label: 'About', path: '/profile' },
    { label: 'Playground', path: '/suggestedsongs' },
    { label: 'Resource', path: '/help' },
  ];

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: customTheme.zIndex.drawer + 1,
        backgroundColor: 'transparent',
        boxShadow: 'none',
      }}
    >
      <Toolbar 
        sx={{ 
          minHeight: '80px', 
          px: { xs: 2, sm: 3 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 1,
        }}
      >
        {/* Floating Pill Navigation */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#1a1a1a',
            borderRadius: '50px',
            padding: '8px 12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            gap: 0.5,
          }}
        >
          {/* Logo Icon */}
          <Tooltip title="Go to home" arrow>
            <Box
              onClick={handleCompanyNameClick}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <MusicNoteIcon sx={{ color: '#1a1a1a', fontSize: 20 }} />
            </Box>
          </Tooltip>

          {/* Menu Icon for Mobile */}
          {isMobileView && user && (
            <IconButton
              color="inherit"
              onClick={handleDrawerToggle}
              sx={{
                color: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                ml: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                }
              }}
            >
              <MenuIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}

          {/* Navigation Links */}
          {!isMobileView && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, gap: 0.5 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: '#fff',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    padding: '6px 16px',
                    borderRadius: '25px',
                    backgroundColor: location.pathname === item.path 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Divider */}
          {!isMobileView && (
            <Divider 
              orientation="vertical" 
              flexItem 
              sx={{ 
                borderColor: 'rgba(255, 255, 255, 0.15)', 
                mx: 1,
                height: 24,
                alignSelf: 'center',
              }} 
            />
          )}

          {/* Contact / Profile Button */}
          {user && (
            <Tooltip title="Profile Menu" arrow>
              <Button
                onClick={handleProfileMenuOpen}
                sx={{
                  color: '#1a1a1a',
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  padding: '6px 16px',
                  borderRadius: '25px',
                  backgroundColor: '#fff',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                    transform: 'scale(1.02)',
                  },
                }}
              >
                {user.email || 'Profile'}
              </Button>
            </Tooltip>
          )}
        </Box>

        {/* Profile Dropdown Menu */}
        <Menu
          id="profile-menu"
          anchorEl={anchorElProfile}
          keepMounted
          open={Boolean(anchorElProfile)}
          onClose={handleProfileMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(37, 37, 37, 0.95)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 2,
              mt: 1.5,
              minWidth: 200,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              overflow: 'hidden',
            }
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#fff',
                fontWeight: 500,
              }}
            >
              {user && user.displayName}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#666',
                display: 'block',
                mt: 0.5,
              }}
            >
              {user && user.email}
            </Typography>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          <MenuItem
            onClick={() => {
              handleProfileMenuClose();
              navigate("/profile");
            }}
            sx={{
              color: '#fff',
              py: 1.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                paddingLeft: '24px',
              }
            }}
          >
            My Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleProfileMenuClose();
              navigate("/help");
            }}
            sx={{
              color: '#fff',
              py: 1.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                paddingLeft: '24px',
              }
            }}
          >
            Help
          </MenuItem>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          <MenuItem
            onClick={() => {
              handleProfileMenuClose();
              handleLogout();
            }}
            sx={{
              color: '#ff6b6b',
              py: 1.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 107, 107, 0.15)',
                paddingLeft: '24px',
              }
            }}
          >
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
