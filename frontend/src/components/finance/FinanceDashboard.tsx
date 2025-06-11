import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  Skeleton,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  ReceiptLong as ReceiptLongIcon,
  Euro as EuroIcon,
  Refresh as RefreshIcon,
  InfoOutlined as InfoOutlinedIcon
} from '@mui/icons-material';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip as ChartTooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Chart.js Registrierung
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// Definiere Typen für Finanzdaten
interface FinancialKPI {
  title: string;
  value: number;
  previousValue: number;
  currency?: boolean;
  icon: React.ReactNode;
  tooltip: string;
}

interface FinancialData {
  kpis: FinancialKPI[];
  monthlyRevenue: {
    labels: string[];
    data: number[];
  };
  expenseDistribution: {
    labels: string[];
    data: number[];
  };
  cashFlow: {
    labels: string[];
    inflow: number[];
    outflow: number[];
  };
}

const FinanceDashboard: React.FC = () => {
  const theme = useTheme();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getPercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const fetchFinancialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In einer realen App würde hier ein API-Aufruf stehen
      // Für Demozwecke verwenden wir Beispieldaten
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: FinancialData = {
        kpis: [
          {
            title: 'Umsatz (MTD)',
            value: 78500,
            previousValue: 75200,
            currency: true,
            icon: <EuroIcon color="primary" />,
            tooltip: 'Umsatz seit Monatsbeginn'
          },
          {
            title: 'Offene Forderungen',
            value: 32450,
            previousValue: 28700,
            currency: true,
            icon: <ReceiptLongIcon color="warning" />,
            tooltip: 'Summe aller offenen Kundenrechnungen'
          },
          {
            title: 'Liquide Mittel',
            value: 124800,
            previousValue: 118500,
            currency: true,
            icon: <AccountBalanceIcon color="info" />,
            tooltip: 'Verfügbare Barmittel und Bankguthaben'
          },
          {
            title: 'Anzahl Buchungen',
            value: 457,
            previousValue: 423,
            currency: false,
            icon: <ReceiptLongIcon color="secondary" />,
            tooltip: 'Anzahl der Buchungen im laufenden Monat'
          }
        ],
        monthlyRevenue: {
          labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
          data: [65000, 59000, 80000, 81000, 56000, 85000, 78500, 0, 0, 0, 0, 0]
        },
        expenseDistribution: {
          labels: ['Personal', 'Material', 'Miete', 'Marketing', 'IT', 'Sonstige'],
          data: [38, 25, 12, 10, 8, 7]
        },
        cashFlow: {
          labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul'],
          inflow: [72000, 68000, 92000, 89000, 76000, 93000, 84000],
          outflow: [65000, 61000, 74000, 79000, 68000, 81000, 76000]
        }
      };
      
      setFinancialData(mockData);
    } catch (err) {
      console.error('Fehler beim Laden der Finanzdaten:', err);
      setError('Die Finanzdaten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const handleRefresh = () => {
    fetchFinancialData();
  };

  // Chart-Konfigurationen
  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return formatCurrency(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value).replace('€', '') + ' €';
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  const expenseChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  const cashFlowChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return formatCurrency(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value).replace('€', '') + ' €';
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Finanz-Dashboard
        </Typography>
        <Tooltip title="Daten aktualisieren">
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading
          ? Array.from(new Array(4)).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={30} />
                    <Skeleton variant="text" width="40%" height={40} />
                    <Skeleton variant="text" width="80%" height={20} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          : financialData?.kpis.map((kpi, index) => {
              const percentChange = getPercentageChange(kpi.value, kpi.previousValue);
              const isPositive = percentChange >= 0;
              const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;
              const trendColor = isPositive ? 'success.main' : 'error.main';

              return (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="textSecondary" variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                          {kpi.title}
                          <Tooltip title={kpi.tooltip}>
                            <IconButton size="small">
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Typography>
                        {kpi.icon}
                      </Box>
                      <Typography variant="h5" component="div">
                        {kpi.currency ? formatCurrency(kpi.value) : kpi.value.toLocaleString('de-DE')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TrendIcon sx={{ color: trendColor, fontSize: '1rem', mr: 0.5 }} />
                        <Typography 
                          variant="body2" 
                          sx={{ color: trendColor }}
                        >
                          {Math.abs(percentChange).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                          vs. Vormonat
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Umsatzentwicklung */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Umsatzentwicklung" />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              {loading ? (
                <Skeleton variant="rectangular" width="100%" height="100%" />
              ) : (
                <Line
                  options={revenueChartOptions}
                  data={{
                    labels: financialData?.monthlyRevenue.labels,
                    datasets: [
                      {
                        label: 'Umsatz',
                        data: financialData?.monthlyRevenue.data,
                        borderColor: theme.palette.primary.main,
                        backgroundColor: `${theme.palette.primary.main}20`,
                        tension: 0.3,
                        fill: true
                      }
                    ]
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Kostenverteilung */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Kostenverteilung" />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              {loading ? (
                <Skeleton variant="circular" width="100%" height="100%" />
              ) : (
                <Doughnut
                  options={expenseChartOptions}
                  data={{
                    labels: financialData?.expenseDistribution.labels,
                    datasets: [
                      {
                        label: 'Anteil',
                        data: financialData?.expenseDistribution.data,
                        backgroundColor: [
                          theme.palette.primary.main,
                          theme.palette.secondary.main,
                          theme.palette.success.main,
                          theme.palette.info.main,
                          theme.palette.warning.main,
                          theme.palette.error.main
                        ],
                        borderWidth: 1
                      }
                    ]
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Cashflow */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Cashflow" />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              {loading ? (
                <Skeleton variant="rectangular" width="100%" height="100%" />
              ) : (
                <Bar
                  options={cashFlowChartOptions}
                  data={{
                    labels: financialData?.cashFlow.labels,
                    datasets: [
                      {
                        label: 'Einnahmen',
                        data: financialData?.cashFlow.inflow,
                        backgroundColor: theme.palette.success.main
                      },
                      {
                        label: 'Ausgaben',
                        data: financialData?.cashFlow.outflow,
                        backgroundColor: theme.palette.error.main
                      }
                    ]
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinanceDashboard; 