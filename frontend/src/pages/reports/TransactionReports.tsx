import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import deLocale from 'date-fns/locale/de';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getTransactionReport, getTransactionAnalytics } from '../../microservices/transactions/api';
import { formatCurrency } from '../../utils/formatters';

// Farben für die Diagramme
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const TransactionReports: React.FC = () => {
  // Filterzustand
  const [reportType, setReportType] = useState('sales');
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  // Datenzustand
  const [summaryData, setSummaryData] = useState<any>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lade Daten beim ersten Rendering und wenn sich Filter ändern
  useEffect(() => {
    fetchReportData();
  }, [reportType, period]);

  const fetchReportData = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      // Parameter vorbereiten
      const params = {
        type: reportType,
        period: period,
        from_date: startDate.toISOString().split('T')[0],
        to_date: endDate.toISOString().split('T')[0]
      };

      // Zusammenfassungsdaten abrufen
      const summary = await getTransactionReport(params);
      setSummaryData(summary);

      // Zeitreihendaten abrufen
      const timeSeries = await getTransactionAnalytics('time_series', params);
      setTimeSeriesData(timeSeries);

      // Verteilungsdaten abrufen
      const distribution = await getTransactionAnalytics('distribution', params);
      setDistributionData(distribution);
    } catch (err) {
      console.error('Fehler beim Laden der Berichtsdaten:', err);
      setError('Die Berichtsdaten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Mock-Daten für die Entwicklung
  const mockSummaryData = {
    total_orders: 125,
    total_sales: 45678.90,
    total_purchases: 32456.78,
    average_order_value: 365.43,
    order_count_change: 12.5, // Prozentuale Änderung im Vergleich zum Vorperiode
    sales_change: 8.3 // Prozentuale Änderung im Vergleich zum Vorperiode
  };

  const mockTimeSeriesData = [
    { date: '2023-01', sales: 5000, purchases: 4200 },
    { date: '2023-02', sales: 5500, purchases: 4100 },
    { date: '2023-03', sales: 4800, purchases: 3900 },
    { date: '2023-04', sales: 6000, purchases: 4500 },
    { date: '2023-05', sales: 6200, purchases: 4300 },
    { date: '2023-06', sales: 5800, purchases: 4000 }
  ];

  const mockDistributionData = [
    { name: 'Elektronik', value: 30 },
    { name: 'Möbel', value: 20 },
    { name: 'Kleidung', value: 15 },
    { name: 'Lebensmittel', value: 25 },
    { name: 'Sonstiges', value: 10 }
  ];

  // Verwende Mock-Daten für die Entwicklung, wenn keine echten Daten vorhanden sind
  const summary = summaryData || mockSummaryData;
  const timeSeries = timeSeriesData.length > 0 ? timeSeriesData : mockTimeSeriesData;
  const distribution = distributionData.length > 0 ? distributionData : mockDistributionData;

  const handleApplyFilter = () => {
    fetchReportData();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={deLocale}>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Transaktionsberichte und Analysen
        </Typography>

        {/* Filterbereich */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="report-type-label">Berichtstyp</InputLabel>
                <Select
                  labelId="report-type-label"
                  value={reportType}
                  label="Berichtstyp"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="sales">Verkäufe</MenuItem>
                  <MenuItem value="purchases">Einkäufe</MenuItem>
                  <MenuItem value="all">Alle Transaktionen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="period-label">Zeitraum</InputLabel>
                <Select
                  labelId="period-label"
                  value={period}
                  label="Zeitraum"
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <MenuItem value="day">Täglich</MenuItem>
                  <MenuItem value="week">Wöchentlich</MenuItem>
                  <MenuItem value="month">Monatlich</MenuItem>
                  <MenuItem value="quarter">Quartalsweise</MenuItem>
                  <MenuItem value="year">Jährlich</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Von"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Bis"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleApplyFilter}
                disabled={loading || !startDate || !endDate}
              >
                Anwenden
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Fehlermeldung */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Ladeindikator */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Zusammenfassungskarten */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Anzahl Bestellungen
                    </Typography>
                    <Typography variant="h4">
                      {summary.total_orders}
                    </Typography>
                    <Typography variant="body2" color={summary.order_count_change >= 0 ? 'success.main' : 'error.main'}>
                      {summary.order_count_change >= 0 ? '+' : ''}{summary.order_count_change}% ggü. Vorperiode
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Gesamtumsatz
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(summary.total_sales)}
                    </Typography>
                    <Typography variant="body2" color={summary.sales_change >= 0 ? 'success.main' : 'error.main'}>
                      {summary.sales_change >= 0 ? '+' : ''}{summary.sales_change}% ggü. Vorperiode
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Gesamteinkäufe
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(summary.total_purchases)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Durchschnittlicher Bestellwert
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(summary.average_order_value)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Zeitleistendiagramm */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Transaktionsverlauf
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={timeSeries}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" name="Verkäufe" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="purchases" name="Einkäufe" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            {/* Verteilungsdiagramme */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Verteilung nach Kategorie
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={distribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Top-Produkte nach Umsatz
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={distribution}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="value" fill="#8884d8">
                        {distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default TransactionReports; 