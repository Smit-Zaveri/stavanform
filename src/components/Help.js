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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Help = () => (
  <Box p={3}>
    <Typography variant="h4" gutterBottom color="primary">
      Help Center
    </Typography>
    
    <Box sx={{ maxWidth: 800, margin: "0 auto" }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Getting Started</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography paragraph>
            Welcome to our Jain Stavans application! This platform helps you manage and access various Jain religious songs, bhajans, and stavans.
          </Typography>
          <Typography paragraph>
            To begin using the application:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="1. Navigate through songs" 
                secondary="Use the sidebar menu to access different categories of songs including lyrics and collections"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="2. Search functionality" 
                secondary="Use the search bar to find specific songs by title, lyrics, or tags"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="3. Customize your experience" 
                secondary="Visit Settings to adjust theme and display preferences"
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Managing Songs</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Adding New Songs
          </Typography>
          <Typography paragraph>
            To add a new song:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="1. Click the 'Add New Song' button"
                secondary="Found in the song list view"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="2. Fill in the song details"
                secondary="Include title, lyrics, tags, and any additional information"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="3. Add tags"
                secondary="Tag your songs for better organization and searchability"
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Collections & Categories</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography paragraph>
            The application organizes content into several categories:
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Lyrics" 
                secondary="Main collection of stavans and bhajans"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Tirth" 
                secondary="Information about Jain holy places"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Tirtankar" 
                secondary="Songs dedicated to Tirtankars"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Collections" 
                secondary="Custom groupings of related songs"
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Additional Features</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            <ListItem>
              <ListItemText 
                primary="Dark Mode" 
                secondary="Toggle between light and dark themes in Settings"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Suggested Songs" 
                secondary="Discover new songs based on your interests"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Profile Management" 
                secondary="Update your profile information and preferences"
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      <Box mt={4}>
        <Typography variant="body2" color="textSecondary" align="center">
          If you need additional assistance, please contact the administrator.
        </Typography>
      </Box>
    </Box>
  </Box>
);

export default Help;
