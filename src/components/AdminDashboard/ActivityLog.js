import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
  Grid
} from '@mui/material';

const formatActivityTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

export const ActivityLog = ({ activities = [] }) => (
  <Grid item xs={12}>
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Recent Activity</Typography>
        <List>
          {activities.map((activity) => (
            <ListItem
              key={activity.id}
              divider
              sx={{
                '&:last-child': { borderBottom: 'none' }
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography component="span" variant="body1">
                      {activity.action}
                    </Typography>
                    {activity.details && (
                      <Chip
                        size="small"
                        label={
                          typeof activity.details === 'string'
                            ? activity.details
                            : Object.entries(activity.details)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(', ')
                        }
                        color="primary"
                        variant="outlined"
                        sx={{ maxWidth: 200 }}
                      />
                    )}
                  </Box>
                }
                secondary={formatActivityTime(activity.timestamp?.seconds * 1000)}
                sx={{
                  '& .MuiListItemText-secondary': {
                    color: 'text.secondary',
                    fontSize: '0.875rem'
                  }
                }}
              />
            </ListItem>
          ))}
          {activities.length === 0 && (
            <ListItem>
              <ListItemText 
                primary="No recent activity"
                sx={{ textAlign: 'center', color: 'text.secondary' }}
              />
            </ListItem>
          )}
        </List>
      </CardContent>
    </Card>
  </Grid>
);