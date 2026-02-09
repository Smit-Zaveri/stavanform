import React from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  Paper
} from '@mui/material';
import TableHeader from './TableHeader';
import SongTableRow from './SongTableRow';

const SongTable = ({
  paginatedSongs,
  selectedSongIds,
  reports,
  handleSelectAll,
  handleSelectSong,
  handleEditClick,
  handleDeleteClick,
  handleResolveClick
}) => {
  return (
    <TableContainer 
      component={Paper}
      sx={{
        bgcolor: '#252525',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Table>
        <TableHeader
          selectedSongIds={selectedSongIds}
          paginatedSongs={paginatedSongs}
          handleSelectAll={handleSelectAll}
        />
        <TableBody>
          {paginatedSongs.map((song) => {
            // Find report by id or title for consistency
            const report = reports.find((r) => r.lyricsId === song.id || r.lyricsTitle === song.title);
            const isItemSelected = selectedSongIds.includes(song.id);
            return (
              <SongTableRow
                key={song.id}
                song={song}
                report={report}
                isItemSelected={isItemSelected}
                handleSelectSong={handleSelectSong}
                handleEditClick={handleEditClick}
                handleDeleteClick={handleDeleteClick}
                handleResolveClick={handleResolveClick}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SongTable;