import React from 'react';
import {
  AppBar,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Tooltip,
  Divider,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

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

  const handleCompanyNameClick = () => {
    if (user) {
      navigate("/list-song/lyrics");
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: customTheme.zIndex.drawer + 1,
        backgroundColor: '#1a1a1a',
        boxShadow: '0 1px 0 0 rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <Toolbar sx={{ minHeight: '64px', px: { xs: 2, sm: 3 } }}>
        {isMobileView && user && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2,
              color: '#fff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
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
              color: '#fff',
              fontWeight: 600,
              fontSize: '1.25rem',
              letterSpacing: '-0.5px',
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
            sx={{ 
              ml: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <Avatar 
              alt={user.displayName || user.email} 
              src={user.photoURL || ""}
              sx={{
                width: 36,
                height: 36,
                backgroundColor: '#333',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
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
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              backgroundColor: '#252525',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              mt: 1.5,
              minWidth: 200,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
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
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          >
            My Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleProfileMenuClose();
              navigate("/settings");
            }}
            sx={{
              color: '#fff',
              py: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          >
            Settings
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleProfileMenuClose();
              navigate("/help");
            }}
            sx={{
              color: '#fff',
              py: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
              '&:hover': {
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
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
