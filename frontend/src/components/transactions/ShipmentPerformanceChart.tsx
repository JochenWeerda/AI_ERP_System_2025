import React, { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';

// In einer realen Anwendung würde man hier Chart.js, Recharts oder eine ähnliche Bibliothek verwenden
// Wir simulieren die Funktionalität mit einem einfachen Canvas

// Simulierte Daten für die Performance-Statistiken
const performanceData = {
  monthlyDeliveries: [12, 14, 18, 16, 22, 26, 24, 28, 32, 30, 36, 38],
  onTimeRates: [92, 94, 91, 89, 93, 95, 94, 96, 97, 94, 96, 98],
  months: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
};

const ShipmentPerformanceChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

  // Zeichnet das Linien- und Balkendiagramm
  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Canvas löschen
    ctx.clearRect(0, 0, width, height);
    
    // Farben für die Diagramme
    const barColor = theme.palette.primary.main;
    const lineColor = theme.palette.success.main;
    
    // Diagrammbereich
    const padding = { top: 20, right: 40, bottom: 50, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Datenwerte normalisieren
    const maxDeliveries = Math.max(...performanceData.monthlyDeliveries);
    const minDeliveries = 0;
    
    // Y-Achsen-Einteilungen berechnen
    const yAxisSteps = 5;
    const deliveryStep = Math.ceil(maxDeliveries / yAxisSteps);
    const maxYValue = deliveryStep * yAxisSteps;
    
    // X-Achse zeichnen (Monate)
    ctx.strokeStyle = theme.palette.divider;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();
    
    // Y-Achse für Lieferungen (links)
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();
    
    // Y-Achse für Pünktlichkeit (rechts)
    ctx.beginPath();
    ctx.moveTo(width - padding.right, padding.top);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();
    
    // Gitterlinien für Y-Achse zeichnen
    ctx.setLineDash([2, 2]);
    
    for (let i = 0; i <= yAxisSteps; i++) {
      const y = height - padding.bottom - (i / yAxisSteps) * chartHeight;
      
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      
      // Y-Achsen-Beschriftung (Lieferungen)
      const yValue = i * deliveryStep;
      ctx.fillStyle = theme.palette.text.primary;
      ctx.font = '11px Arial';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(yValue.toString(), padding.left - 10, y);
      
      // Y-Achsen-Beschriftung (Pünktlichkeit)
      const percentValue = i * 20;
      ctx.textAlign = 'left';
      ctx.fillText(`${percentValue}%`, width - padding.right + 10, y);
    }
    
    ctx.setLineDash([]);
    
    // Balkenbreite berechnen
    const barWidth = chartWidth / performanceData.months.length * 0.6;
    const barSpacing = chartWidth / performanceData.months.length;
    
    // Bars und X-Achse zeichnen
    performanceData.months.forEach((month, i) => {
      const x = padding.left + i * barSpacing + barSpacing / 2 - barWidth / 2;
      const deliveryCount = performanceData.monthlyDeliveries[i];
      const normalizedHeight = (deliveryCount / maxYValue) * chartHeight;
      const y = height - padding.bottom - normalizedHeight;
      
      // Balken zeichnen
      ctx.fillStyle = barColor;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(x, y, barWidth, normalizedHeight);
      ctx.globalAlpha = 1;
      
      // Monatsbeschriftung
      ctx.fillStyle = theme.palette.text.primary;
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(month, padding.left + i * barSpacing + barSpacing / 2, height - padding.bottom + 15);
    });
    
    // Liniengraph für Pünktlichkeit zeichnen
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    performanceData.onTimeRates.forEach((rate, i) => {
      const x = padding.left + i * barSpacing + barSpacing / 2;
      const normalizedHeight = (rate / 100) * chartHeight;
      const y = height - padding.bottom - normalizedHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Punkte auf der Linie
    performanceData.onTimeRates.forEach((rate, i) => {
      const x = padding.left + i * barSpacing + barSpacing / 2;
      const normalizedHeight = (rate / 100) * chartHeight;
      const y = height - padding.bottom - normalizedHeight;
      
      ctx.fillStyle = theme.palette.background.paper;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.stroke();
      
      // Prozentsatz anzeigen
      ctx.fillStyle = theme.palette.text.secondary;
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${rate}%`, x, y - 10);
    });
    
    // Achsentitel
    ctx.fillStyle = theme.palette.text.primary;
    ctx.font = 'bold 12px Arial';
    
    // Y-Achse links (Lieferungen)
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Lieferungen', 0, 0);
    ctx.restore();
    
    // Y-Achse rechts (Pünktlichkeit)
    ctx.save();
    ctx.translate(width - 15, height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Pünktlichkeit', 0, 0);
    ctx.restore();
    
    // X-Achse
    ctx.textAlign = 'center';
    ctx.fillText('Monat', width / 2, height - 10);
    
    // Legende
    const legendX = padding.left;
    const legendY = padding.top + 10;
    
    // Legende für Balken (Lieferungen)
    ctx.fillStyle = barColor;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.globalAlpha = 1;
    
    ctx.fillStyle = theme.palette.text.primary;
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Lieferungen', legendX + 25, legendY + 7.5);
    
    // Legende für Linie (Pünktlichkeit)
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX + 80, legendY + 7.5);
    ctx.lineTo(legendX + 95, legendY + 7.5);
    ctx.stroke();
    
    ctx.fillStyle = theme.palette.background.paper;
    ctx.beginPath();
    ctx.arc(legendX + 88, legendY + 7.5, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(legendX + 88, legendY + 7.5, 4, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = theme.palette.text.primary;
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Pünktlichkeit', legendX + 105, legendY + 7.5);
  };

  // Chart neu zeichnen, wenn sich die Fenstergröße ändert oder beim ersten Rendern
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Canvas-Größe an den Container anpassen
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawChart();
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [theme]);

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

export default ShipmentPerformanceChart; 