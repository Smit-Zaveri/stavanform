import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Snackbar,
  IconButton,
  Fade,
  Checkbox,
} from "@mui/material";
import {
  Refresh,
  Close,
  Delete,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { firestore } from "../../firebase";
import useDebounce from "../../hooks/useDebounce";
import CollectionsTabs from "./CollectionsTabs";
import FilterBar from "./FilterBar";
import SuggestionsGrid from "./SuggestionsGrid";
import SuggestionsList from "./SuggestionsList";
import DeleteDialog from "./DeleteDialog";
import SongModal from "./SongModal";
import LoadingSkeleton from "./LoadingSkeleton";

const MainContent = () => {
  const [loading, setLoading] = useState(true);
  const [groupedSuggestions, setGroupedSuggestions] = useState({});
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [suggestionToDelete, setSuggestionToDelete] = useState(null);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("date");
  const [viewMode, setViewMode] = useState(() => {
    const savedViewMode = localStorage.getItem('suggestionsViewMode');
    return savedViewMode || "grid";
  });
  const [activeFilter, setActiveFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");

  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await firestore.collection("suggestions_new").get();
      const suggestions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));

      const grouped = suggestions.reduce((acc, suggestion) => {
        const { collection } = suggestion;
        acc[collection] = acc[collection] || [];
        acc[collection].push(suggestion);
        return acc;
      }, {});

      setGroupedSuggestions(grouped);
    } catch (err) {
      setError("Failed to fetch suggestions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleApplySuggestion = async (suggestion) => {
    const formattedSuggestion = {
      title: suggestion.title,
      content: suggestion.content,
      artist: suggestion.artistName || "",
      tags: suggestion.tags || [],
      order: suggestion.order || "",
      youtube: suggestion.youtube || "",
      newFlag: false,
      newTts: false,
      collection: suggestion.collection
    };
    
    try {
      const targetCollection = firestore.collection(suggestion.collection);
      const existingQuery = await targetCollection
        .where("title", "==", suggestion.title)
        .get();

      if (!existingQuery.empty) {
        await firestore.collection("suggestions_new").doc(suggestion.id).delete();
        setGroupedSuggestions((prev) => {
          const updated = { ...prev };
          updated[suggestion.collection] = updated[suggestion.collection].filter(
            (s) => s.id !== suggestion.id
          );
          if (!updated[suggestion.collection].length) {
            delete updated[suggestion.collection];
          }
          return updated;
        });
      }

      navigate(`/list-song/${suggestion.collection}`, { 
        state: { 
          suggestion: formattedSuggestion,
          fromSuggestions: true,
          suggestionId: suggestion.id
        } 
      });
    } catch (error) {
      console.error("Error checking/deleting suggestion:", error);
      navigate(`/list-song/${suggestion.collection}`, { 
        state: { 
          suggestion: formattedSuggestion,
          fromSuggestions: true,
          suggestionId: suggestion.id
        } 
      });
    }
  };

  const handleOpenModal = (song) => {
    setSelectedSong(song);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSong(null);
  };

  const handleDeleteClick = (suggestion) => {
    setSuggestionToDelete(suggestion);
    setIsBulkDelete(false);
    setOpenDialog(true);
  };

  const handleBulkDeleteClick = () => {
    setIsBulkDelete(true);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (isBulkDelete) {
      // Bulk delete
      if (selectedSuggestionIds.length === 0) return;
      try {
        const batch = firestore.batch();
        selectedSuggestionIds.forEach((id) => {
          const docRef = firestore.collection("suggestions_new").doc(id);
          batch.delete(docRef);
        });
        await batch.commit();
        
        setGroupedSuggestions((prev) => {
          const updated = { ...prev };
          selectedSuggestionIds.forEach((id) => {
            Object.keys(updated).forEach((collection) => {
              updated[collection] = updated[collection].filter((s) => s.id !== id);
              if (!updated[collection].length) {
                delete updated[collection];
              }
            });
          });
          return updated;
        });
        
        setSnackMessage(`${selectedSuggestionIds.length} suggestion(s) deleted successfully.`);
        setSelectedSuggestionIds([]);
        setSnackOpen(true);
      } catch (error) {
        setError("Failed to delete suggestions.");
        console.error("Bulk delete error:", error);
      }
    } else {
      // Single delete
      if (!suggestionToDelete) return;
      try {
        await firestore.collection("suggestions_new").doc(suggestionToDelete.id).delete();
        setGroupedSuggestions((prev) => {
          const updated = { ...prev };
          updated[suggestionToDelete.collection] = updated[suggestionToDelete.collection].filter(
            (s) => s.id !== suggestionToDelete.id
          );
          if (!updated[suggestionToDelete.collection].length) {
            delete updated[suggestionToDelete.collection];
          }
          return updated;
        });
        setSnackMessage("Suggestion deleted successfully.");
        setSnackOpen(true);
      } catch (error) {
        setError("Failed to delete suggestion.");
        console.error("Delete error:", error);
      }
    }
    setOpenDialog(false);
    setSuggestionToDelete(null);
    setIsBulkDelete(false);
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
    setSuggestionToDelete(null);
    setIsBulkDelete(false);
  };

  const handleSelectSuggestion = (id) => {
    setSelectedSuggestionIds((prev) =>
      prev.includes(id)
        ? prev.filter((suggestionId) => suggestionId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedSuggestionIds(paginatedSuggestions.map((s) => s.id));
    } else {
      setSelectedSuggestionIds([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedSuggestionIds([]);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPage(0);
    setSelectedSuggestionIds([]);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filteredSuggestions = useMemo(() => {
    let suggestions = [];
    
    // Get suggestions based on collection selection
    if (selectedCollection === "all") {
      // Get all suggestions from all collections
      suggestions = Object.values(groupedSuggestions).flat();
      
      // Apply collection filter if not "all"
      if (collectionFilter !== "all") {
        suggestions = suggestions.filter(s => s.collection === collectionFilter);
      }
    } else {
      suggestions = groupedSuggestions[selectedCollection] || [];
    }
    
    if (debouncedSearchTerm) {
      suggestions = suggestions.filter((song) =>
        song.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (song.artistName && song.artistName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      );
    }

    if (activeFilter === "recent") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      suggestions = suggestions.filter(s => new Date(s.createdAt) > oneWeekAgo);
    }
    
    suggestions = [...suggestions].sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      if (sortBy === "title") {
        if (a.title < b.title) return sortOrder === "asc" ? -1 : 1;
        if (a.title > b.title) return sortOrder === "asc" ? 1 : -1;
        return 0;
      }
      return 0;
    });

    return suggestions;
  }, [debouncedSearchTerm, groupedSuggestions, selectedCollection, collectionFilter, sortOrder, sortBy, activeFilter]);

  const paginatedSuggestions = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSuggestions.slice(start, start + rowsPerPage);
  }, [filteredSuggestions, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setSelectedSuggestionIds([]);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setSelectedSuggestionIds([]);
  };

  const handleViewModeChange = (newMode) => {
    setViewMode(newMode);
    localStorage.setItem('suggestionsViewMode', newMode);
    setSelectedSuggestionIds([]);
  };

  const handleCollectionChange = (newCollection) => {
    setSelectedCollection(newCollection);
    setPage(0);
    setActiveFilter("all");
    setCollectionFilter("all");
    setSelectedSuggestionIds([]);
  };

  const collections = Object.keys(groupedSuggestions);
  const allSelected = paginatedSuggestions.length > 0 && paginatedSuggestions.every(s => selectedSuggestionIds.includes(s.id));
  const someSelected = selectedSuggestionIds.length > 0 && !allSelected;

  if (loading) {
    return <LoadingSkeleton viewMode={viewMode} />;
  }

  if (error) {
    return (
      <Box sx={{ 
        p: 4, 
        backgroundColor: '#1a1a1a', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography color="error" variant="h6" sx={{ mb: 2, color: '#fff' }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={fetchSuggestions}
            startIcon={<Refresh />}
            sx={{ bgcolor: '#fff', color: '#1a1a1a', '&:hover': { bgcolor: '#e0e0e0' } }}
          >
            Try Again
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Fade in timeout={500}>
      <Box sx={{ 
        flexGrow: 1, 
        backgroundColor: '#1a1a1a', 
        minHeight: '100vh',
        px: { xs: 2, sm: 3, md: 4 },
        py: 4,
      }}>
        {/* Header */}
        <Box sx={{
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                mb: 0.5,
                color: '#fff',
              }}
            >
              Suggested Songs
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#999',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Review and manage song suggestions from users
            </Typography>
          </Box>

          <IconButton 
            onClick={fetchSuggestions}
            sx={{ 
              color: '#999',
              bgcolor: '#252525',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              '&:hover': { 
                color: '#fff',
                bgcolor: '#2a2a2a'
              },
            }}
          >
            <Refresh />
          </IconButton>
        </Box>

        {/* Collection Tabs */}
        {collections.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <CollectionsTabs
              collections={collections}
              selectedCollection={selectedCollection}
              onSelectCollection={handleCollectionChange}
              groupedSuggestions={groupedSuggestions}
            />
          </Box>
        )}

        {/* Filter Bar */}
        <Box sx={{ mb: 3 }}>
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            sortOrder={sortOrder}
            onToggleSort={toggleSortOrder}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            showCollectionFilter={selectedCollection === "all"}
            collectionFilter={collectionFilter}
            onCollectionFilterChange={setCollectionFilter}
            collections={collections}
          />
        </Box>

        {/* Bulk Actions Bar */}
        {selectedSuggestionIds.length > 0 && (
          <Box sx={{
            mb: 3,
            p: 2,
            bgcolor: '#252525',
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={handleSelectAll}
                sx={{ color: '#fff', '&.Mui-checked': { color: '#fff' } }}
              />
              <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500 }}>
                {selectedSuggestionIds.length} selected
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearSelection}
                sx={{
                  color: '#999',
                  borderColor: 'rgba(255,255,255,0.2)',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.4)',
                    bgcolor: 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<Delete />}
                onClick={handleBulkDeleteClick}
                sx={{
                  bgcolor: '#ff6b6b',
                  color: '#fff',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#ff5252',
                  },
                }}
              >
                Delete Selected
              </Button>
            </Box>
          </Box>
        )}

        {/* Content */}
        <Box>
          {filteredSuggestions.length > 0 ? (
            <>
              {viewMode === "grid" ? (
                <SuggestionsGrid
                  suggestions={paginatedSuggestions}
                  onApply={handleApplySuggestion}
                  onDelete={handleDeleteClick}
                  onOpenModal={handleOpenModal}
                  onSelect={handleSelectSuggestion}
                  selectedIds={selectedSuggestionIds}
                  onSelectAll={handleSelectAll}
                  allSelected={allSelected}
                  someSelected={someSelected}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  count={filteredSuggestions.length}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              ) : (
                <SuggestionsList
                  suggestions={paginatedSuggestions}
                  onApply={handleApplySuggestion}
                  onDelete={handleDeleteClick}
                  onOpenModal={handleOpenModal}
                  onSelect={handleSelectSuggestion}
                  selectedIds={selectedSuggestionIds}
                  onSelectAll={handleSelectAll}
                  allSelected={allSelected}
                  someSelected={someSelected}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  count={filteredSuggestions.length}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              )}
            </>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              mt: 8, 
              p: 4,
              bgcolor: '#252525',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 500 }}>
                {searchTerm ? 'No matches found' : 'No suggestions yet'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                {searchTerm 
                  ? 'Try adjusting your search terms or check a different collection'
                  : 'When users suggest songs, they will appear here for review'
                }
              </Typography>
              {searchTerm && (
                <Button 
                  variant="outlined" 
                  onClick={() => handleSearchChange("")}
                  sx={{ mt: 3, color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  Clear Search
                </Button>
              )}
            </Box>
          )}
        </Box>

        <DeleteDialog
          open={openDialog}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          suggestionToDelete={suggestionToDelete}
          isBulkDelete={isBulkDelete}
          selectedCount={selectedSuggestionIds.length}
        />

        {selectedSong && (
          <SongModal 
            open={openModal} 
            onClose={handleCloseModal} 
            selectedSong={selectedSong}
            onApply={handleApplySuggestion}
            onDelete={handleDeleteClick}
          />
        )}

        <Snackbar
          open={snackOpen}
          autoHideDuration={6000}
          onClose={() => setSnackOpen(false)}
          message={snackMessage}
          action={
            <IconButton size="small" aria-label="close" color="inherit" onClick={() => setSnackOpen(false)}>
              <Close fontSize="small" />
            </IconButton>
          }
        />
      </Box>
    </Fade>
  );
};

export default MainContent;
