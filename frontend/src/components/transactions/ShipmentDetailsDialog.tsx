import React from 'react';
import {
  Box, Typography, Divider, Paper, Grid, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  DialogContent, DialogActions, List, ListItem, ListItemText, Tooltip,
  IconButton, Avatar
} from '@mui/material';
import {
  LocalShipping as LocalShippingIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Shipment } from '../../services/transactionApi';
import { formatDate, formatCurrency } from '../../utils/formatters';
import ShipmentMap from './ShipmentMap';

// Simulierte Tracking-History
const trackingHistory = [
  { date: Date.now() / 1000 - 7 * 24 * 60 * 60, status: 'Bestellung aufgegeben', location: 'Online' },
  { date: Date.now() / 1000 - 6 * 24 * 60 * 60, status: 'Bestellung bestätigt', location: 'Lagerzentrum Berlin' },
  { date: Date.now() / 1000 - 5 * 24 * 60 * 60, status: 'Paket wird vorbereitet', location: 'Lagerzentrum Berlin' },
  { date: Date.now() / 1000 - 3 * 24 * 60 * 60, status: 'Paket wurde verschickt', location: 'Versandzentrum Berlin' },
  { date: Date.now() / 1000 - 2 * 24 * 60 * 60, status: 'Paket im Transportnetzwerk', location: 'Sortierzentrum Frankfurt' },
  { date: Date.now() / 1000 - 1 * 24 * 60 * 60, status: 'Paket in Zustellung', location: 'Zustellbasis München' },
];

// Simulierte Lieferpositionen mit Produktdetails
const generateMockShipmentLines = (shipment: Shipment) => {
  if (shipment.shipment_lines && shipment.shipment_lines.length > 0) {
    return shipment.shipment_lines;
  }
  
  // Simulierte Produktdaten
  const mockProducts = [
    { id: 1, name: 'Smartphone XYZ', sku: 'SKU001', price: 799.99 },
    { id: 2, name: 'Laptop ABC', sku: 'SKU002', price: 1299.99 },
    { id: 3, name: 'Kopfhörer Model H', sku: 'SKU003', price: 199.99 },
    { id: 4, name: 'Smartwatch Series 5', sku: 'SKU004', price: 349.99 },
    { id: 5, name: 'Tablet Pro 12', sku: 'SKU005', price: 599.99 },
  ];
  
  return Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => {
    const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    return {
      id: i + 1,
      shipment_id: shipment.id,
      product_id: randomProduct.id,
      quantity: Math.floor(Math.random() * 5) + 1,
      line_number: i + 1,
      product: randomProduct
    };
  });
};

interface ShipmentDetailsDialogProps {
  shipment: Shipment;
  onClose: () => void;
}

const ShipmentDetailsDialog: React.FC<ShipmentDetailsDialogProps> = ({ shipment, onClose }) => {
  const theme = useTheme();
  const shipmentLines = generateMockShipmentLines(shipment);
  
  // Status-Farben für die UI
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Vorbereitung': return theme.palette.info.main;
      case 'Unterwegs': return theme.palette.warning.main;
      case 'Ausgeliefert': return theme.palette.success.main;
      case 'Verspätet': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };
  
  return (
    <>
      <DialogContent dividers>
        <Box>
          {/* Header mit Status und Aktionen */}
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={3}
            sx={{
              borderRadius: 2,
              p: 2,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                <LocalShippingIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  Lieferung {shipment.shipment_number}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Erstellt am {formatDate(shipment.created_at)}
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={shipment.status || 'Status unbekannt'} 
              sx={{ 
                bgcolor: getStatusColor(shipment.status || ''),
                color: 'white',
                fontWeight: 'bold',
                pl: 1,
                pr: 1
              }}
            />
          </Box>

          {/* Grundlegende Informationen */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  height: '100%',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Lieferungsdetails
                </Typography>
                
                <Grid container spacing={2} mt={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Spediteur</Typography>
                    <Typography variant="body1">{shipment.carrier || 'Nicht angegeben'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Sendungsnummer</Typography>
                    <Typography variant="body1">{shipment.tracking_number || 'Nicht verfügbar'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Versanddatum</Typography>
                    <Typography variant="body1">{formatDate(shipment.shipment_date)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Voraussichtliche Ankunft</Typography>
                    <Typography variant="body1">
                      {shipment.estimated_delivery ? formatDate(shipment.estimated_delivery) : 'Nicht verfügbar'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Bestellnummer</Typography>
                    <Typography variant="body1">
                      {shipment.order ? shipment.order.order_number : `ORD-${shipment.order_id}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Versandkosten</Typography>
                    <Typography variant="body1">{formatCurrency(shipment.shipping_cost)}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  height: '100%',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Lieferziel
                </Typography>
                
                <Box mt={1} display="flex" alignItems="flex-start">
                  <LocationOnIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                  <Box>
                    <Typography variant="body1">
                      {shipment.destination || 'Zieladresse nicht verfügbar'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                      Lieferdetails: {shipment.notes || 'Keine zusätzlichen Details verfügbar'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box mt={3} height={150} borderRadius={1} overflow="hidden" border={`1px solid ${theme.palette.divider}`}>
                  {/* Karte für die Lieferungsverfolgung */}
                  <ShipmentMap shipments={[shipment]} singleMode />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Tracking-Verlauf */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 4,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Sendungsverlauf
            </Typography>
            
            <Box
              sx={{
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: '28px',
                  top: '16px',
                  bottom: '16px',
                  width: '2px',
                  bgcolor: theme.palette.divider
                }
              }}
            >
              {trackingHistory.map((event, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    mb: index === trackingHistory.length - 1 ? 0 : 2,
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      bgcolor: index === trackingHistory.length - 1 ? theme.palette.primary.main : theme.palette.text.secondary,
                      border: `2px solid ${theme.palette.background.paper}`,
                      mr: 2,
                      mt: 1.5,
                      zIndex: 1
                    }}
                  />
                  <Box flex={1}>
                    <Typography variant="body2" color="textSecondary">
                      {formatDate(event.date)}
                    </Typography>
                    <Typography variant="body1" fontWeight={index === trackingHistory.length - 1 ? 'bold' : 'normal'}>
                      {event.status}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {event.location}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Lieferpositionen */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Lieferpositionen
            </Typography>
            
            <TableContainer sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Pos.</TableCell>
                    <TableCell>Produkt</TableCell>
                    <TableCell align="right">Menge</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shipmentLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.line_number}</TableCell>
                      <TableCell>
                        {line.product ? line.product.name : `Produkt ID: ${line.product_id}`}
                        {line.product && (
                          <Typography variant="caption" display="block" color="textSecondary">
                            SKU: {line.product.sku}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">{line.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Box>
          <Tooltip title="Drucken">
            <IconButton color="primary" size="small" sx={{ mr: 1 }}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Teilen">
            <IconButton color="primary" size="small">
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box>
          <Button variant="outlined" color="primary" startIcon={<EditIcon />} sx={{ mr: 1 }}>
            Bearbeiten
          </Button>
          <Button variant="contained" onClick={onClose}>
            Schließen
          </Button>
        </Box>
      </DialogActions>
    </>
  );
};

export default ShipmentDetailsDialog; 