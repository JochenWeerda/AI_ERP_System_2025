import React from 'react';
import { Box, Container, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ChargenBerichte from '../../components/inventory/ChargenBerichte';

/**
 * Page-Komponente für die Chargenberichte
 * Enthält die Breadcrumbs-Navigation und bindet die ChargenBerichte-Komponente ein
 */
const ChargenBerichtePage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 3, mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Start
          </Link>
          <Link
            component={RouterLink}
            to="/chargen"
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <InventoryIcon sx={{ mr: 0.5 }} fontSize="small" />
            Chargen
          </Link>
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary"
          >
            <AssessmentIcon sx={{ mr: 0.5 }} fontSize="small" />
            Berichte
          </Typography>
        </Breadcrumbs>
      </Box>

      <ChargenBerichte />
    </Container>
  );
};

export default ChargenBerichtePage; 