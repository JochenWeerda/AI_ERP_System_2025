import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Button,
  Typography,
  Box,
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Checkbox,
  Chip,
  Tooltip,
  Badge,
  LinearProgress,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import InventoryIcon from '@mui/icons-material/Inventory';
import { ArticleType } from '../../types/articleTypes';
import ChargenAuswahlDialog, { SelectedCharge } from './ChargenAuswahlDialog';
import { useDebounce, useThrottle } from '../../utils/performanceUtils';
import { FixedSizeList as VirtualList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

export interface Position {
  id?: string;
  artikelId: string;
  artikelBezeichnung: string;
  artikelBeschreibung?: string;
  artikelTyp?: ArticleType;
  menge: number;
  einheit: string;
  einzelpreis: number;
  bruttoPreis?: number; // Brutto-Einzelpreis für B2C
  mwstSatz: number;
  rabatt?: number;
  rabattProzent?: number;
  mehrwertsteuerProzent?: number;
  gesamtpreis?: number;
  gesamtpreisBrutto?: number; // Brutto-Gesamtpreis für B2C
  chargennummern?: string[];
  mhd?: string;
  buchungsregel?: 'FIFO' | 'LIFO' | 'MIX';
  lagerplatz?: string;
  kundentyp?: 'B2B' | 'B2C'; // Kundentyp für die Preisberechnung
  [key: string]: any; // Für belegspezifische Zusatzfelder
}

export interface PositionenTabelleProps {
  positionen: Position[];
  onPositionenChange: (positionen: Position[]) => void;
  onArtikelSearch?: (suchbegriff: string) => Promise<any[]>;
  artikelSearchLoading?: boolean;
  onEinheitenSearch?: (suchbegriff: string) => Promise<any[]>;
  einheitenSearchLoading?: boolean;
  extraFields?: {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'date' | 'checkbox';
    options?: { value: string; label: string }[];
  }[];
  readOnly?: boolean;
  showMwst?: boolean;
  showRabatt?: boolean;
  disableMengenAenderung?: boolean;
  disableArtikelAenderung?: boolean;
  recalculatePositions?: boolean;
  onPositionAdd?: (position: Position) => void;
  onPositionDelete?: (positionId: string) => void;
  showSummary?: boolean;
  maxPositionen?: number;
  defaultKundentyp?: 'B2B' | 'B2C'; // Standard-Kundentyp
  allowKundentypChange?: boolean; // Erlaubt das Umschalten zwischen B2B und B2C
}

const PositionenTabelle: React.FC<PositionenTabelleProps> = ({
  positionen,
  onPositionenChange,
  onArtikelSearch,
  artikelSearchLoading = false,
  onEinheitenSearch,
  einheitenSearchLoading = false,
  extraFields = [],
  readOnly = false,
  showMwst = true,
  showRabatt = true,
  disableMengenAenderung = false,
  disableArtikelAenderung = false,
  recalculatePositions = true,
  onPositionAdd,
  onPositionDelete,
  showSummary = true,
  maxPositionen,
  defaultKundentyp = 'B2B',
  allowKundentypChange = true
}) => {
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showPositionDialog, setShowPositionDialog] = useState(false);
  const [newPosition, setNewPosition] = useState<Position>({
    artikelId: '',
    artikelBezeichnung: '',
    menge: 1,
    einheit: 'Stk',
    einzelpreis: 0,
    mwstSatz: 19,
    rabatt: 0,
    gesamtpreis: 0,
    kundentyp: defaultKundentyp
  });
  const [artikelSuche, setArtikelSuche] = useState('');
  const [artikelOptions, setArtikelOptions] = useState<any[]>([]);
  const [einheitenOptions, setEinheitenOptions] = useState<any[]>([]);
  const [showChargenDialog, setShowChargenDialog] = useState<boolean>(false);
  const [selectedPositionIndex, setSelectedPositionIndex] = useState<number | null>(null);
  const [verfügbareChargen, setVerfügbareChargen] = useState<Array<{
    chargennummer: string;
    menge: number;
    mhd?: string;
    lagerplatz?: string;
    einlagerungsdatum?: string;
  }>>([]);
  const [aktiverKundentyp, setAktiverKundentyp] = useState<'B2B' | 'B2C'>(defaultKundentyp);

  // Suche nach Artikeln, wenn sich die Sucheingabe ändert
  useEffect(() => {
    if (artikelSuche && onArtikelSearch) {
      const fetchArtikel = async () => {
        const ergebnisse = await onArtikelSearch(artikelSuche);
        setArtikelOptions(ergebnisse);
      };
      
      const timeoutId = setTimeout(() => {
        fetchArtikel();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [artikelSuche, onArtikelSearch]);

  // Laden von Einheiten
  useEffect(() => {
    if (onEinheitenSearch) {
      const fetchEinheiten = async () => {
        const ergebnisse = await onEinheitenSearch('');
        setEinheitenOptions(ergebnisse);
      };
      
      fetchEinheiten();
    }
  }, [onEinheitenSearch]);

  // Berechnet den Gesamtpreis einer Position je nach Kundentyp
  const berechneGesamtpreis = (position: Position): { netto: number, brutto: number } => {
    const menge = parseFloat(position.menge.toString()) || 0;
    const einzelpreis = parseFloat(position.einzelpreis.toString()) || 0;
    const rabatt = parseFloat(position.rabatt?.toString() || '0') || 0;
    const mwstSatz = parseFloat(position.mwstSatz.toString()) || 0;
    
    const gesamtpreisOhneRabatt = menge * einzelpreis;
    const rabattBetrag = gesamtpreisOhneRabatt * (rabatt / 100);
    const nettoPreis = gesamtpreisOhneRabatt - rabattBetrag;
    const bruttoPreis = nettoPreis * (1 + mwstSatz / 100);
    
    return { netto: nettoPreis, brutto: bruttoPreis };
  };

  // Berechnet Gesamtpreise für alle Positionen
  const berechneAlleGesamtpreise = (posList: Position[]): Position[] => {
    if (!recalculatePositions) return posList;
    
    return posList.map(pos => {
      const preise = berechneGesamtpreis(pos);
      return {
        ...pos,
        gesamtpreis: preise.netto,
        gesamtpreisBrutto: preise.brutto,
        bruttoPreis: pos.einzelpreis * (1 + (pos.mwstSatz / 100))
      };
    });
  };

  // Position bearbeiten
  const handleEdit = (index: number) => {
    setEditingPosition({ ...positionen[index] });
    setEditingIndex(index);
    setShowPositionDialog(true);
  };

  // Position speichern
  const handleSave = () => {
    if (editingPosition && editingIndex !== null) {
      const neueListe = [...positionen];
      neueListe[editingIndex] = {
        ...editingPosition,
        gesamtpreis: berechneGesamtpreis(editingPosition).netto,
        gesamtpreisBrutto: berechneGesamtpreis(editingPosition).brutto,
        bruttoPreis: editingPosition.einzelpreis * (1 + (editingPosition.mwstSatz / 100))
      };
      
      onPositionenChange(berechneAlleGesamtpreise(neueListe));
    }
    
    setEditingPosition(null);
    setEditingIndex(null);
    setShowPositionDialog(false);
  };

  // Position löschen
  const handleDelete = (index: number) => {
    const positionId = positionen[index].id;
    const neueListe = positionen.filter((_, i) => i !== index);
    onPositionenChange(berechneAlleGesamtpreise(neueListe));
    
    if (positionId && onPositionDelete) {
      onPositionDelete(positionId);
    }
  };

  // Neue Position hinzufügen
  const handleAddPosition = () => {
    setEditingPosition(null);
    setEditingIndex(null);
    setNewPosition({
      artikelId: '',
      artikelBezeichnung: '',
      menge: 1,
      einheit: 'Stk',
      einzelpreis: 0,
      mwstSatz: 19,
      rabatt: 0,
      gesamtpreis: 0,
      kundentyp: defaultKundentyp
    });
    setShowPositionDialog(true);
  };

  // Neue Position speichern
  const handleSaveNewPosition = () => {
    const positionMitGesamtpreis = {
      ...newPosition,
      gesamtpreis: berechneGesamtpreis(newPosition).netto,
      gesamtpreisBrutto: berechneGesamtpreis(newPosition).brutto,
      bruttoPreis: newPosition.einzelpreis * (1 + (newPosition.mwstSatz / 100))
    };
    
    const neueListe = [...positionen, positionMitGesamtpreis];
    onPositionenChange(berechneAlleGesamtpreise(neueListe));
    
    if (onPositionAdd) {
      onPositionAdd(positionMitGesamtpreis);
    }
    
    setShowPositionDialog(false);
  };

  // Dialog schließen
  const handleCloseDialog = () => {
    setShowPositionDialog(false);
    setEditingPosition(null);
    setEditingIndex(null);
  };

  // Änderungen im Dialog speichern
  const handleDialogChange = (field: string, value: any) => {
    if (editingPosition) {
      const updatedPosition = { ...editingPosition, [field]: value };
      if (recalculatePositions && (field === 'menge' || field === 'einzelpreis' || field === 'rabatt')) {
        const preise = berechneGesamtpreis(updatedPosition);
        updatedPosition.gesamtpreis = preise.netto;
        updatedPosition.gesamtpreisBrutto = preise.brutto;
        updatedPosition.bruttoPreis = updatedPosition.einzelpreis * (1 + (updatedPosition.mwstSatz / 100));
      }
      setEditingPosition(updatedPosition);
    } else {
      const updatedPosition = { ...newPosition, [field]: value };
      if (recalculatePositions && (field === 'menge' || field === 'einzelpreis' || field === 'rabatt')) {
        const preise = berechneGesamtpreis(updatedPosition);
        updatedPosition.gesamtpreis = preise.netto;
        updatedPosition.gesamtpreisBrutto = preise.brutto;
        updatedPosition.bruttoPreis = updatedPosition.einzelpreis * (1 + (updatedPosition.mwstSatz / 100));
      }
      setNewPosition(updatedPosition);
    }
  };

  // Formatiert einen Betrag als Währung
  const formatCurrency = (betrag: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(betrag);
  };

  // Artikel auswählen aus Suchergebnissen
  const handleArtikelSelect = (artikel: any) => {
    if (editingPosition) {
      setEditingPosition({
        ...editingPosition,
        artikelId: artikel.id,
        artikelBezeichnung: artikel.bezeichnung,
        artikelBeschreibung: artikel.beschreibung || '',
        einzelpreis: artikel.standardpreis || editingPosition.einzelpreis,
        einheit: artikel.einheit || editingPosition.einheit,
        artikelTyp: artikel.artikelTyp
      });
    } else {
      setNewPosition({
        ...newPosition,
        artikelId: artikel.id,
        artikelBezeichnung: artikel.bezeichnung,
        artikelBeschreibung: artikel.beschreibung || '',
        einzelpreis: artikel.standardpreis || newPosition.einzelpreis,
        einheit: artikel.einheit || newPosition.einheit,
        artikelTyp: artikel.artikelTyp
      });
    }
  };

  // Simulierte Funktion zum Abrufen verfügbarer Chargen für einen Artikel
  const fetchVerfügbareChargen = useCallback(async (artikelId: string, buchungsregel?: 'FIFO' | 'LIFO' | 'MIX') => {
    // In einer realen Implementierung würde dies eine API-Anfrage sein
    // Hier simulieren wir eine Antwort mit zufälligen Daten
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulierte Daten für verfügbare Chargen
    const heute = new Date();
    const zufälligeChargen = Array(5).fill(null).map((_, index) => {
      const mhdDate = new Date(heute);
      mhdDate.setDate(mhdDate.getDate() + Math.floor(Math.random() * 365)); // MHD zwischen heute und in einem Jahr
      
      const einlagerungDate = new Date(heute);
      einlagerungDate.setDate(einlagerungDate.getDate() - Math.floor(Math.random() * 60)); // Einlagerung in den letzten 60 Tagen
      
      return {
        chargennummer: `CH-${artikelId}-${String(Date.now()).substring(8)}${index}`,
        menge: Math.floor(Math.random() * 1000) + 100,
        mhd: mhdDate.toISOString().split('T')[0],
        lagerplatz: `Lager-${Math.floor(Math.random() * 5) + 1}`,
        einlagerungsdatum: einlagerungDate.toISOString().split('T')[0]
      };
    });
    
    // Sortieren je nach Buchungsregel
    if (buchungsregel === 'FIFO') {
      // Älteste Einlagerung zuerst (FIFO)
      zufälligeChargen.sort((a, b) => 
        new Date(a.einlagerungsdatum!).getTime() - new Date(b.einlagerungsdatum!).getTime()
      );
    } else if (buchungsregel === 'LIFO') {
      // Neueste Einlagerung zuerst (LIFO)
      zufälligeChargen.sort((a, b) => 
        new Date(b.einlagerungsdatum!).getTime() - new Date(a.einlagerungsdatum!).getTime()
      );
    } else if (buchungsregel === 'MIX') {
      // Bei MIX keine Sortierung, da sich die Chargen vermischen
    } else {
      // Standardmäßig nach MHD sortieren (ältestes MHD zuerst)
      zufälligeChargen.sort((a, b) => 
        new Date(a.mhd!).getTime() - new Date(b.mhd!).getTime()
      );
    }
    
    return zufälligeChargen;
  }, []);

  // Öffnen des Chargen-Dialogs für eine Position
  const handleChargenDialog = async (index: number) => {
    const position = positionen[index];
    if (position && position.artikelId) {
      setSelectedPositionIndex(index);
      
      try {
        const chargen = await fetchVerfügbareChargen(position.artikelId, position.buchungsregel);
        setVerfügbareChargen(chargen);
        setShowChargenDialog(true);
      } catch (error) {
        console.error('Fehler beim Laden der verfügbaren Chargen:', error);
        // Hier könnte eine Fehlerbehandlung erfolgen
      }
    }
  };

  // Anwenden der ausgewählten Chargen auf die Position
  const handleApplyChargen = (selectedChargen: SelectedCharge[]) => {
    if (selectedPositionIndex !== null && selectedChargen.length > 0) {
      const updatedPositionen = [...positionen];
      
      // Aktualisiere die Position mit den ausgewählten Chargen
      updatedPositionen[selectedPositionIndex] = {
        ...updatedPositionen[selectedPositionIndex],
        chargennummern: selectedChargen.map(c => c.chargennummer),
        mhd: selectedChargen[0].mhd, // Wir verwenden das MHD der ersten Charge als Referenz
        lagerplatz: selectedChargen[0].lagerplatz // Wir nehmen auch den Lagerplatz der ersten Charge
      };
      
      onPositionenChange(berechneAlleGesamtpreise(updatedPositionen));
      setShowChargenDialog(false);
      setSelectedPositionIndex(null);
    }
  };

  // Prüfen, ob ein Artikel chargenpflichtig ist
  const isChargenRequired = useCallback((artikelTyp?: ArticleType) => {
    return ['FUTTERMITTEL', 'SAATGUT', 'DÜNGEMITTEL', 'PFLANZENSCHUTZ'].includes(artikelTyp || '');
  }, []);

  // Memoized Position Row Component für bessere Performance bei großen Tabellen
  const PositionRow = memo(({ 
    position, 
    index, 
    onEdit, 
    onDelete, 
    onChargenDialog, 
    readOnly, 
    showMwst, 
    showRabatt, 
    formatCurrency 
  }: { 
    position: Position; 
    index: number; 
    onEdit: (index: number) => void; 
    onDelete: (index: number) => void; 
    onChargenDialog: (index: number) => void; 
    readOnly: boolean; 
    showMwst: boolean; 
    showRabatt: boolean; 
    formatCurrency: (betrag: number) => string; 
  }) => {
    const hatChargen = position.chargennummern && position.chargennummern.length > 0;
    
    return (
      <TableRow key={position.id || index}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>
          {position.artikelBezeichnung}
          {position.artikelBeschreibung && (
            <Typography variant="caption" display="block" color="text.secondary">
              {position.artikelBeschreibung}
            </Typography>
          )}
        </TableCell>
        <TableCell align="right">{position.menge} {position.einheit}</TableCell>
        <TableCell align="right">{formatCurrency(position.einzelpreis)}</TableCell>
        {showRabatt && (
          <TableCell align="right">{position.rabatt ? `${position.rabatt}%` : '-'}</TableCell>
        )}
        {showMwst && (
          <TableCell align="right">{position.mwstSatz}%</TableCell>
        )}
        <TableCell align="right">{formatCurrency(position.gesamtpreis || 0)}</TableCell>
        <TableCell>
          {position.artikelTyp === 'CHARGE' && (
            <Tooltip title={hatChargen ? `${position.chargennummern?.join(', ')}` : 'Chargen auswählen'}>
              <Badge 
                badgeContent={position.chargennummern?.length || 0} 
                color={hatChargen ? "success" : "error"}
              >
                <IconButton 
                  size="small" 
                  onClick={() => onChargenDialog(index)}
                  color={hatChargen ? "success" : "default"}
                >
                  <InventoryIcon />
                </IconButton>
              </Badge>
            </Tooltip>
          )}
        </TableCell>
        <TableCell>
          {!readOnly && (
            <>
              <IconButton size="small" onClick={() => onEdit(index)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete(index)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </TableCell>
      </TableRow>
    );
  });

  // Virtualisierte Tabelle für große Datensätze
  const VirtualizedPositionenTable = memo(({ 
    positionen, 
    onEdit, 
    onDelete, 
    onChargenDialog, 
    readOnly, 
    showMwst, 
    showRabatt, 
    formatCurrency 
  }: { 
    positionen: Position[]; 
    onEdit: (index: number) => void; 
    onDelete: (index: number) => void; 
    onChargenDialog: (index: number) => void; 
    readOnly: boolean; 
    showMwst: boolean; 
    showRabatt: boolean; 
    formatCurrency: (betrag: number) => string; 
  }) => {
    // Nur rendern, wenn mehr als 20 Positionen vorhanden sind
    if (positionen.length <= 20) {
      return (
        <TableBody>
          {positionen.map((position, index) => (
            <PositionRow
              key={position.id || index}
              position={position}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              onChargenDialog={onChargenDialog}
              readOnly={readOnly}
              showMwst={showMwst}
              showRabatt={showRabatt}
              formatCurrency={formatCurrency}
            />
          ))}
        </TableBody>
      );
    }

    // Virtualisierte Liste für große Datensätze
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={showMwst && showRabatt ? 8 : (showMwst || showRabatt ? 7 : 6)} style={{ padding: 0, height: 'auto' }}>
            <div style={{ height: '400px' }}>
              <AutoSizer>
                {({ height, width }) => (
                  <VirtualList
                    height={height}
                    width={width}
                    itemCount={positionen.length}
                    itemSize={53} // Anpassen je nach Zeilenhöhe
                  >
                    {({ index, style }) => (
                      <div style={style}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          <div style={{ width: '40px', textAlign: 'left' }}>{index + 1}</div>
                          <div style={{ flex: 2, textAlign: 'left' }}>
                            {positionen[index].artikelBezeichnung}
                            {positionen[index].artikelBeschreibung && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {positionen[index].artikelBeschreibung}
                              </Typography>
                            )}
                          </div>
                          <div style={{ width: '100px', textAlign: 'right' }}>
                            {positionen[index].menge} {positionen[index].einheit}
                          </div>
                          <div style={{ width: '100px', textAlign: 'right' }}>
                            {formatCurrency(positionen[index].einzelpreis)}
                          </div>
                          {showRabatt && (
                            <div style={{ width: '80px', textAlign: 'right' }}>
                              {positionen[index].rabatt ? `${positionen[index].rabatt}%` : '-'}
                            </div>
                          )}
                          {showMwst && (
                            <div style={{ width: '80px', textAlign: 'right' }}>
                              {positionen[index].mwstSatz}%
                            </div>
                          )}
                          <div style={{ width: '120px', textAlign: 'right' }}>
                            {formatCurrency(positionen[index].gesamtpreis || 0)}
                          </div>
                          <div style={{ width: '50px', textAlign: 'center' }}>
                            {positionen[index].artikelTyp === 'CHARGE' && (
                              <Tooltip title={(positionen[index].chargennummern?.length || 0) > 0 ? `${positionen[index].chargennummern?.join(', ')}` : 'Chargen auswählen'}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => onChargenDialog(index)}
                                  color={(positionen[index].chargennummern?.length || 0) > 0 ? "success" : "default"}
                                >
                                  <Badge 
                                    badgeContent={positionen[index].chargennummern?.length || 0} 
                                    color={(positionen[index].chargennummern?.length || 0) > 0 ? "success" : "error"}
                                  >
                                    <InventoryIcon fontSize="small" />
                                  </Badge>
                                </IconButton>
                              </Tooltip>
                            )}
                          </div>
                          <div style={{ width: '100px', textAlign: 'center' }}>
                            {!readOnly && (
                              <>
                                <IconButton size="small" onClick={() => onEdit(index)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => onDelete(index)} color="error">
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </VirtualList>
                )}
              </AutoSizer>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  });

  // Kundentyp ändern
  const handleKundentypChange = (neuKundentyp: 'B2B' | 'B2C') => {
    setAktiverKundentyp(neuKundentyp);
    
    // Alle Positionen mit dem neuen Kundentyp aktualisieren
    const updatedPositionen = positionen.map(position => ({
      ...position,
      kundentyp: neuKundentyp
    }));
    
    onPositionenChange(berechneAlleGesamtpreise(updatedPositionen));
  };

  // Summenwerte für die Tabelle
  const tabellenSummenwerte = useMemo(() => {
    const summenwerte = positionen.reduce(
      (acc, position) => {
        const nettoSumme = position.gesamtpreis || 0;
        const mwstBetrag = nettoSumme * (position.mwstSatz / 100);
        const bruttoSumme = position.gesamtpreisBrutto || nettoSumme + mwstBetrag;
        
        return {
          netto: acc.netto + nettoSumme,
          mwst: acc.mwst + mwstBetrag,
          brutto: acc.brutto + bruttoSumme
        };
      },
      { netto: 0, mwst: 0, brutto: 0 }
    );
    
    return summenwerte;
  }, [positionen]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Positionen</Typography>
        {!readOnly && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddPosition}
          >
            Position hinzufügen
          </Button>
        )}
      </Box>
      
      {/* Kundentyp-Umschalter */}
      {allowKundentypChange && !readOnly && (
        <Box mb={2} display="flex" justifyContent="flex-end" alignItems="center">
          <Typography variant="body2" sx={{ mr: 1 }}>Kundentyp:</Typography>
          <Button
            variant={aktiverKundentyp === 'B2B' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleKundentypChange('B2B')}
            sx={{ mr: 1 }}
          >
            B2B (Netto)
          </Button>
          <Button
            variant={aktiverKundentyp === 'B2C' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleKundentypChange('B2C')}
          >
            B2C (Brutto)
          </Button>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width="5%">Nr.</TableCell>
              <TableCell width="35%">Artikel</TableCell>
              <TableCell width="10%" align="right">Menge</TableCell>
              <TableCell width="10%" align="right">
                {aktiverKundentyp === 'B2B' ? 'Netto-Preis' : 'Brutto-Preis'}
              </TableCell>
              {showRabatt && <TableCell width="10%" align="right">Rabatt</TableCell>}
              {showMwst && <TableCell width="10%" align="right">MwSt.</TableCell>}
              <TableCell width="10%" align="right">Gesamt</TableCell>
              <TableCell width="5%"></TableCell>
              <TableCell width="5%"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positionen.length > 0 ? (
              <VirtualizedPositionenTable
                positionen={positionen}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onChargenDialog={handleChargenDialog}
                readOnly={readOnly}
                showMwst={showMwst}
                showRabatt={showRabatt}
                formatCurrency={formatCurrency}
              />
            ) : (
              <TableRow>
                <TableCell colSpan={showMwst && showRabatt ? 8 : (showMwst || showRabatt ? 7 : 6)}>
                  <Typography align="center" variant="body2" color="textSecondary">
                    Keine Positionen vorhanden
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Zeige Summen an */}
      {showSummary && positionen.length > 0 && (
        <Box mt={2} p={2} component={Paper} variant="outlined">
          <Grid container spacing={1}>
            <Grid item xs={12} container justifyContent="space-between">
              <Typography variant="subtitle1">Netto-Summe:</Typography>
              <Typography variant="subtitle1">{formatCurrency(tabellenSummenwerte.netto)}</Typography>
            </Grid>
            <Grid item xs={12} container justifyContent="space-between">
              <Typography variant="subtitle1">MwSt.:</Typography>
              <Typography variant="subtitle1">{formatCurrency(tabellenSummenwerte.mwst)}</Typography>
            </Grid>
            <Divider sx={{ width: '100%', my: 1 }} />
            <Grid item xs={12} container justifyContent="space-between">
              <Typography variant="h6">Brutto-Summe:</Typography>
              <Typography variant="h6">{formatCurrency(tabellenSummenwerte.brutto)}</Typography>
            </Grid>
          </Grid>
        </Box>
      )}

      <Dialog open={showPositionDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? 'Position bearbeiten' : 'Neue Position'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={artikelOptions}
                loading={artikelSearchLoading}
                getOptionLabel={(option) => 
                  typeof option === 'string' ? option : `${option.bezeichnung} (${option.artikelnummer || '-'})`
                }
                onInputChange={(event, newValue) => setArtikelSuche(newValue)}
                onChange={(event, value) => value && handleArtikelSelect(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Artikel"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {artikelSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                disabled={readOnly || disableArtikelAenderung}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Bezeichnung"
                value={editingPosition ? editingPosition.artikelBezeichnung : newPosition.artikelBezeichnung}
                onChange={(e) => 
                  handleDialogChange('artikelBezeichnung', e.target.value)
                }
                fullWidth
                variant="outlined"
                disabled={readOnly}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Beschreibung (optional)"
                value={
                  editingPosition 
                    ? editingPosition.artikelBeschreibung || '' 
                    : newPosition.artikelBeschreibung || ''
                }
                onChange={(e) => 
                  handleDialogChange('artikelBeschreibung', e.target.value)
                }
                fullWidth
                variant="outlined"
                multiline
                rows={1}
                disabled={readOnly}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Menge"
                type="number"
                value={editingPosition ? editingPosition.menge : newPosition.menge}
                onChange={(e) => 
                  handleDialogChange('menge', parseFloat(e.target.value) || 0)
                }
                fullWidth
                variant="outlined"
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                disabled={readOnly || disableMengenAenderung}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Autocomplete
                options={einheitenOptions}
                loading={einheitenSearchLoading}
                getOptionLabel={(option) => 
                  typeof option === 'string' ? option : option.name || option.bezeichnung
                }
                value={
                  editingPosition 
                    ? { name: editingPosition.einheit } 
                    : { name: newPosition.einheit }
                }
                onChange={(event, value) => 
                  handleDialogChange('einheit', value ? value.name || value.bezeichnung : 'Stk')
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Einheit"
                    variant="outlined"
                    fullWidth
                  />
                )}
                disabled={readOnly}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Kundentyp</InputLabel>
                <Select
                  value={editingPosition ? editingPosition.kundentyp || 'B2B' : newPosition.kundentyp || 'B2B'}
                  onChange={(e) => handleDialogChange('kundentyp', e.target.value)}
                  label="Kundentyp"
                  disabled={readOnly || !allowKundentypChange}
                >
                  <MenuItem value="B2B">B2B (Netto)</MenuItem>
                  <MenuItem value="B2C">B2C (Brutto)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label={`${(editingPosition?.kundentyp || newPosition.kundentyp) === 'B2C' ? 'Brutto' : 'Netto'}-Einzelpreis`}
                type="number"
                value={
                  (editingPosition?.kundentyp || newPosition.kundentyp) === 'B2C'
                    ? (editingPosition ? editingPosition.bruttoPreis || 0 : newPosition.bruttoPreis || 0)
                    : (editingPosition ? editingPosition.einzelpreis : newPosition.einzelpreis)
                }
                onChange={(e) => {
                  const wert = parseFloat(e.target.value) || 0;
                  const kundentyp = editingPosition?.kundentyp || newPosition.kundentyp;
                  const mwstSatz = editingPosition ? editingPosition.mwstSatz : newPosition.mwstSatz;
                  
                  if (kundentyp === 'B2C') {
                    // Bei B2C wird der Brutto-Preis eingegeben, wir berechnen den Netto-Preis
                    const nettoPreis = wert / (1 + (mwstSatz / 100));
                    if (editingPosition) {
                      handleDialogChange('einzelpreis', nettoPreis);
                      handleDialogChange('bruttoPreis', wert);
                    } else {
                      handleDialogChange('einzelpreis', nettoPreis);
                      handleDialogChange('bruttoPreis', wert);
                    }
                  } else {
                    // Bei B2B wird der Netto-Preis eingegeben
                    const bruttoPreis = wert * (1 + (mwstSatz / 100));
                    if (editingPosition) {
                      handleDialogChange('einzelpreis', wert);
                      handleDialogChange('bruttoPreis', bruttoPreis);
                    } else {
                      handleDialogChange('einzelpreis', wert);
                      handleDialogChange('bruttoPreis', bruttoPreis);
                    }
                  }
                }}
                fullWidth
                variant="outlined"
                InputProps={{ 
                  inputProps: { min: 0, step: 0.01 },
                  startAdornment: <Box component="span" mr={1}>€</Box>
                }}
                disabled={readOnly}
              />
            </Grid>

            {/* ... existing fields ... */}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Abbrechen
          </Button>
          <Button 
            onClick={editingIndex !== null ? handleSave : handleSaveNewPosition}
            variant="contained" 
            color="primary"
            disabled={
              (editingPosition && !editingPosition.artikelBezeichnung) || 
              (!editingPosition && !newPosition.artikelBezeichnung)
            }
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog für Chargenauswahl */}
      {selectedPositionIndex !== null && (
        <ChargenAuswahlDialog
          open={showChargenDialog}
          onClose={() => setShowChargenDialog(false)}
          onConfirm={handleApplyChargen}
          artikelId={positionen[selectedPositionIndex]?.artikelId || ''}
          artikelBezeichnung={positionen[selectedPositionIndex]?.artikelBezeichnung || ''}
          benötigteMenge={positionen[selectedPositionIndex]?.menge || 0}
          buchungsregel={positionen[selectedPositionIndex]?.buchungsregel}
          lagerplatz={positionen[selectedPositionIndex]?.lagerplatz}
        />
      )}
    </Box>
  );
};

// Hilfsfunktion, um zu prüfen, ob ein Datum in naher Zukunft liegt (MHD-Warnung)
const isDateNearExpiry = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  const daysUntilExpiry = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry >= 0 && daysUntilExpiry <= 30; // Warnung, wenn MHD in weniger als 30 Tagen
};

export default PositionenTabelle; 