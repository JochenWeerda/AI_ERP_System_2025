import React, { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import { Shipment } from '../../services/transactionApi';

// Wir simulieren eine Chart-Bibliothek mit einem einfachen Canvas
// In einer realen Anwendung würde man hier Chart.js, Recharts oder eine ähnliche Bibliothek verwenden

interface ShipmentStatusChartProps {
  shipments: Shipment[];
}

const ShipmentStatusChart: React.FC<ShipmentStatusChartProps> = ({ shipments }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

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

  // Zählt die Anzahl der Lieferungen pro Status
  const countStatusOccurrences = () => {
    const statusCounts: Record<string, number> = {
      'In Vorbereitung': 0,
      'Unterwegs': 0,
      'Ausgeliefert': 0,
      'Verspätet': 0
    };
    
    shipments.forEach(shipment => {
      const status = shipment.status || 'Unbekannt';
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      } else {
        statusCounts[status] = 1;
      }
    });
    
    return statusCounts;
  };

  // Zeichnet das Donut-Diagramm
  const drawDonutChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const radius = Math.min(width, height) / 2 * 0.8;
    const centerX = width / 2;
    const centerY = height / 2;
    const donutWidth = radius * 0.4;
    
    // Canvas löschen
    ctx.clearRect(0, 0, width, height);
    
    // Status-Anzahl berechnen
    const statusCounts = countStatusOccurrences();
    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
      // Keine Daten: grauen Kreis zeichnen
      ctx.fillStyle = theme.palette.grey[300];
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Inneren Kreis ausschneiden
      ctx.fillStyle = theme.palette.background.paper;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - donutWidth, 0, Math.PI * 2);
      ctx.fill();
      
      // Text zeichnen
      ctx.fillStyle = theme.palette.text.secondary;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Keine Daten', centerX, centerY);
      
      return;
    }
    
    // Startwinkel für das Zeichnen
    let startAngle = -Math.PI / 2;
    
    // Jeden Status als Segment zeichnen
    Object.entries(statusCounts).forEach(([status, count]) => {
      if (count === 0) return;
      
      const sliceAngle = (count / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;
      
      // Status-Segment zeichnen
      ctx.fillStyle = getStatusColor(status);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();
      
      // Fortschreiten zum nächsten Segment
      startAngle = endAngle;
    });
    
    // Inneren Kreis ausschneiden, um ein Donut-Diagramm zu erstellen
    ctx.fillStyle = theme.palette.background.paper;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - donutWidth, 0, Math.PI * 2);
    ctx.fill();
    
    // Gesamtzahl in der Mitte zeichnen
    ctx.fillStyle = theme.palette.text.primary;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 10);
    
    ctx.fillStyle = theme.palette.text.secondary;
    ctx.font = '14px Arial';
    ctx.fillText('Lieferungen', centerX, centerY + 15);
    
    // Legende zeichnen
    const legendX = 20;
    let legendY = height - 20 - (Object.keys(statusCounts).length * 25);
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      if (count === 0) return;
      
      const percentage = Math.round((count / total) * 100);
      
      // Farbquadrat
      ctx.fillStyle = getStatusColor(status);
      ctx.fillRect(legendX, legendY, 15, 15);
      
      // Text
      ctx.fillStyle = theme.palette.text.primary;
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${status}: ${count} (${percentage}%)`, legendX + 25, legendY + 7.5);
      
      legendY += 25;
    });
  };

  // Chart neu zeichnen, wenn sich die Daten ändern oder beim ersten Rendern
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Canvas-Größe an den Container anpassen
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawDonutChart();
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [shipments, theme]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </Box>
  );
};

export default ShipmentStatusChart; 