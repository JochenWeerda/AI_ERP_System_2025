import React from 'react';
import { Container, Typography, Paper, Box, Breadcrumbs, Link } from '@mui/material';
import { Home as HomeIcon, AccountBalance as AccountBalanceIcon } from '@mui/icons-material';
import { FinanceDashboard } from '../components/finance';

const FinanzDashboardPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Start
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/finanzen"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <AccountBalanceIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Finanzen
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            Dashboard
          </Typography>
        </Breadcrumbs>

        {/* Main Title */}
        <Typography variant="h4" component="h1" gutterBottom>
          Finanz-Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Finanzielle Kennzahlen und Übersicht des Unternehmens
        </Typography>

        {/* Dashboard Component */}
        <Paper elevation={0} sx={{ mt: 3, p: 0, bgcolor: 'transparent' }}>
          <FinanceDashboard />
        </Paper>
      </Box>
    </Container>
  );
};

export default FinanzDashboardPage; 