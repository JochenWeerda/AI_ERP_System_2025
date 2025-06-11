import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Button,
  Menu,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  VisibilityIcon,
  EditIcon,
  DeleteIcon,
  AddIcon,
  SearchIcon,
  FilterListIcon,
  MoreVertIcon,
  RefreshIcon,
  TrendingUpIcon,
  InsightIcon,
  ShippingIcon,
  MoneyIcon
} from '@mui/icons-material';
import OrderDetailsDialog from './OrderDetailsDialog';
import { formatCurrency, formatDate, truncateText } from '../../utils/formatters';
import NewOrderDialog from '../dialogs/NewOrderDialog';
import { useTransactionApi } from '../../microservices/transactions/api';
import { Order } from '../../microservices/transactions/types';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// Temporäre Typen und Daten, später durch API-Aufrufe ersetzen
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

// Mock-Daten für Bestellungen
const mockOrders: Order[] = [
  {
    id: 1,
    order_number: 'BES-2024-001',
    order_date: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 Tage zurück
    order_type: 'sale',
    status: 'completed',
    customer_id: 101,
    customer_name: 'Mustermann GmbH',
    total_amount: 1250.50,
    tax_amount: 200.08,
    discount_amount: 50,
    notes: 'Standardlieferung',
    created_at: Date.now() - 7 * 24 * 60 * 60 * 1000,
    order_lines: [
      {
        id: 1,
        product_id: 1001,
        product_name: 'Hochleistungs-Laptop',
        quantity: 1,
        unit_price: 1299.99,
        discount_percent: 5,
        tax_percent: 19,
        total_price: 1250.50
      }
    ]
  },
  {
    id: 2,
    order_number: 'BES-2024-002',
    order_date: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 Tage zurück
    order_type: 'purchase',
    status: 'processing',
    supplier_id: 201,
    supplier_name: 'TechSupply AG',
    total_amount: 4760.00,
    tax_amount: 760.00,
    discount_amount: 0,
    created_at: Date.now() - 3 * 24 * 60 * 60 * 1000,
    order_lines: [
      {
        id: 2,
        product_id: 2001,
        product_name: 'Netzwerk-Switch',
        quantity: 4,
        unit_price: 1000.00,
        discount_percent: 0,
        tax_percent: 19,
        total_price: 4760.00
      }
    ]
  },
  {
    id: 3,
    order_number: 'BES-2024-003',
    order_date: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 Tag zurück
    order_type: 'sale',
    status: 'pending',
    customer_id: 102,
    customer_name: 'Schmidt KG',
    total_amount: 357.00,
    tax_amount: 57.00,
    discount_amount: 0,
    created_at: Date.now() - 1 * 24 * 60 * 60 * 1000,
    order_lines: [
      {
        id: 3,
        product_id: 3001,
        product_name: 'Büromaterial Set',
        quantity: 3,
        unit_price: 100.00,
        discount_percent: 0,
        tax_percent: 19,
        total_price: 357.00
      }
    ]
  }
];

const OrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [newOrderOpen, setNewOrderOpen] = useState<boolean>(false);
  const [insightsOpen, setInsightsOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const theme = useTheme();

  // Simulierte KI-generierte Einsichten
  const aiInsights = {
    pendingTrend: +12.5,
    weeklyComparison: -3.2,
    topCustomer: 'Technik GmbH',
    aiRecommendation: 'Basierend auf historischen Daten sollten Sie den Lagerbestand für Elektronikprodukte um 15% erhöhen, um die prognostizierte Nachfragesteigerung im nächsten Monat zu decken.'
  };

  // Simulierte Chartdaten
  const chartData = [
    { name: 'Mo', value: 12 },
    { name: 'Di', value: 19 },
    { name: 'Mi', value: 15 },
    { name: 'Do', value: 21 },
    { name: 'Fr', value: 25 },
    { name: 'Sa', value: 18 },
    { name: 'So', value: 14 }
  ];

  const transactionApi = useTransactionApi();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, orders, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await transactionApi.getOrders();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Fehler beim Laden der Bestellungen:', error);
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let result = [...orders];
    
    // Textsuche
    if (searchTerm) {
      result = result.filter(order => 
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.status && order.status.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Statusfilter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    setFilteredOrders(result);
  };

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenNewOrder = () => {
    setNewOrderOpen(true);
  };

  const handleCloseNewOrder = () => {
    setNewOrderOpen(false);
    fetchOrders(); // Aktualisiere die Liste nach dem Hinzufügen
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    handleMenuClose();
  };

  const getStatusChip = (status: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    
    switch(status.toLowerCase()) {
      case 'neu':
        color = 'info';
        break;
      case 'bearbeitung':
        color = 'warning';
        break;
      case 'versandt':
        color = 'primary';
        break;
      case 'abgeschlossen':
        color = 'success';
        break;
      case 'storniert':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status} 
        color={color} 
        size="small"
        sx={{ 
          fontWeight: 'medium',
          borderRadius: '6px',
          '& .MuiChip-label': { px: 1.5 }
        }}
      />
    );
  };

  const toggleInsights = () => {
    setInsightsOpen(!insightsOpen);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Kopfzeile mit Suchfeld und Aktionen */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          mb: 3,
          gap: 2
        }}
      >
        <Typography variant="h5" component="h2" fontWeight="bold" color="primary.main">
          Bestellungsverwaltung
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Bestellungen suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
              sx: { 
                borderRadius: '8px',
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.03),
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.black, 0.05),
                }
              }
            }}
            sx={{ width: { xs: '100%', sm: '240px' } }}
          />
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={handleMenuOpen}
              sx={{ 
                borderRadius: '8px',
                borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.2) : alpha(theme.palette.common.black, 0.1),
                color: 'text.primary',
                textTransform: 'none',
                fontWeight: 'medium'
              }}
            >
              {statusFilter === 'all' ? 'Filter' : `Status: ${statusFilter}`}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{ '& .MuiList-root': { width: 180 } }}
            >
              <MenuItem onClick={() => handleStatusFilterChange('all')}>Alle Status</MenuItem>
              <MenuItem onClick={() => handleStatusFilterChange('neu')}>Neu</MenuItem>
              <MenuItem onClick={() => handleStatusFilterChange('bearbeitung')}>In Bearbeitung</MenuItem>
              <MenuItem onClick={() => handleStatusFilterChange('versandt')}>Versandt</MenuItem>
              <MenuItem onClick={() => handleStatusFilterChange('abgeschlossen')}>Abgeschlossen</MenuItem>
              <MenuItem onClick={() => handleStatusFilterChange('storniert')}>Storniert</MenuItem>
            </Menu>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<InsightIcon />}
            onClick={toggleInsights}
            sx={{ 
              borderRadius: '8px',
              borderColor: insightsOpen ? 'primary.main' : (theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.2) : alpha(theme.palette.common.black, 0.1)),
              color: insightsOpen ? 'primary.main' : 'text.primary',
              textTransform: 'none',
              fontWeight: 'medium'
            }}
          >
            KI-Insights
          </Button>
          
          <Tooltip title="Aktualisieren">
            <IconButton 
              onClick={fetchOrders}
              sx={{ 
                borderRadius: '8px',
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.03),
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenNewOrder}
            sx={{ 
              borderRadius: '8px',
              boxShadow: 'none',
              textTransform: 'none',
              fontWeight: 'medium',
              px: 2
            }}
          >
            Neue Bestellung
          </Button>
        </Box>
      </Box>

      {/* KI-Insights Panel */}
      {insightsOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Card 
            sx={{ 
              mb: 3, 
              borderRadius: '12px',
              border: `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.black, 0.05)}`,
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.light, 0.05),
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    KI-generierte Erkenntnisse
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {aiInsights.aiRecommendation}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Card sx={{ flex: '1 1 auto', minWidth: 120, p: 1.5, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Ausstehende Bestellungen</Typography>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                        {aiInsights.pendingTrend > 0 ? '+' : ''}{aiInsights.pendingTrend}%
                        <TrendingUpIcon 
                          fontSize="small" 
                          sx={{ 
                            ml: 0.5, 
                            color: aiInsights.pendingTrend >= 0 ? 'success.main' : 'error.main',
                            transform: aiInsights.pendingTrend >= 0 ? 'none' : 'rotate(180deg)'
                          }} 
                        />
                      </Typography>
                    </Card>
                    <Card sx={{ flex: '1 1 auto', minWidth: 120, p: 1.5, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Top Kunde</Typography>
                      <Typography variant="h6">{aiInsights.topCustomer}</Typography>
                    </Card>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>Bestellungstrend (letzte 7 Tage)</Typography>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Hauptinhalt - Tabelle */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.black, 0.05)}`,
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Bestellnummer</TableCell>
              <TableCell>Kunde</TableCell>
              <TableCell>Datum</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Betrag</TableCell>
              <TableCell>Lieferadresse</TableCell>
              <TableCell align="center">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Daten werden geladen...</TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Keine Bestellungen gefunden</TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow 
                  key={order.id}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.02),
                      cursor: 'pointer' 
                    },
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => handleOpenDetails(order)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ShippingIcon fontSize="small" sx={{ mr: 1, color: 'primary.main', opacity: 0.8 }} />
                      {order.order_number}
                    </Box>
                  </TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{formatDate(order.order_date)}</TableCell>
                  <TableCell>{getStatusChip(order.status)}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <MoneyIcon fontSize="small" sx={{ mr: 1, color: 'success.main', opacity: 0.7 }} />
                      {formatCurrency(order.total_amount)}
                    </Box>
                  </TableCell>
                  <TableCell>{truncateText(order.notes || '', 30)}</TableCell>
                  <TableCell align="center">
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetails(order);
                      }}
                      sx={{ 
                        borderRadius: '6px',
                        textTransform: 'none',
                        fontWeight: 'medium',
                        minWidth: 'auto',
                        borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.2) : alpha(theme.palette.common.black, 0.1),
                      }}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialoge */}
      {selectedOrder && (
        <OrderDetailsDialog
          open={detailsOpen}
          onClose={handleCloseDetails}
          order={selectedOrder}
        />
      )}

      <NewOrderDialog
        open={newOrderOpen}
        onClose={handleCloseNewOrder}
      />
    </Box>
  );
};

export default OrdersTab; 