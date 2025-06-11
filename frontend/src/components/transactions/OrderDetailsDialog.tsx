import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box
} from '@mui/material';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

// Typen aus OrdersTab übernehmen (später in separate Typendatei auslagern)
type OrderStatus = 'draft' | 'pending' | 'processing' | 'completed' | 'cancelled';
type OrderType = 'sale' | 'purchase';

interface OrderLine {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_percent: number;
  total_price: number;
}

interface Order {
  id: number;
  order_number: string;
  order_date: number; // Unix timestamp
  order_type: OrderType;
  status: OrderStatus;
  customer_id?: number;
  customer_name?: string;
  supplier_id?: number;
  supplier_name?: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  notes?: string;
  created_at: number; // Unix timestamp
  order_lines: OrderLine[];
}

// Statusfarben für Chip-Komponenten
const statusColors: Record<OrderStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  draft: 'default',
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  cancelled: 'error'
};

// Statusbeschreibungen auf Deutsch
const statusLabels: Record<OrderStatus, string> = {
  draft: 'Entwurf',
  pending: 'Ausstehend',
  processing: 'In Bearbeitung',
  completed: 'Abgeschlossen',
  cancelled: 'Storniert'
};

interface OrderDetailsDialogProps {
  open: boolean;
  order: Order;
  onClose: () => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  open,
  order,
  onClose
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">
          Bestelldetails: {order.order_number}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Kopfdaten der Bestellung */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Allgemeine Informationen</Typography>
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Bestellnummer:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{order.order_number}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Bestelldatum:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{formatDateTime(order.order_date)}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Bestelltyp:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{order.order_type === 'sale' ? 'Verkauf' : 'Einkauf'}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Status:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Chip 
                    label={statusLabels[order.status]} 
                    color={statusColors[order.status]} 
                    size="small" 
                  />
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Erstellt am:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{formatDateTime(order.created_at)}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          
          {/* Kunden- oder Lieferantendaten */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">
              {order.order_type === 'sale' ? 'Kundendaten' : 'Lieferantendaten'}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Name:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{order.customer_name || order.supplier_name}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">ID:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">#{order.customer_id || order.supplier_id}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          
          {/* Bestellpositionen */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Bestellpositionen</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Produkt</TableCell>
                    <TableCell align="right">Menge</TableCell>
                    <TableCell align="right">Einzelpreis</TableCell>
                    <TableCell align="right">Rabatt (%)</TableCell>
                    <TableCell align="right">MwSt. (%)</TableCell>
                    <TableCell align="right">Gesamtpreis</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.order_lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.product_name}</TableCell>
                      <TableCell align="right">{line.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(line.unit_price)}</TableCell>
                      <TableCell align="right">{line.discount_percent}%</TableCell>
                      <TableCell align="right">{line.tax_percent}%</TableCell>
                      <TableCell align="right">{formatCurrency(line.total_price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          {/* Summenbereich */}
          <Grid item xs={12}>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Grid container spacing={1} sx={{ maxWidth: 300 }}>
                <Grid item xs={8}>
                  <Typography variant="body2">Zwischensumme:</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">
                    {formatCurrency(order.total_amount - order.tax_amount + order.discount_amount)}
                  </Typography>
                </Grid>
                
                {order.discount_amount > 0 && (
                  <>
                    <Grid item xs={8}>
                      <Typography variant="body2">Rabatt:</Typography>
                    </Grid>
                    <Grid item xs={4} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2">
                        -{formatCurrency(order.discount_amount)}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                <Grid item xs={8}>
                  <Typography variant="body2">MwSt.:</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">
                    {formatCurrency(order.tax_amount)}
                  </Typography>
                </Grid>
                
                <Grid item xs={8}>
                  <Typography variant="body1" fontWeight="bold">Gesamtbetrag:</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(order.total_amount)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          
          {/* Notizen */}
          {order.notes && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Notizen</Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2">{order.notes}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Schließen</Button>
        <Button variant="contained" color="primary">Bearbeiten</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsDialog; 