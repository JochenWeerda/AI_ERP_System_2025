import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
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
  Backdrop,
  Alert,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GroupIcon from '@mui/icons-material/Group';
import DescriptionIcon from '@mui/icons-material/Description';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import HistoryIcon from '@mui/icons-material/History';
import Layout from '../components/Layout';
import ModuleLoader from '../components/ModuleLoader';

/**
 * Komponente für die Hauptansicht der Lieferantenliste
 */
const SupplierListView = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Beispieldaten für die Lieferantenliste als Fallback
  const mockSuppliers = [
    {
      id: '1',
      supplier_number: '612300',
      name: 'Hans Eilers',
      name2: 'Tiernahrung-Blecky',
      postal_code: '27777',
      city: 'Ganderkesee',
      is_active: true,
      is_grain_supplier: true
    },
    {
      id: '2',
      supplier_number: '453211',
      name: 'Müller GmbH & Co. KG',
      name2: 'Großhandel',
      postal_code: '28195',
      city: 'Bremen',
      is_active: true,
      is_grain_supplier: false
    },
    {
      id: '3',
      supplier_number: '781234',
      name: 'Futtermittel Schmidt',
      name2: '',
      postal_code: '49661',
      city: 'Cloppenburg',
      is_active: true,
      is_grain_supplier: false
    },
    {
      id: '4',
      supplier_number: '984522',
      name: 'Bio-Hof Petersen',
      name2: 'Direktvermarktung',
      postal_code: '24782',
      city: 'Büdelsdorf',
      is_active: false,
      is_grain_supplier: true
    },
    {
      id: '5',
      supplier_number: '552398',
      name: 'Landmaschinen Krause',
      name2: '',
      postal_code: '26655',
      city: 'Westerstede',
      is_active: true,
      is_grain_supplier: false
    }
  ];

  // Lieferanten vom API laden
  useEffect(() => {
    const loadSuppliers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Versuche die Lieferanten vom API zu laden
        const response = await fetch('/api/v1/lieferantenstamm');
        
        if (response.ok) {
          const data = await response.json();
          setSuppliers(data);
          setFilteredSuppliers(data);
        } else {
          // Bei API-Fehler auf Fallback-Daten zurückgreifen
          console.log('Verwende Beispieldaten wegen API-Fehler:', response.status);
          setSuppliers(mockSuppliers);
          setFilteredSuppliers(mockSuppliers);
          setError(`API-Fehler: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        // Bei Netzwerkfehler auf Fallback-Daten zurückgreifen
        console.error('Fehler beim Laden der Lieferanten:', error);
        setSuppliers(mockSuppliers);
        setFilteredSuppliers(mockSuppliers);
        setError('Verbindungsfehler: Laden der Lieferantendaten nicht möglich');
      } finally {
        setLoading(false);
      }
    };
    
    loadSuppliers();
  }, []);

  // Filtern der Lieferanten basierend auf dem Suchbegriff
  useEffect(() => {
    const results = suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.supplier_number.includes(searchTerm) ||
      supplier.postal_code.includes(searchTerm) ||
      supplier.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSuppliers(results);
    setPage(0);
  }, [searchTerm, suppliers]);

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

  // Neuen Lieferanten anlegen
  const handleCreateSupplier = () => {
    navigate('/lieferanten/neu');
  };

  // Lieferanten bearbeiten
  const handleEditSupplier = (id) => {
    navigate(`/lieferanten/${id}/bearbeiten`);
  };

  // Lieferanten anzeigen
  const handleViewSupplier = (id) => {
    navigate(`/lieferanten/${id}`);
  };

  return (
    <Card>
      <CardHeader 
        title="Lieferantenstammdaten" 
        avatar={<GroupIcon />}
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateSupplier}
          >
            Neuer Lieferant
          </Button>
        }
      />
      <CardContent>
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error} - Beispieldaten werden angezeigt
          </Alert>
        )}

        <TextField
          fullWidth
          margin="normal"
          placeholder="Suchen nach Lieferantennummer, Name, PLZ oder Ort..."
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

        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Lieferanten-Nr.</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>PLZ</TableCell>
                <TableCell>Ort</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Getreidelieferant</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((supplier) => (
                  <TableRow key={supplier.id} hover>
                    <TableCell>{supplier.supplier_number}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body1">{supplier.name}</Typography>
                        {supplier.name2 && (
                          <Typography variant="body2" color="textSecondary">
                            {supplier.name2}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{supplier.postal_code}</TableCell>
                    <TableCell>{supplier.city}</TableCell>
                    <TableCell>
                      <Chip 
                        label={supplier.is_active ? "Aktiv" : "Inaktiv"} 
                        color={supplier.is_active ? "success" : "default"} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {supplier.is_grain_supplier ? (
                        <Chip label="Ja" color="primary" size="small" />
                      ) : (
                        <Chip label="Nein" color="default" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleViewSupplier(supplier.id)}
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton 
                        color="secondary" 
                        onClick={() => handleEditSupplier(supplier.id)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredSuppliers.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      Keine Lieferanten gefunden
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
          count={filteredSuppliers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Zeilen pro Seite:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} von ${count}`}
        />
      </CardContent>
      
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Card>
  );
};

/**
 * SupplierHistoryView - Komponente für die Anzeige der Lieferantenhistorie
 */
const SupplierHistoryView = () => {
  return (
    <Card>
      <CardHeader title="Lieferantenhistorie" avatar={<HistoryIcon />} />
      <CardContent>
        <Typography variant="body1">
          Diese Ansicht zeigt die Historie aller Änderungen an Lieferantendaten.
        </Typography>
        <Box sx={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Funktionalität wird in Kürze implementiert
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * SupplierDocumentsView - Komponente für die Anzeige der Lieferantendokumente
 */
const SupplierDocumentsView = () => {
  return (
    <Card>
      <CardHeader title="Lieferantendokumente" avatar={<DescriptionIcon />} />
      <CardContent>
        <Typography variant="body1">
          Hier werden alle mit Lieferanten verknüpften Dokumente angezeigt.
        </Typography>
        <Box sx={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Funktionalität wird in Kürze implementiert
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * SupplierCatalogView - Komponente für die Anzeige des Lieferantenkatalogs
 */
const SupplierCatalogView = () => {
  return (
    <Card>
      <CardHeader title="Lieferantenkatalog" avatar={<ImportContactsIcon />} />
      <CardContent>
        <Typography variant="body1">
          Katalogverwaltung für Lieferantenprodukte und -dienste.
        </Typography>
        <Box sx={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Funktionalität wird in Kürze implementiert
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * Lieferantenliste Seite mit ModuleLoader
 */
const SupplierListPage = () => {
  const tabs = [
    {
      label: "Stammdaten",
      icon: <GroupIcon />,
      content: <SupplierListView />
    },
    {
      label: "Historie",
      icon: <HistoryIcon />,
      content: <SupplierHistoryView />
    },
    {
      label: "Dokumente",
      icon: <DescriptionIcon />,
      content: <SupplierDocumentsView />
    },
    {
      label: "Katalog",
      icon: <ImportContactsIcon />,
      content: <SupplierCatalogView />
    }
  ];

  const breadcrumbItems = [
    { label: "Einkauf", href: "/einkauf" },
    { label: "Lieferantenstamm" }
  ];

  return (
    <Layout>
      <ModuleLoader 
        title="Lieferantenstamm" 
        tabs={tabs}
        breadcrumbItems={breadcrumbItems}
      />
    </Layout>
  );
};

export default SupplierListPage; 