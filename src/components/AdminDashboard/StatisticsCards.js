import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { formatDuration, formatStorageSize } from '../../utils/analyticsUtils';

export const StatisticsCards = ({ stats, selectedCollection, collectionAnalytics }) => (
  <>
    <Grid item xs={12} md={3}>
      <Card>
        <CardContent>
          <Typography variant="h6">Total Songs</Typography>
          <Typography variant="h3">
            {selectedCollection ? collectionAnalytics.songCount : stats.totalSongs}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} md={3}>
      <Card>
        <CardContent>
          <Typography variant="h6">Total Duration</Typography>
          <Typography variant="h3">
            {formatDuration(selectedCollection ? 
              collectionAnalytics.totalDuration : 
              stats.totalDuration)}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} md={3}>
      <Card>
        <CardContent>
          <Typography variant="h6">
            {selectedCollection ? 'Average Duration' : 'Collections'}
          </Typography>
          <Typography variant="h3">
            {selectedCollection ? 
              formatDuration(collectionAnalytics.averageDuration) : 
              stats.totalCollections}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} md={3}>
      <Card>
        <CardContent>
          <Typography variant="h6">Storage Used</Typography>
          <Typography variant="h3">{formatStorageSize(stats.storageUsage)}</Typography>
        </CardContent>
      </Card>
    </Grid>
  </>
);