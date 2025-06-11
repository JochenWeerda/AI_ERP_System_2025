import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, TextField, Typography, FormControl, InputLabel, Select,
  MenuItem, Divider, IconButton, FormHelperText, Autocomplete
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { createShipment, Shipment } from '../../services/transactionApi';

// Mock-Daten für Entwicklungszwecke
const mockOrders = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  order_number: `ORD-${1000 + i}`,
  customer_name: `Kunde ${i + 1}`,
  order_date: Date.now() / 1000 - Math.floor(Math.random() * 30 * 24 * 60 * 60),
}));

const mockProducts = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Produkt ${i + 1}`,
  sku: `SKU-${100 + i}`,
  price: Math.floor(Math.random() * 100) + 10
}));

const carriers = ["DHL", "Hermes", "DPD", "UPS", "FedEx", "GLS", "DB Schenker", "Sonstige"];

interface NewShipmentDialogProps {
  onClose: () => void;
  onSave: (shipment: Shipment) => void;
}

interface ShipmentLineForm {
  product_id: number;
  product_name?: string;  // Für UI-Zwecke
  quantity: number;
  line_number: number;
  order_line_id?: number;
}

const NewShipmentDialog: React.FC<NewShipmentDialogProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    shipment_number: '',
    shipment_date: new Date().toISOString().split('T')[0],
    order_id: '',
    carrier: '',
    tracking_number: '',
    shipping_cost: '',
    notes: '',
    destination: '',  // Nicht im Backend-Modell, aber für UI-Zwecke
    estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Geschätzte Lieferzeit in 7 Tagen
  });
  
  const [shipmentLines, setShipmentLines] = useState<ShipmentLineForm[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Fehlervalidierung
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.shipment_number) newErrors.shipment_number = "Lieferungsnummer ist erforderlich";
    if (!formData.order_id) newErrors.order_id = "Bestellung ist erforderlich";
    if (!formData.shipment_date) newErrors.shipment_date = "Lieferdatum ist erforderlich";
    if (!formData.carrier) newErrors.carrier = "Spediteur ist erforderlich";
    
    if (shipmentLines.length === 0) {
      newErrors.shipmentLines = "Mindestens eine Lieferposition ist erforderlich";
    }
    
    shipmentLines.forEach((line, index) => {
      if (!line.product_id) {
        newErrors[`shipmentLines[${index}].product_id`] = "Produkt ist erforderlich";
      }
      if (!line.quantity || line.quantity <= 0) {
        newErrors[`shipmentLines[${index}].quantity`] = "Menge muss größer als 0 sein";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formularänderungen behandeln
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Fehler löschen, wenn Feld ausgefüllt wurde
      if (errors[name] && value) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  // Bestellung auswählen
  const handleOrderSelect = (order: any | null) => {
    if (order) {
      setSelectedOrder(order);
      setFormData(prev => ({ 
        ...prev, 
        order_id: order.id.toString(),
        destination: order.customer_name ? `${order.customer_name}` : ''
      }));
    } else {
      setSelectedOrder(null);
      setFormData(prev => ({ ...prev, order_id: '' }));
    }
  };

  // Neue Lieferposition hinzufügen
  const addShipmentLine = () => {
    setShipmentLines(prev => [
      ...prev, 
      { 
        product_id: 0,
        quantity: 1,
        line_number: prev.length + 1
      }
    ]);
  };

  // Lieferposition entfernen
  const removeShipmentLine = (index: number) => {
    setShipmentLines(prev => {
      const newLines = [...prev];
      newLines.splice(index, 1);
      // Line numbers aktualisieren
      return newLines.map((line, i) => ({ ...line, line_number: i + 1 }));
    });
  };

  // Lieferposition aktualisieren
  const updateShipmentLine = (index: number, field: string, value: any) => {
    setShipmentLines(prev => {
      const newLines = [...prev];
      const updatedLine = { ...newLines[index], [field]: value };
      
      // Wenn Produkt ausgewählt wurde, Produktname für UI hinzufügen
      if (field === 'product_id') {
        const product = mockProducts.find(p => p.id === value);
        if (product) {
          updatedLine.product_name = product.name;
        }
      }
      
      newLines[index] = updatedLine;
      return newLines;
    });
    
    // Fehler löschen, wenn Feld ausgefüllt wurde
    if (errors[`shipmentLines[${index}].${field}`] && value) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`shipmentLines[${index}].${field}`];
        return newErrors;
      });
    }
  };

  // Formular absenden
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Daten für API vorbereiten
      const submitData = {
        shipment_number: formData.shipment_number,
        shipment_date: new Date(formData.shipment_date).getTime() / 1000,
        order_id: parseInt(formData.order_id),
        carrier: formData.carrier,
        tracking_number: formData.tracking_number || undefined,
        shipping_cost: formData.shipping_cost ? parseFloat(formData.shipping_cost) : 0,
        notes: formData.notes || undefined,
        shipment_lines: shipmentLines.map(line => ({
          product_id: line.product_id,
          quantity: line.quantity,
          line_number: line.line_number,
          order_line_id: line.order_line_id
        }))
      };
      
      // API-Aufruf
      try {
        const response = await createShipment(submitData);
        onSave(response);
      } catch (error) {
        console.error("Fehler beim Erstellen der Lieferung:", error);
        
        // Für Entwicklungszwecke: Mock-Antwort erstellen
        const mockResponse: Shipment = {
          id: Math.floor(Math.random() * 1000) + 100,
          ...submitData,
          created_at: Date.now() / 1000,
          // Zusätzliche UI-Felder
          status: "In Vorbereitung",
          destination: formData.destination,
          estimated_delivery: new Date(formData.estimated_delivery).getTime() / 1000
        };
        
        onSave(mockResponse);
      }
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Beim Öffnen des Dialogs automatisch eine Lieferposition hinzufügen
  useEffect(() => {
    if (shipmentLines.length === 0) {
      addShipmentLine();
    }
    
    // Lieferungsnummer generieren
    if (!formData.shipment_number) {
      const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      setFormData(prev => ({ ...prev, shipment_number: `SHP-${date}-${randomNumber}` }));
    }
  }, []);

  return (
    <>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Neue Lieferung erstellen</Typography>
        <IconButton aria-label="close" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Grundlegende Informationen */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Lieferungsinformationen
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="shipment_number"
                label="Lieferungsnummer"
                fullWidth
                variant="outlined"
                value={formData.shipment_number}
                onChange={handleChange}
                error={!!errors.shipment_number}
                helperText={errors.shipment_number}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={mockOrders}
                getOptionLabel={(option) => `${option.order_number} (${option.customer_name})`}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Bestellung" 
                    error={!!errors.order_id}
                    helperText={errors.order_id}
                    required
                  />
                )}
                value={selectedOrder}
                onChange={(_, newValue) => handleOrderSelect(newValue)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="shipment_date"
                label="Lieferdatum"
                type="date"
                fullWidth
                variant="outlined"
                value={formData.shipment_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.shipment_date}
                helperText={errors.shipment_date}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="estimated_delivery"
                label="Geschätztes Ankunftsdatum"
                type="date"
                fullWidth
                variant="outlined"
                value={formData.estimated_delivery}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.carrier} required>
                <InputLabel id="carrier-label">Spediteur</InputLabel>
                <Select
                  labelId="carrier-label"
                  name="carrier"
                  value={formData.carrier}
                  onChange={handleChange}
                  label="Spediteur"
                >
                  {carriers.map((carrier) => (
                    <MenuItem key={carrier} value={carrier}>
                      {carrier}
                    </MenuItem>
                  ))}
                </Select>
                {errors.carrier && <FormHelperText>{errors.carrier}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="tracking_number"
                label="Tracking-Nummer"
                fullWidth
                variant="outlined"
                value={formData.tracking_number}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="shipping_cost"
                label="Versandkosten"
                fullWidth
                variant="outlined"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                value={formData.shipping_cost}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="destination"
                label="Lieferziel"
                fullWidth
                variant="outlined"
                value={formData.destination}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Anmerkungen"
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>
            
            {/* Lieferpositionen */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Lieferpositionen
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addShipmentLine}
                  variant="outlined"
                  size="small"
                >
                  Position hinzufügen
                </Button>
              </Box>
              
              {errors.shipmentLines && (
                <FormHelperText error sx={{ mb: 2 }}>
                  {errors.shipmentLines}
                </FormHelperText>
              )}
              
              {shipmentLines.map((line, index) => (
                <Box key={index} mb={2} p={2} border={1} borderColor="divider" borderRadius={1}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={1}>
                      <Typography variant="body2" color="textSecondary">
                        #{line.line_number}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={5}>
                      <FormControl fullWidth error={!!errors[`shipmentLines[${index}].product_id`]}>
                        <InputLabel id={`product-label-${index}`}>Produkt</InputLabel>
                        <Select
                          labelId={`product-label-${index}`}
                          value={line.product_id}
                          onChange={(e) => updateShipmentLine(index, 'product_id', e.target.value)}
                          label="Produkt"
                          required
                        >
                          {mockProducts.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </MenuItem>
                          ))}
                        </Select>
                        {errors[`shipmentLines[${index}].product_id`] && (
                          <FormHelperText>{errors[`shipmentLines[${index}].product_id`]}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={3}>
                      <TextField
                        label="Menge"
                        type="number"
                        fullWidth
                        inputProps={{ min: 1 }}
                        value={line.quantity}
                        onChange={(e) => updateShipmentLine(index, 'quantity', parseInt(e.target.value))}
                        error={!!errors[`shipmentLines[${index}].quantity`]}
                        helperText={errors[`shipmentLines[${index}].quantity`]}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={3} display="flex" justifyContent="flex-end">
                      <IconButton 
                        color="error" 
                        onClick={() => removeShipmentLine(index)}
                        disabled={shipmentLines.length === 1}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={onClose} variant="outlined">
            Abbrechen
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Wird gespeichert...' : 'Lieferung erstellen'}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

export default NewShipmentDialog;
