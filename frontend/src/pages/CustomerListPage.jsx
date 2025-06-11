import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Backdrop
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Layout from '../components/Layout';

/**
 * Kundenliste-Seite mit Suchfunktion und Pagination
 */
const CustomerListPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Mock-Daten für die Entwicklung und Fallback
  const mockCustomers = [
    {
      id: '1',
      customer_number: '10001',
      name: 'Mustermann GmbH',
      contact_person: 'Max Mustermann',
      postal_code: '28195',
      city: 'Bremen',
      status: 'active',
      customer_type: 'B2B'
    },
    {
      id: '2',
      customer_number: '10002',
      name: 'Schulze & Co. KG',
      contact_person: 'Sabine Schulze',
      postal_code: '20095',
      city: 'Hamburg',
      status: 'active',
      customer_type: 'B2B'
    },
    {
      id: '3',
      customer_number: '10003',
      name: 'Schmidt Einzelhandel',
      contact_person: 'Klaus Schmidt',
      postal_code: '30159',
      city: 'Hannover',
      status: 'inactive',
      customer_type: 'B2B'
    },
    {
      id: '4',
      customer_number: '10004',
      name: 'Verbraucher, Anna',
      contact_person: 'Anna Verbraucher',
      postal_code: '28307',
      city: 'Bremen',
      status: 'active',
      customer_type: 'B2C'
    },
    {
      id: '5',
      customer_number: '10005',
      name: 'Meyer, Heinrich',
      contact_person: 'Heinrich Meyer',
      postal_code: '26123',
      city: 'Oldenburg',
      status: 'active',
      customer_type: 'B2C'
    }
  ];

  // Kunden laden
  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      try {
        // Versuche, Daten vom API-Endpunkt zu laden
        const response = await fetch('/api/v1/kundenstamm');
        
        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
          setFilteredCustomers(data);
        } else {
          // Bei Fehlern die Beispieldaten verwenden
          console.log('Verwende Beispieldaten für Kunden wegen API-Fehler');
          setCustomers(mockCustomers);
          setFilteredCustomers(mockCustomers);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Kundendaten:', error);
        // Bei Fehlern die Beispieldaten verwenden
        console.log('Verwende Beispieldaten für Kunden');
        setCustomers(mockCustomers);
        setFilteredCustomers(mockCustomers);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // Filtern der Kunden basierend auf dem Suchbegriff
  useEffect(() => {
    const results = customers.filter(customer => 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_number?.includes(searchTerm) ||
      customer.postal_code?.includes(searchTerm) ||
      customer.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(results);
    setPage(0);
  }, [searchTerm, customers]);

  // Seitenänderung
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Änderung der Zeilen pro Seite
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Suchbegriff-Änderung
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Neuen Kunden anlegen
  const handleCreateCustomer = () => {
    navigate('/kunden/neu');
  };

  // Kunden bearbeiten
  const handleEditCustomer = (id) => {
    navigate(`/kunden/${id}/bearbeiten`);
  };

  // Kunden anzeigen
  const handleViewCustomer = (id) => {
    navigate(`/kunden/${id}`);
  };

  return (
    <Layout>
      <Box sx={{ p: 3, maxWidth: '100%' }}>
        <Paper sx={{ p: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Kundenstammdaten</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateCustomer}
            >
              Neuer Kunde
            </Button>
          </Box>

          <TextField
            fullWidth
            margin="normal"
            placeholder="Suchen nach Kundennummer, Name, PLZ oder Ort..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ mb: 3 }}
          />

          <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Kunden-Nr.</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Ansprechpartner</TableCell>
                  <TableCell>PLZ</TableCell>
                  <TableCell>Ort</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell align="right">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell>{customer.customer_number}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.contact_person}</TableCell>
                      <TableCell>{customer.postal_code}</TableCell>
                      <TableCell>{customer.city}</TableCell>
                      <TableCell>
                        <Chip 
                          label={customer.status === 'active' ? "Aktiv" : "Inaktiv"} 
                          color={customer.status === 'active' ? "success" : "default"} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={customer.customer_type} 
                          color={customer.customer_type === 'B2B' ? "primary" : "info"} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleViewCustomer(customer.id)}
                          size="small"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          color="secondary" 
                          onClick={() => handleEditCustomer(customer.id)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredCustomers.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        Keine Kunden gefunden
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredCustomers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Zeilen pro Seite:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} von ${count}`}
          />
        </Paper>
      </Box>
      
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Layout>
  );
};

export default CustomerListPage; 