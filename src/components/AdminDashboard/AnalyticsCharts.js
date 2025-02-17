import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const AnalyticsCharts = ({ 
  monthlyData, 
  collectionsData, 
  languageData,
  selectedCollection 
}) => {
  // Generate unique chart IDs based on current time and data
  const chartIds = useMemo(() => ({
    pie: `pie-${Date.now()}-${languageData.labels.join()}`,
    line: `line-${Date.now()}-${monthlyData.labels.join()}`,
    bar: `bar-${Date.now()}-${collectionsData.labels.join()}`
  }), [languageData.labels, monthlyData.labels, collectionsData.labels]);

  const containerStyle = {
    position: 'relative',
    height: '300px',
    width: '100%',
  };

  return (
    <>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Songs by Language</Typography>
            {languageData.labels.length > 0 ? (
              <Box sx={containerStyle}>
                <Pie
                  id={chartIds.pie}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                    },
                    maintainAspectRatio: false,
                  }}
                  data={{
                    labels: languageData.labels,
                    datasets: [{
                      data: languageData.values,
                      backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                      ],
                      borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                      ],
                    }],
                  }}
                />
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" align="center">
                No language data available
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Monthly Growth</Typography>
            {monthlyData.labels.length > 0 ? (
              <Box sx={containerStyle}>
                <Line
                  id={chartIds.line}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      x: {
                        display: true,
                      },
                      y: {
                        display: true,
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      },
                    },
                    maintainAspectRatio: false,
                  }}
                  data={{
                    labels: monthlyData.labels,
                    datasets: [{
                      label: 'New Songs Added',
                      data: monthlyData.values,
                      borderColor: 'rgb(75, 192, 192)',
                      tension: 0.1,
                      fill: true,
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    }],
                  }}
                />
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" align="center">
                No growth data available
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {!selectedCollection && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Collection Statistics</Typography>
              {collectionsData.labels.length > 0 ? (
                <Box sx={containerStyle}>
                  <Bar
                    id={chartIds.bar}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: 'Songs Distribution Across Collections',
                        },
                      },
                      scales: {
                        x: {
                          display: true,
                        },
                        y: {
                          display: true,
                          beginAtZero: true,
                          ticks: {
                            precision: 0
                          }
                        }
                      },
                      maintainAspectRatio: false,
                    }}
                    data={{
                      labels: collectionsData.labels,
                      datasets: [{
                        label: 'Songs per Collection',
                        data: collectionsData.values,
                        backgroundColor: 'rgba(103, 58, 183, 0.5)',
                        borderColor: 'rgb(103, 58, 183)',
                        borderWidth: 1,
                      }],
                    }}
                  />
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary" align="center">
                  No collection statistics available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}
    </>
  );
};