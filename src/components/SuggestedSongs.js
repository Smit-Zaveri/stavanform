import React, { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  Grid,
  IconButton,
  Snackbar,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Sort, Refresh } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { firestore } from "../firebase";
import Sidebar from "./SuggestedSongs/Sidebar";
import MainContent from "./SuggestedSongs/MainContent";
import DeleteConfirmDialog from "./DialogComponents/DeleteConfirmDialog";
import SongDetailsModal from "./DialogComponents/SongDetailsModal";

const SuggestedSongs = () => {
  // ...existing code for state and handlers...

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          {isSmallScreen && (
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
              aria-label="menu"
            >
              <Sort />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Suggested Songs
          </Typography>
          <Button
            color="inherit"
            onClick={fetchSuggestions}
            startIcon={<Refresh />}
          >
            Refresh
          </Button>
        </Toolbar>
      </AppBar>

      <Grid container>
        {isSmallScreen ? (
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
          >
            <Sidebar
              collections={Object.keys(groupedSuggestions)}
              selectedCollection={selectedCollection}
              onSelectCollection={(collection) => {
                setSelectedCollection(collection);
                setDrawerOpen(false);
              }}
            />
          </Drawer>
        ) : (
          <Grid item xs={12} sm={3} md={2}>
            <Sidebar
              collections={Object.keys(groupedSuggestions)}
              selectedCollection={selectedCollection}
              onSelectCollection={setSelectedCollection}
            />
          </Grid>
        )}

        <Grid item xs={12} sm={9} md={10}>
          <MainContent
            selectedCollection={selectedCollection}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            filteredSuggestions={filteredSuggestions}
            page={page}
            rowsPerPage={rowsPerPage}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
            onApply={handleApplySuggestion}
            onDelete={handleDeleteClick}
            onOpenModal={handleOpenModal}
            toggleSortOrder={toggleSortOrder}
            sortOrder={sortOrder}
          />
        </Grid>
      </Grid>

      <DeleteConfirmDialog
        open={openDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Suggestion"
        content={`Are you sure you want to delete the suggestion for "${suggestionToDelete?.title}"?`}
      />

      <SongDetailsModal
        open={openModal}
        onClose={handleCloseModal}
        song={selectedSong}
      />

      <Snackbar
        open={snackOpen}
        autoHideDuration={6000}
        onClose={() => setSnackOpen(false)}
        message={snackMessage}
      />
    </Box>
  );
};

export default SuggestedSongs;