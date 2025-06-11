import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { Shipment } from '../../services/transactionApi';

// Simulierte Koordinaten für Städte in Deutschland
const cityCoordinates: { [key: string]: [number, number] } = {
  'Berlin': [52.52, 13.405],
  'München': [48.137, 11.576],
  'Hamburg': [53.551, 9.993],
  'Köln': [50.937, 6.96],
  'Frankfurt': [50.110, 8.682],
  'Stuttgart': [48.775, 9.182],
  'Düsseldorf': [51.227, 6.773],
  'Leipzig': [51.339, 12.377],
  'Dortmund': [51.514, 7.466],
  'Essen': [51.455, 7.011],
  'Bremen': [53.079, 8.801],
  'Dresden': [51.050, 13.737],
  'Hannover': [52.374, 9.738]
};

// Zufällige Farben für die Routen
const routeColors = [
  '#3f51b5', '#f44336', '#009688', '#ff9800', '#9c27b0',
  '#2196f3', '#ffeb3b', '#673ab7', '#4caf50', '#795548'
];

interface ShipmentMapProps {
  shipments: Shipment[];
  singleMode?: boolean;
}

/**
 * Komponentendefinition
 * 
 * Da wir hier eine "simulierte" Karte implementieren, anstatt eine echte Karte wie Leaflet oder Google Maps zu integrieren,
 * verwenden wir einen einfachen Canvas, um die Routen und Marker zu zeichnen.
 */
const ShipmentMap: React.FC<ShipmentMapProps> = ({ shipments, singleMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hilfsfunktion zum Zeichnen eines Markers
  const drawMarker = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    color: string,
    size: number = 8
  ) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Weißer Rand
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();
  };

  // Hilfsfunktion zum Zeichnen einer gekrümmten Linie
  const drawCurvedLine = (
    ctx: CanvasRenderingContext2D, 
    x1: number, 
    y1: number, 
    x2: number, 
    y2: number, 
    color: string,
    progress: number = 1
  ) => {
    // Berechne Kontrollpunkt für eine gebogene Linie
    const cpX = (x1 + x2) / 2;
    const cpY = Math.min(y1, y2) - 50;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    
    // Berechne Zwischenpunkte für Animation
    if (progress < 1) {
      const t = progress;
      // Quadratische Bézierkurve: Punkt bei t
      const x = (1-t)*(1-t)*x1 + 2*(1-t)*t*cpX + t*t*x2;
      const y = (1-t)*(1-t)*y1 + 2*(1-t)*t*cpY + t*t*y2;
      ctx.quadraticCurveTo(cpX, cpY, x, y);
    } else {
      ctx.quadraticCurveTo(cpX, cpY, x2, y2);
    }
    
    ctx.stroke();
  };

  // Hilfsfunktion zum Zeichnen von Pulsmarkern für bewegende Sendungen
  const drawPulsingMarker = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    color: string,
    time: number
  ) => {
    // Innerer fester Marker
    drawMarker(ctx, x, y, color, 6);
    
    // Äußerer pulsierender Kreis
    const pulseSize = 15 + Math.sin(time / 200) * 5; // Pulsierender Effekt
    const alpha = Math.max(0, 0.7 - Math.sin(time / 200) * 0.3); // Verblassen
    
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  // Koordinaten in Canvas-Koordinaten umrechnen
  const coordsToCanvas = (
    lat: number, 
    lng: number, 
    canvasWidth: number, 
    canvasHeight: number
  ): [number, number] => {
    // Karten-Grenzen (grobe Annäherung für Deutschland)
    const minLat = 47.0; // Südlichste Koordinate
    const maxLat = 55.0; // Nördlichste Koordinate
    const minLng = 5.0;  // Westlichste Koordinate
    const maxLng = 15.0; // Östlichste Koordinate
    
    // Skalierung auf Canvas-Größe mit etwas Rand
    const padding = 20;
    const x = ((lng - minLng) / (maxLng - minLng)) * (canvasWidth - 2 * padding) + padding;
    // Y-Achse ist umgekehrt (0 ist oben)
    const y = canvasHeight - (((lat - minLat) / (maxLat - minLat)) * (canvasHeight - 2 * padding) + padding);
    
    return [x, y];
  };

  // Karte zeichnen
  const drawMap = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Canvas löschen
    ctx.clearRect(0, 0, width, height);
    
    // Hintergrund
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Gitternetz zeichnen
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
    
    // Städte zeichnen
    Object.entries(cityCoordinates).forEach(([city, [lat, lng]]) => {
      const [x, y] = coordsToCanvas(lat, lng, width, height);
      
      // Stadt-Marker
      ctx.fillStyle = '#adb5bd';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Stadtname
      ctx.fillStyle = '#495057';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(city, x, y - 10);
    });
    
    // Lieferungen zeichnen
    shipments.forEach((shipment, index) => {
      const color = routeColors[index % routeColors.length];
      
      // Startpunkt (Standardmäßig Berlin, wenn nicht angegeben)
      const startCity = 'Berlin';
      const [startLat, startLng] = cityCoordinates[startCity];
      const [startX, startY] = coordsToCanvas(startLat, startLng, width, height);
      
      // Zielpunkt
      const destCity = shipment.destination || 
                       (shipment.order?.customer?.city) || 
                       Object.keys(cityCoordinates)[Math.floor(Math.random() * Object.keys(cityCoordinates).length)];
      
      if (cityCoordinates[destCity]) {
        const [destLat, destLng] = cityCoordinates[destCity];
        const [destX, destY] = coordsToCanvas(destLat, destLng, width, height);
        
        // Lieferstatus simulieren
        let progress = 1.0;
        let isMoving = false;
        
        if (shipment.status === 'Unterwegs') {
          // Bei Lieferungen unterwegs, basierend auf der Zeit animieren
          const currentTime = timestamp || Date.now();
          const shipmentTime = shipment.shipment_date * 1000;
          const estimatedDelivery = shipment.estimated_delivery ? shipment.estimated_delivery * 1000 : (shipmentTime + 3 * 24 * 60 * 60 * 1000);
          
          if (currentTime < estimatedDelivery) {
            progress = (currentTime - shipmentTime) / (estimatedDelivery - shipmentTime);
            progress = Math.max(0, Math.min(1, progress));
            isMoving = true;
          }
        } else if (shipment.status === 'In Vorbereitung') {
          progress = 0;
        }
        
        // Route zeichnen
        drawCurvedLine(ctx, startX, startY, destX, destY, color, progress);
        
        // Start-Marker
        drawMarker(ctx, startX, startY, '#6c757d');
        
        // Ziel-Marker
        drawMarker(ctx, destX, destY, color);
        
        // Bewegungsmarker für Lieferungen unterwegs
        if (isMoving && progress > 0 && progress < 1) {
          // Position auf der Route berechnen
          const cpX = (startX + destX) / 2;
          const cpY = Math.min(startY, destY) - 50;
          
          const t = progress;
          const x = (1-t)*(1-t)*startX + 2*(1-t)*t*cpX + t*t*destX;
          const y = (1-t)*(1-t)*startY + 2*(1-t)*t*cpY + t*t*destY;
          
          drawPulsingMarker(ctx, x, y, color, timestamp || 0);
        }
      }
    });
  };

  // Beim Laden die Karte zeichnen und Animation starten
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Canvas-Größe setzen
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawMap(Date.now());
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Animation für bewegende Lieferungen
    let animationId: number;
    
    const animate = (timestamp: number) => {
      drawMap(timestamp);
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [shipments]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        bgcolor: '#f8f9fa',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      
      {shipments.length === 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography color="textSecondary">
            Keine Lieferungen zur Anzeige verfügbar
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ShipmentMap; 