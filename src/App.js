// App.js
import React, { useState } from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import LabelIcon from "@mui/icons-material/Label";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import DashboardIcon from "@mui/icons-material/Dashboard";
//import CollectionIcon from "@mui/icons-material/CollectionMusic";
import ListIcon from "@mui/icons-material/List";

import Form from "./Form";
import Tag from "./Tag";
import ArtistForm from "./ArtistForm";
import Catagory from "./Catagory";
import CollectionForm from "./CollectionForm";
import SongList from "./ListSong.js";

const drawerWidth = 240;

const App = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const navItems = [
    { label: "Form", icon: <EditIcon /> },
    { label: "Tag", icon: <LabelIcon /> },
    { label: "Artist Form", icon: <MusicNoteIcon /> },
    { label: "Category", icon: <DashboardIcon /> },
    { label: "Collection", icon: <DashboardIcon /> },
    { label: "List Song", icon: <ListIcon /> },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 0:
        return <Form />;
      case 1:
        return <Tag />;
      case 2:
        return <ArtistForm />;
      case 3:
        return <Catagory />;
      case 4:
        return <CollectionForm />;
      case 5:
        return <SongList />;
      default:
        return <Form />;
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Music Manager
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar for Desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: "auto" }}>
            <List>
              {navItems.map((item, index) => (
                <ListItem
                  button
                  key={item.label}
                  selected={selectedTab === index}
                  onClick={() => setSelectedTab(index)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {renderContent()}
      </Box>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <BottomNavigation value={selectedTab} onChange={handleTabChange} showLabels>
            {navItems.map((item, index) => (
              <BottomNavigationAction
                key={item.label}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Box>
      )}
    </Box>
  );
};

export default App;
