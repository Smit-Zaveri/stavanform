import "./App.css";
import React from "react";
import Form from "./Form";
import Tag from "./Tag";
import SongList from "./ListSong.js";

import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LabelIcon from "@mui/icons-material/Label";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { useState } from "react";
import ArtistForm from "./ArtistForm";
import Catagory from "./Catagory";
import CollectionForm from "./CollectionForm";

const App = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div>
      {/* Other components */}
      {selectedTab === 0 && <Form />}
      {selectedTab === 1 && <Tag />}
      {selectedTab === 2 && <ArtistForm />}
      {selectedTab === 3 && <Catagory />}
      {selectedTab === 4 && <CollectionForm />}
      {selectedTab === 5 && <SongList />}

      <BottomNavigation
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        showLabels
        value={selectedTab}
        onChange={handleTabChange}
      >
        <BottomNavigationAction label="Form" icon={<EditIcon />} />
        <BottomNavigationAction label="Tag" icon={<LabelIcon />} />
        <BottomNavigationAction label="Artist Form" icon={<MusicNoteIcon />} />
        <BottomNavigationAction
          label="Category Form"
          icon={<MusicNoteIcon />}
        />
        <BottomNavigationAction
          label="Collection Form"
          icon={<MusicNoteIcon />}
        />
        <BottomNavigationAction label="List Song" icon={<MusicNoteIcon />} />
      </BottomNavigation>
    </div>
  );
};

export default App;
