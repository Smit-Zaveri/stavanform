import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Card,
  CardContent,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  MusicNote as MusicIcon,
  LibraryMusic as LibraryIcon,
  TrendingUp as TrendingIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import useDashboard from "../../hooks/useDashboard";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Dashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    collections,
    totalStats,
    loading,
    error,
    refetchData
  } = useDashboard();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchData();
    setRefreshing(false);
  };

  if (loading && collections.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: '#1a1a1a'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#fff' }} />
          <Typography sx={{ mt: 2, color: '#999' }}>
            Loading dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        mt: 4,
        mb: 4,
        px: { xs: 2, sm: 3, md: 4, lg: 6 },
        maxWidth: { xs: '100%', sm: '100%', md: '100%', lg: '1400px', xl: '1600px' },
        mx: 'auto'
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#fff',
            fontWeight: 600,
            fontSize: { xs: '1.5rem', md: '2rem' }
          }}
        >
          Dashboard
        </Typography>
        <IconButton
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{
            color: '#999',
            '&:hover': { color: '#fff' },
            '&.Mui-disabled': { color: '#666' }
          }}
        >
          {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: '#2a2a2a', color: '#fff' }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: '#252525',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <LibraryIcon sx={{ color: '#3b82f6', fontSize: 32 }} />
            <Box>
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 600 }}>
                {totalStats.totalCollections}
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                Collections
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: '#252525',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <MusicIcon sx={{ color: '#10b981', fontSize: 32 }} />
            <Box>
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 600 }}>
                {totalStats.totalSongs}
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                Total Songs
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: '#252525',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <TrendingIcon sx={{ color: '#f59e0b', fontSize: 32 }} />
            <Box>
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 600 }}>
                {totalStats.recentActivity || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                Recent Activity
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: '#252525',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <ScheduleIcon sx={{ color: '#ef4444', fontSize: 32 }} />
            <Box>
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 600 }}>
                {totalStats.lastUpdated ? new Date(totalStats.lastUpdated).toLocaleDateString() : 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                Last Updated
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Collections Grid */}
      <Typography variant="h5" sx={{ color: '#fff', mb: 3, fontWeight: 500 }}>
        Collections Overview
      </Typography>

      <Grid container spacing={3}>
        {collections.map((collection) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={collection.name}>
            <Card
              sx={{
                backgroundColor: '#252525',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => window.location.href = `/list-song/${collection.name}`}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <LibraryIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                  <Chip
                    label={`${collection.songCount} songs`}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                      fontWeight: 500
                    }}
                  />
                </Box>

                <Tooltip title={collection.displayName.join(' / ')} placement="top">
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#fff',
                      fontWeight: 600,
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {collection.displayName[2] || collection.displayName[1] || collection.displayName[0] || collection.name}
                  </Typography>
                </Tooltip>

                <Typography variant="body2" sx={{ color: '#999', mb: 2 }}>
                  {collection.name}
                </Typography>

                {collection.lastUpdated && (
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Updated {new Date(collection.lastUpdated).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      {collections.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ color: '#fff', mb: 3, fontWeight: 500 }}>
            Analytics
          </Typography>

          <Grid container spacing={4}>
            {/* Pie Chart - Song Distribution */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: '#252525',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 500 }}>
                  Songs by Collection
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Pie
                    data={{
                      labels: collections.map(col => col.displayName[2] || col.displayName[1] || col.displayName[0] || col.name),
                      datasets: [{
                        data: collections.map(col => col.songCount),
                        backgroundColor: [
                          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                          '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
                        ],
                        borderWidth: 1,
                        borderColor: '#1a1a1a'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: '#fff',
                            font: {
                              size: 12
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: '#252525',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderWidth: 1
                        }
                      }
                    }}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Bar Chart - Collection Comparison */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: '#252525',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 500 }}>
                  Collection Sizes
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar
                    data={{
                      labels: collections.map(col => col.displayName[2] || col.displayName[1] || col.displayName[0] || col.name),
                      datasets: [{
                        label: 'Number of Songs',
                        data: collections.map(col => col.songCount),
                        backgroundColor: 'rgba(59, 130, 246, 0.6)',
                        borderColor: '#3b82f6',
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(255,255,255,0.1)'
                          },
                          ticks: {
                            color: '#fff'
                          }
                        },
                        x: {
                          grid: {
                            color: 'rgba(255,255,255,0.1)'
                          },
                          ticks: {
                            color: '#fff',
                            maxRotation: 45,
                            minRotation: 45
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          backgroundColor: '#252525',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderWidth: 1
                        }
                      }
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {collections.length === 0 && !loading && (
        <Box sx={{
          textAlign: 'center',
          mt: 8,
          p: 4,
          backgroundColor: '#252525',
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <LibraryIcon sx={{ fontSize: 48, color: '#666', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 500 }}>
            No collections found
          </Typography>
          <Typography variant="body2" sx={{ color: '#999' }}>
            Create your first collection to get started
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;