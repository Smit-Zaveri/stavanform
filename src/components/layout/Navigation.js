import React from 'react';
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

const drawerWidth = 245;

const Navigation = ({ isMobileView, setMobileOpen, customTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "List Song", icon: <PlaylistAddCheckIcon />, path: "/list-song/lyrics" },
    { label: "Tag", icon: <LabelIcon />, path: "/tag" },
    { label: "Collection", icon: <CollectionsIcon />, path: "/collection" },
    { label: "Artist Form", icon: <MusicNoteIcon />, path: "/artist-form" },
    { label: "Tirtankar", icon: <LibraryMusicIcon />, path: "/tirtankar" },
    { label: "Tirth", icon: <CollectionsIcon />, path: "/tirth" },
    { label: "Suggested Song", icon: <PlaylistAddCheckIcon />, path: "/suggestedsongs" },
  ];

  return (
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
              if (isMobileView) setMobileOpen(false);
            }}
            sx={{
              backgroundColor:
                location.pathname === item.path
                  ? customTheme.palette.action.selected
                  : "transparent",
              "&:hover": {
                backgroundColor: customTheme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Navigation;