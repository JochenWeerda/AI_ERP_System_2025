import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Box,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface NewOrderDialogProps {
  open: boolean;
  onClose: () => void;
}

const NewOrderDialog: React.FC<NewOrderDialogProps> = ({
  open,
  onClose
}) => {
  const [orderType, setOrderType] = useState<'sale' | 'purchase'>('sale');
  const [orderLines, setOrderLines] = useState([{ 
    product_id: '', 
    product_name: '', 
    quantity: 1,
    unit_price: 0
  }]);
  
  const handleAddOrderLine = () => {
    setOrderLines([
      ...orderLines,
      { product_id: '', product_name: '', quantity: 1, unit_price: 0 }
    ]);
  };
  
  const handleRemoveOrderLine = (index: number) => {
    setOrderLines(orderLines.filter((_, i) => i !== index));
  };
  
  const handleOrderLineChange = (index: number, field: string, value: any) => {
    const newOrderLines = [...orderLines];
    newOrderLines[index] = {
      ...newOrderLines[index],
      [field]: value
    };
    setOrderLines(newOrderLines);
  };
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Implementierung für API-Aufruf
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Neue Bestellung erstellen</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Bestelldaten */}
            <Grid item xs={12}>
              <Typography variant="subtitle1">Allgemeine Informationen</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="order-type-label">Bestelltyp</InputLabel>
                <Select
                  labelId="order-type-label"
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as 'sale' | 'purchase')}
                  label="Bestelltyp"
                  required
                >
                  <MenuItem value="sale">Verkauf</MenuItem>
                  <MenuItem value="purchase">Einkauf</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label={orderType === 'sale' ? 'Kunde' : 'Lieferant'}
                variant="outlined"
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notizen"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            
            {/* Bestellpositionen */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, mt: 2 }}>
                <Typography variant="subtitle1">Bestellpositionen</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddOrderLine}
                  variant="outlined"
                  size="small"
                >
                  Position hinzufügen
                </Button>
              </Box>
              <Divider />
            </Grid>
            
            {orderLines.map((line, index) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 1, 
                  p: 2,
                  mb: 1,
                  backgroundColor: '#fafafa'
                }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Produkt"
                        variant="outlined"
                        fullWidth
                        required
                        value={line.product_name}
                        onChange={(e) => handleOrderLineChange(index, 'product_name', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        label="Menge"
                        variant="outlined"
                        fullWidth
                        type="number"
                        required
                        value={line.quantity}
                        onChange={(e) => handleOrderLineChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Einzelpreis"
                        variant="outlined"
                        fullWidth
                        type="number"
                        required
                        value={line.unit_price}
                        onChange={(e) => handleOrderLineChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveOrderLine(index)}
                        disabled={orderLines.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Abbrechen</Button>
          <Button type="submit" variant="contained" color="primary">Erstellen</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NewOrderDialog;
