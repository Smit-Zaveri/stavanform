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
    <AppBar position="fixed" sx={{ zIndex: customTheme.zIndex.drawer + 1 }}>
      <Toolbar>
        {isMobileView && user && (
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
  );
};

export default Header;