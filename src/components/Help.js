// src/components/Help.js
import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Paper,
  Fade,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Help = () => (
  <Fade in timeout={500}>
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      px: { xs: 2, sm: 3, md: 4 },
      py: 4,
    }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600, mb: 0.5 }}>
          Help Center
        </Typography>
        <Typography variant="body2" sx={{ color: '#999' }}>
          Find answers to common questions and learn how to use the app
        </Typography>
      </Box>
      
      <Box sx={{ maxWidth: 900, margin: "0 auto" }}>
        <Paper sx={{ bgcolor: '#252525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
          <Accordion sx={{ bgcolor: '#252525', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', '&:last-child': { borderBottom: 'none' } }}>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
              sx={{ 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                py: 1
              }}
            >
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 500 }}>Getting Started</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: '#1a1a1a' }}>
              <Typography paragraph sx={{ color: '#ccc' }}>
                Welcome to the Lyrics application! This platform helps you manage and access various Jain religious songs, bhajans, and stavans.
              </Typography>
              <Typography paragraph sx={{ color: '#ccc' }}>
                To begin using the application:
              </Typography>
              <List>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={<Typography sx={{ color: '#fff', fontWeight: 500 }}>1. Navigate through songs</Typography>}
                    secondary={<Typography sx={{ color: '#999' }}>Use the sidebar menu to access different categories of songs including lyrics and collections</Typography>}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={<Typography sx={{ color: '#fff', fontWeight: 500 }}>2. Search functionality</Typography>}
                    secondary={<Typography sx={{ color: '#999' }}>Use the search bar to find specific songs by title, lyrics, or tags</Typography>}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={<Typography sx={{ color: '#fff', fontWeight: 500 }}>3. Profile Management</Typography>}
                    secondary={<Typography sx={{ color: '#999' }}>Access your profile from the top menu to update your information</Typography>}
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ bgcolor: '#252525', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', '&:last-child': { borderBottom: 'none' } }}>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
              sx={{ 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                py: 1
              }}
            >
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 500 }}>Managing Songs</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: '#1a1a1a' }}>
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                Adding New Songs
              </Typography>
              <Typography paragraph sx={{ color: '#ccc' }}>
                To add a new song:
              </Typography>
              <List>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={<Typography sx={{ color: '#fff', fontWeight: 500 }}>1. Click the 'Add New Song' button</Typography>}
                    secondary={<Typography sx={{ color: '#999' }}>Found in the song list view</Typography>}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={<Typography sx={{ color: '#fff', fontWeight: 500 }}>2. Fill in the song details</Typography>}
                    secondary={<Typography sx={{ color: '#999' }}>Include title, lyrics, tags, and any additional information</Typography>}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={<Typography sx={{ color: '#fff', fontWeight: 500 }}>3. Add tags</Typography>}
                    secondary={<Typography sx={{ color: '#999' }}>Tag your songs for better organization and searchability</Typography>}
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ bgcolor: '#252525', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', '&:last-child': { borderBottom: 'none' } }}>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
              sx={{ 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                py: 1
              }}
            >
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 500 }}>Collections & Categories</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: '#1a1a1a' }}>
              <Typography paragraph sx={{ color: '#ccc' }}>
                The application organizes content into several categories:
              </Typography>
              <List>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={<Typography sx={{ color: '#fff', fontWeight: 500 }}>Lyrics</Typography>}
                    secondary={<Typography sx={{ color: '#999' }}>Main collection of stavans and bhajans</Typography>}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={<Typography sx={{ color: '#fff', fontWeight: 500 }}>Tirth</Typography>}
                    secondary={<Typography sx={{ color: '#999' }}>Information about Jain holy places</Typography>}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={<Typography sx={{ color: '#fff', fontWeight: 500 }}>Tirtankar</Typography>}
                    secondary={<Typography sx={{ color: '#999' }}>Songs dedicated to Tirtankars</Typography>}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={<Typography sx={{ color: '#fff', fontWeight: 500 }}>Collections</Typography>}
                    secondary={<Typography sx={{ color: '#999' }}>Custom groupings of related songs</Typography>}
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ bgcolor: '#252525', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', '&:last-child': { borderBottom: 'none' } }}>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
              sx={{ 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                py: 1
              }}
            >
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 500 }}>Additional Features</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: '#1a1a1a' }}>
              <List>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={<Typography sx={{ color: '#fff', fontWeight: 500 }}>Dark Mode</Typography>}
                    secondary={<Typography sx={{ color: '#999' }}>The application uses dark theme by default for comfortable viewing</Typography>}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={<Typography sx={{ color: '#fff', fontWeight: 500 }}>Suggested Songs</Typography>}
                    secondary={<Typography sx={{ color: '#999' }}>Discover new songs based on your interests</Typography>}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={<Typography sx={{ color: '#fff', fontWeight: 500 }}>Profile Management</Typography>}
                    secondary={<Typography sx={{ color: '#999' }}>Update your profile information and preferences</Typography>}
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </Paper>

        <Box mt={4} textAlign="center">
          <Typography variant="body2" sx={{ color: '#666' }}>
            If you need additional assistance, please contact the administrator.
          </Typography>
        </Box>
      </Box>
    </Box>
  </Fade>
);

export default Help;
