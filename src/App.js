import './App.css';
import React from 'react';
import Form from './Form';
import Tag from './Tag';
import SongList from './ListSong.js';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LabelIcon from '@mui/icons-material/Label';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { useState } from 'react';

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
      {selectedTab === 2 && <SongList />}

      <BottomNavigation
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
        showLabels
        value={selectedTab}
        onChange={handleTabChange}
      >
        <BottomNavigationAction label="Form" icon={<EditIcon />} />
        <BottomNavigationAction label="Tag" icon={<LabelIcon />} />
        <BottomNavigationAction label="List Song" icon={<MusicNoteIcon />} />
      </BottomNavigation>
    </div>
  );
};

export default App;
