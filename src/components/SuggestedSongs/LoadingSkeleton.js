import React from 'react';
import { Box, Skeleton, LinearProgress } from '@mui/material';

const LoadingSkeleton = ({ viewMode = 'grid' }) => (
  <Box sx={{ 
    flexGrow: 1, 
    backgroundColor: '#1a1a1a', 
    minHeight: '100vh',
  }}>
    <LinearProgress sx={{ bgcolor: '#252525', '& .MuiLinearProgress-bar': { bgcolor: '#fff' } }} />
    <Box sx={{ p: 4 }}>
      {/* Header Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2, bgcolor: '#252525' }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width={200} height={40} sx={{ bgcolor: '#252525' }} />
          <Skeleton variant="text" width={300} height={20} sx={{ bgcolor: '#252525' }} />
        </Box>
        <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 2, bgcolor: '#252525' }} />
      </Box>

      {/* Tabs Skeleton */}
      <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, py: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="text" width={100} height={32} sx={{ bgcolor: '#252525' }} />
          ))}
        </Box>
      </Box>

      {/* Filter Bar Skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Skeleton variant="rounded" width={280} height={40} sx={{ borderRadius: 2, bgcolor: '#252525' }} />
        <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: 4, bgcolor: '#252525' }} />
        <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: 4, bgcolor: '#252525' }} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="rounded" width={100} height={36} sx={{ borderRadius: 2, bgcolor: '#252525' }} />
      </Box>

      {viewMode === 'grid' ? (
        /* Grid Skeleton */
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 2 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Box
              key={i}
              sx={{
                backgroundColor: '#252525',
                borderRadius: 2,
                p: 2.5,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Skeleton variant="text" width="80%" height={28} sx={{ bgcolor: '#333', mb: 1 }} />
              <Skeleton variant="text" width="40%" height={20} sx={{ bgcolor: '#333', mb: 2 }} />
              <Skeleton variant="text" width="100%" height={16} sx={{ bgcolor: '#333' }} />
              <Skeleton variant="text" width="100%" height={16} sx={{ bgcolor: '#333' }} />
              <Skeleton variant="text" width="60%" height={16} sx={{ bgcolor: '#333', mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: 2, bgcolor: '#333' }} />
                <Skeleton variant="rounded" width={40} height={32} sx={{ borderRadius: 2, bgcolor: '#333' }} />
                <Skeleton variant="rounded" width={40} height={32} sx={{ borderRadius: 2, bgcolor: '#333' }} />
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        /* List Skeleton */
        <Box sx={{ backgroundColor: '#252525', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          {/* Table Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2, 
            backgroundColor: '#2a2a2a',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Skeleton variant="text" width={200} height={20} sx={{ bgcolor: '#333', flex: 2 }} />
            <Skeleton variant="text" width={100} height={20} sx={{ bgcolor: '#333', flex: 1 }} />
            <Skeleton variant="text" width={100} height={20} sx={{ bgcolor: '#333', flex: 1 }} />
            <Skeleton variant="text" width={150} height={20} sx={{ bgcolor: '#333', flex: 1 }} />
          </Box>
          
          {/* Table Rows */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Box 
              key={i}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Box sx={{ flex: 2, pr: 2 }}>
                <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: '#333', mb: 0.5 }} />
                <Skeleton variant="text" width="60%" height={14} sx={{ bgcolor: '#333' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="70%" height={16} sx={{ bgcolor: '#333' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={16} sx={{ bgcolor: '#333' }} />
              </Box>
              <Box sx={{ flex: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Skeleton variant="rounded" width={60} height={28} sx={{ borderRadius: 2, bgcolor: '#333' }} />
                <Skeleton variant="rounded" width={32} height={28} sx={{ borderRadius: 2, bgcolor: '#333' }} />
                <Skeleton variant="rounded" width={32} height={28} sx={{ borderRadius: 2, bgcolor: '#333' }} />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  </Box>
);

export default LoadingSkeleton;
