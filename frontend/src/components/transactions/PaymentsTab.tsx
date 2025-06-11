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
  Button,
  TextField,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  alpha,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useTransactionApi } from '../../microservices/transactions/api';
import { Payment } from '../../microservices/transactions/types';
import NewPaymentDialog from '../dialogs/NewPaymentDialog';
import PaymentDetailsDialog from '../dialogs/PaymentDetailsDialog';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';

const PaymentsTab: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [newPaymentOpen, setNewPaymentOpen] = useState<boolean>(false);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [insightsOpen, setInsightsOpen] = useState<boolean>(false);
  const theme = useTheme();

  // Simulierte KI-generierte Einsichten
  const aiInsights = {
    topPaymentMethod: 'Kreditkarte',
    recentTrend: +8.3,
    averagePaymentTime: 2.4,
    aiRecommendation: 'Laut Analyse bevorzugen 72% Ihrer Kunden Kreditkartenzahlungen. Erwägen Sie, personalisierte Angebote für Kreditkartenzahler einzuführen, um Konversionsraten zu steigern.'
  };

  // Simulierte Chartdaten für Zahlungsmethoden
  const paymentMethodData = [
    { name: 'Kreditkarte', value: 45 },
    { name: 'Überweisung', value: 28 },
    { name: 'PayPal', value: 20 },
    { name: 'Sonstige', value: 7 }
  ];
  
  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.warning.main];

  const transactionApi = useTransactionApi();

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [searchTerm, payments, paymentMethodFilter, statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await transactionApi.getPayments();
      setPayments(data);
      setLoading(false);
    } catch (error) {
      console.error('Fehler beim Laden der Zahlungen:', error);
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let result = [...payments];
    
    // Textsuche
    if (searchTerm) {
      result = result.filter(payment => 
        payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Zahlungsmethode-Filter
    if (paymentMethodFilter !== 'all') {
      result = result.filter(payment => 
        payment.paymentMethod.toLowerCase() === paymentMethodFilter.toLowerCase()
      );
    }
    
    // Status-Filter
    if (statusFilter !== 'all') {
      result = result.filter(payment => 
        payment.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    setFilteredPayments(result);
  };

  const handleOpenDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedPayment(null);
  };

  const handleOpenNewPayment = () => {
    setNewPaymentOpen(true);
  };

  const handleCloseNewPayment = () => {
    setNewPaymentOpen(false);
    fetchPayments();
  };

  const handlePaymentMethodFilterChange = (event: SelectChangeEvent) => {
    setPaymentMethodFilter(event.target.value);
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

  const toggleInsights = () => {
    setInsightsOpen(!insightsOpen);
  };

  const getStatusChip = (status: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    
    switch(status.toLowerCase()) {
      case 'ausstehend':
        color = 'warning';
        break;
      case 'abgeschlossen':
        color = 'success';
        break;
      case 'fehlgeschlagen':
        color = 'error';
        break;
      case 'rückerstattung':
        color = 'info';
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

  const getPaymentMethodIcon = (method: string) => {
    switch(method.toLowerCase()) {
      case 'kreditkarte':
        return <CreditCardIcon fontSize="small" sx={{ color: 'primary.main' }} />;
      case 'überweisung':
        return <BankIcon fontSize="small" sx={{ color: 'secondary.main' }} />;
      case 'paypal':
        return <PaymentIcon fontSize="small" sx={{ color: 'info.main' }} />;
      default:
        return <MoneyIcon fontSize="small" sx={{ color: 'warning.main' }} />;
    }
  };

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
          Zahlungsverwaltung
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Zahlungen suchen..."
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
          
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: 150, 
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.03),
              }
            }}
          >
            <InputLabel id="payment-method-filter-label">Zahlungsart</InputLabel>
            <Select
              labelId="payment-method-filter-label"
              value={paymentMethodFilter}
              label="Zahlungsart"
              onChange={handlePaymentMethodFilterChange}
            >
              <MenuItem value="all">Alle Methoden</MenuItem>
              <MenuItem value="kreditkarte">Kreditkarte</MenuItem>
              <MenuItem value="überweisung">Überweisung</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
              <MenuItem value="bar">Barzahlung</MenuItem>
            </Select>
          </FormControl>
          
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
              {statusFilter === 'all' ? 'Status' : statusFilter}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleStatusFilterChange('all')}>Alle Status</MenuItem>
              <MenuItem onClick={() => handleStatusFilterChange('ausstehend')}>Ausstehend</MenuItem>
              <MenuItem onClick={() => handleStatusFilterChange('abgeschlossen')}>Abgeschlossen</MenuItem>
              <MenuItem onClick={() => handleStatusFilterChange('fehlgeschlagen')}>Fehlgeschlagen</MenuItem>
              <MenuItem onClick={() => handleStatusFilterChange('rückerstattung')}>Rückerstattung</MenuItem>
            </Menu>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<LightbulbIcon />}
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
              onClick={fetchPayments}
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
            onClick={handleOpenNewPayment}
            sx={{ 
              borderRadius: '8px',
              boxShadow: 'none',
              textTransform: 'none',
              fontWeight: 'medium',
              px: 2
            }}
          >
            Neue Zahlung
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
                <Grid item xs={12} md={7}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <LightbulbIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    KI-generierte Zahlungserkenntnisse
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {aiInsights.aiRecommendation}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Card sx={{ flex: '1 1 auto', minWidth: 120, p: 1.5, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Bevorzugte Zahlungsart</Typography>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                        {aiInsights.topPaymentMethod}
                        {getPaymentMethodIcon(aiInsights.topPaymentMethod)}
                      </Typography>
                    </Card>
                    <Card sx={{ flex: '1 1 auto', minWidth: 120, p: 1.5, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Zahlungstrend</Typography>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                        {aiInsights.recentTrend > 0 ? '+' : ''}{aiInsights.recentTrend}%
                        <TrendingUpIcon 
                          fontSize="small" 
                          sx={{ 
                            ml: 0.5, 
                            color: aiInsights.recentTrend >= 0 ? 'success.main' : 'error.main',
                            transform: aiInsights.recentTrend >= 0 ? 'none' : 'rotate(180deg)'
                          }} 
                        />
                      </Typography>
                    </Card>
                    <Card sx={{ flex: '1 1 auto', minWidth: 120, p: 1.5, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Ø Zahlungsdauer</Typography>
                      <Typography variant="h6">{aiInsights.averagePaymentTime} Tage</Typography>
                    </Card>
                  </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1} sx={{ display: 'flex', alignItems: 'center' }}>
                    <PieChartIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    Verteilung der Zahlungsmethoden
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentMethodData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {paymentMethodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
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
              <TableCell>Zahlungsnummer</TableCell>
              <TableCell>Zahlungsmethode</TableCell>
              <TableCell>Kunde</TableCell>
              <TableCell>Datum</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Betrag</TableCell>
              <TableCell align="center">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Daten werden geladen...</TableCell>
              </TableRow>
            ) : filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Keine Zahlungen gefunden</TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow 
                  key={payment.id}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.02),
                      cursor: 'pointer' 
                    },
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => handleOpenDetails(payment)}
                >
                  <TableCell>{payment.paymentNumber}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getPaymentMethodIcon(payment.paymentMethod)}
                      {payment.paymentMethod}
                    </Box>
                  </TableCell>
                  <TableCell>{payment.customerName}</TableCell>
                  <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                  <TableCell>{getStatusChip(payment.status)}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <MoneyIcon fontSize="small" sx={{ mr: 1, color: 'success.main', opacity: 0.7 }} />
                      {formatCurrency(payment.amount)}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetails(payment);
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
      {selectedPayment && (
        <PaymentDetailsDialog
          open={detailsOpen}
          onClose={handleCloseDetails}
          payment={selectedPayment}
        />
      )}

      <NewPaymentDialog
        open={newPaymentOpen}
        onClose={handleCloseNewPayment}
      />
    </Box>
  );
};

export default PaymentsTab;
