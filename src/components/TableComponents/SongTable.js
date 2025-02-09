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
  hasAnyReport,
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
    <TableContainer component={Paper}>
      <Table>
        <TableHeader
          hasAnyReport={hasAnyReport}
          selectedSongIds={selectedSongIds}
          paginatedSongs={paginatedSongs}
          handleSelectAll={handleSelectAll}
        />
        <TableBody>
          {paginatedSongs.map((song) => {
            const report = reports.find((r) => r.lyricsId === song.id);
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