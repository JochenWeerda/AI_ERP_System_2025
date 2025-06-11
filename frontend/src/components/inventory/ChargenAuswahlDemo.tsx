import React, { useState } from "react";
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

// Einfache Placeholder-Komponente für die Chargenauswahl
const ChargenAuswahlDemo = () => {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <Box p={3}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Chargen-Auswahl-Demo
        </Typography>
        <Typography paragraph>
          Diese Demo zeigt, wie die Chargen-Auswahl-Komponente verwendet werden kann.
          Sie unterstützt sowohl reguläre Artikel (FIFO) als auch Schüttgut wie Dünger (LIFO).
        </Typography>

        <Box display="flex" gap={2} mb={4}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setShowDemo(true)}
          >
            Chargen auswählen (Demo)
          </Button>
        </Box>

        {showDemo ? (
          <>
            <Typography variant="h6" gutterBottom>
              Auswahl-Dialog würde hier erscheinen
            </Typography>
            <Typography paragraph>
              Der Dialog würde eine Liste verfügbarer Chargen anzeigen, sortiert nach:
            </Typography>
            <ul>
              <li>FIFO (First In, First Out) für normale Artikel</li>
              <li>LIFO (Last In, First Out) für Schüttgut wie Dünger</li>
            </ul>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => setShowDemo(false)}
              sx={{ mt: 2 }}
            >
              Demo ausblenden
            </Button>
          </>
        ) : (
          <Typography color="text.secondary">
            Klicken Sie auf den Button oben, um die Demo anzuzeigen.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ChargenAuswahlDemo;
