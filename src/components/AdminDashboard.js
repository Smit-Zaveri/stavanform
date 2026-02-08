import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import StorageIcon from '@mui/icons-material/Storage';
import ImportExportIcon from '@mui/icons-material/ImportExport';

// Import components
import { StatisticsCards } from './AdminDashboard/StatisticsCards';
import { AnalyticsCharts } from './AdminDashboard/AnalyticsCharts';
import { CollectionManagement } from './AdminDashboard/CollectionManagement';
import { MenuConfig } from './AdminDashboard/MenuConfig';
import { ActivityLog } from './AdminDashboard/ActivityLog';
import { ExportImport } from './AdminDashboard/ExportImport';

// Import hooks
import { useAdminAnalytics } from '../hooks/useAdminAnalytics';
import { useMenuManagement } from '../hooks/useMenuManagement';
import { useCollectionOperations } from '../hooks/useCollectionOperations';
import { useCollectionAnalytics } from '../hooks/useAdminAnalytics';

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCollection, setSelectedCollection] = useState('');
  
  // Initialize hooks
  const { analyticsData, loading, error, loadAnalytics } = useAdminAnalytics();
  const menuManagement = useMenuManagement();
  const collectionAnalytics = useCollectionAnalytics(selectedCollection, analyticsData);
  const collectionOps = useCollectionOperations(() => {
    loadAnalytics(); // Now this will work since loadAnalytics is properly defined
  });

  useEffect(() => {
    menuManagement.loadNavItems();
  }, [menuManagement.loadNavItems, menuManagement]);

  const handleCollectionChange = (event) => {
    setSelectedCollection(event.target.value);
  };

  // Data processing for charts
  const getMonthlyGrowthData = () => {
    const data = selectedCollection ? collectionAnalytics.monthlyGrowth : analyticsData.monthlyGrowth;
    if (!data || data.length === 0) return { labels: [], values: [] };
    
    const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));
    const last12Months = sortedData.slice(-12);
    
    return {
      labels: last12Months.map(item => {
        const [year, month] = item.month.split('-');
        return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
      }),
      values: last12Months.map(item => item.count)
    };
  };

  const getLanguageData = () => {
    if (selectedCollection) {
      return {
        labels: Object.keys(collectionAnalytics.songsByLanguage),
        values: Object.values(collectionAnalytics.songsByLanguage)
      };
    }

    const languageStats = analyticsData.languages.reduce((acc, lang) => {
      acc[lang] = Object.values(analyticsData.collectionStats || {})
        .reduce((sum, coll) => sum + ((coll.languages || {})[lang] || 0), 0);
      return acc;
    }, {});

    return {
      labels: Object.keys(languageStats),
      values: Object.values(languageStats)
    };
  };

  const getCollectionChartData = () => {
    if (!analyticsData.collectionStats || Object.keys(analyticsData.collectionStats).length === 0) {
      return { labels: [], values: [] };
    }

    const sortedData = Object.values(analyticsData.collectionStats)
      .sort((a, b) => b.count - a.count);

    return {
      labels: sortedData.map(c => c.name || 'Unnamed'),
      values: sortedData.map(c => c.count || 0)
    };
  };

  const renderAnalytics = () => (
    <Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Collection Selector */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Collection</InputLabel>
              <Select
                value={selectedCollection}
                onChange={handleCollectionChange}
                label="Select Collection"
              >
                <MenuItem value="">All Collections</MenuItem>
                {Object.keys(analyticsData.collectionStats).map(name => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Statistics Cards */}
          <StatisticsCards
            stats={analyticsData}
            selectedCollection={selectedCollection}
            collectionAnalytics={collectionAnalytics}
          />

          {/* Charts */}
          <AnalyticsCharts
            monthlyData={getMonthlyGrowthData()}
            collectionsData={getCollectionChartData()}
            languageData={getLanguageData()}
            selectedCollection={selectedCollection}
          />

          {/* Collection Management */}
          <CollectionManagement
            selectedCollection={selectedCollection}
            exportInProgress={collectionOps.exportInProgress}
            importInProgress={collectionOps.importInProgress}
            onExport={collectionOps.handleCollectionExport}
            onImport={collectionOps.handleCollectionImport}
          />

          {/* Activity Log */}
          <ActivityLog activities={analyticsData.recentActivity} />
        </Grid>
      )}
    </Box>
  );

  const renderExportImport = () => (
    <ExportImport
      collections={Object.keys(analyticsData.collectionStats)}
      exportInProgress={collectionOps.exportInProgress}
      importInProgress={collectionOps.importInProgress}
      onExport={collectionOps.handleCollectionExport}
      onImport={collectionOps.handleCollectionImport}
    />
  );

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
        <Tab icon={<AnalyticsIcon />} label="Analytics" />
        <Tab icon={<StorageIcon />} label="Menu Configuration" />
        <Tab icon={<ImportExportIcon />} label="Export / Import" />
      </Tabs>

      {selectedTab === 0 && renderAnalytics()}
      {selectedTab === 1 && (
        <MenuConfig
          newMenuItem={menuManagement.newMenuItem}
          sidebarItems={menuManagement.sidebarItems}
          editingItem={menuManagement.editingItem}
          isEditDialogOpen={menuManagement.isEditDialogOpen}
          onNewMenuItemChange={menuManagement.setNewMenuItem}
          onAddMenuItem={menuManagement.handleAddMenuItem}
          onEditClick={menuManagement.handleEditClick}
          onEditSave={menuManagement.handleEditSave}
          onDeleteItem={menuManagement.handleDeleteItem}
          onEditDialogClose={() => menuManagement.setIsEditDialogOpen(false)}
          onEditingItemChange={menuManagement.setEditingItem}
          onDragStart={menuManagement.handleDragStart}
          onDragOver={menuManagement.handleDragOver}
          onDrop={menuManagement.handleDrop}
        />
      )}
      {selectedTab === 2 && renderExportImport()}
    </Box>
  );
};

export default AdminDashboard;
