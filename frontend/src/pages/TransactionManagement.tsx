import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Container,
  Tabs,
  Tab,
  Button,
  Grid
} from '@mui/material';
import OrdersTab from '../components/transactions/OrdersTab';
import PaymentsTab from '../components/transactions/PaymentsTab';
import ShipmentsTab from '../components/transactions/ShipmentsTab';
import AddIcon from '@mui/icons-material/Add';
import NewOrderDialog from '../components/transactions/NewOrderDialog';
import NewPaymentDialog from '../components/transactions/NewPaymentDialog';
import NewShipmentDialog from '../components/transactions/NewShipmentDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`transactions-tabpanel-${index}`}
      aria-labelledby={`transactions-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `transactions-tab-${index}`,
    'aria-controls': `transactions-tabpanel-${index}`,
  };
};

const TransactionManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openNewOrder, setOpenNewOrder] = useState(false);
  const [openNewPayment, setOpenNewPayment] = useState(false);
  const [openNewShipment, setOpenNewShipment] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getAddButtonText = () => {
    switch(tabValue) {
      case 0:
        return 'Neue Bestellung';
      case 1:
        return 'Neue Zahlung';
      case 2:
        return 'Neue Lieferung';
      default:
        return 'Neu erstellen';
    }
  };

  const handleAddClick = () => {
    switch(tabValue) {
      case 0:
        setOpenNewOrder(true);
        break;
      case 1:
        setOpenNewPayment(true);
        break;
      case 2:
        setOpenNewShipment(true);
        break;
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 4, mb: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Grid item>
            <Typography variant="h4" component="h1">
              Transaktionsverwaltung
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              {getAddButtonText()}
            </Button>
          </Grid>
        </Grid>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="Transaktionen Tabs"
            variant="fullWidth"
          >
            <Tab label="Bestellungen" {...a11yProps(0)} />
            <Tab label="Zahlungen" {...a11yProps(1)} />
            <Tab label="Lieferungen" {...a11yProps(2)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <OrdersTab />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <PaymentsTab />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <ShipmentsTab />
        </TabPanel>
      </Paper>

      {/* Dialoge für neue Einträge */}
      <NewOrderDialog open={openNewOrder} onClose={() => setOpenNewOrder(false)} />
      <NewPaymentDialog open={openNewPayment} onClose={() => setOpenNewPayment(false)} />
      <NewShipmentDialog open={openNewShipment} onClose={() => setOpenNewShipment(false)} />
    </Container>
  );
};

export default TransactionManagement; 