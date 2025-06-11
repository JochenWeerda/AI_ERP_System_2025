import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Tab,
  Tabs,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Class as ClassIcon,
  AccountTree as AccountTreeIcon,
  Link as LinkIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  DataObject as DataObjectIcon
} from '@mui/icons-material';

// Typdefinitionen für die Ontologie
interface OntologyClass {
  id: string;
  name: string;
  description?: string;
  superClasses: string[];
  properties: OntologyProperty[];
}

interface OntologyProperty {
  id: string;
  name: string;
  description?: string;
  domain?: string;
  range?: string;
  type: 'ObjectProperty' | 'DataProperty' | 'AnnotationProperty';
}

interface OntologyData {
  id: string;
  name: string;
  description?: string;
  classes: OntologyClass[];
  properties: OntologyProperty[];
  imports: string[];
}

// TabPanel-Komponente für die Tab-Ansichten
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ontology-tabpanel-${index}`}
      aria-labelledby={`ontology-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Hauptkomponente für die Ontologie-Visualisierung
interface OntologyViewerProps {
  ontologyId?: string;
  onError?: (error: Error) => void;
}

const OntologyViewer: React.FC<OntologyViewerProps> = ({ ontologyId, onError }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [ontology, setOntology] = useState<OntologyData | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
  const [expandedProperties, setExpandedProperties] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Laden der Ontologie-Daten
  useEffect(() => {
    const fetchOntologyData = async () => {
      try {
        setLoading(true);
        // In einer realen Anwendung würde hier ein API-Aufruf stattfinden
        // z.B. const response = await axios.get(`/api/v1/ontologies/${ontologyId}`);
        
        // Für Demozwecke verwenden wir Beispieldaten
        const mockOntologyData: OntologyData = {
          id: ontologyId || 'erp-ontology',
          name: 'ERP System Ontology',
          description: 'Eine Ontologie zur semantischen Beschreibung von ERP-Systemen und deren Komponenten.',
          classes: [
            {
              id: 'Customer',
              name: 'Kunde',
              description: 'Repräsentiert einen Kunden im ERP-System.',
              superClasses: ['BusinessPartner'],
              properties: [
                { id: 'hasOrder', name: 'hat Bestellung', type: 'ObjectProperty' },
                { id: 'hasInvoice', name: 'hat Rechnung', type: 'ObjectProperty' }
              ]
            },
            {
              id: 'Supplier',
              name: 'Lieferant',
              description: 'Repräsentiert einen Lieferanten im ERP-System.',
              superClasses: ['BusinessPartner'],
              properties: [
                { id: 'providesProduct', name: 'liefert Produkt', type: 'ObjectProperty' },
                { id: 'hasDelivery', name: 'hat Lieferung', type: 'ObjectProperty' }
              ]
            },
            {
              id: 'BusinessPartner',
              name: 'Geschäftspartner',
              description: 'Oberklasse für alle Geschäftspartner im ERP-System.',
              superClasses: [],
              properties: [
                { id: 'hasAddress', name: 'hat Adresse', type: 'ObjectProperty' },
                { id: 'hasContactPerson', name: 'hat Kontaktperson', type: 'ObjectProperty' },
                { id: 'name', name: 'Name', type: 'DataProperty' },
                { id: 'taxId', name: 'Steuernummer', type: 'DataProperty' }
              ]
            },
            {
              id: 'Product',
              name: 'Produkt',
              description: 'Repräsentiert ein Produkt im ERP-System.',
              superClasses: [],
              properties: [
                { id: 'hasCategory', name: 'hat Kategorie', type: 'ObjectProperty' },
                { id: 'name', name: 'Name', type: 'DataProperty' },
                { id: 'price', name: 'Preis', type: 'DataProperty' },
                { id: 'sku', name: 'Artikelnummer', type: 'DataProperty' }
              ]
            },
            {
              id: 'Order',
              name: 'Bestellung',
              description: 'Repräsentiert eine Bestellung im ERP-System.',
              superClasses: ['Document'],
              properties: [
                { id: 'hasOrderItem', name: 'hat Bestellposition', type: 'ObjectProperty' },
                { id: 'placedBy', name: 'aufgegeben von', type: 'ObjectProperty' },
                { id: 'orderDate', name: 'Bestelldatum', type: 'DataProperty' },
                { id: 'orderNumber', name: 'Bestellnummer', type: 'DataProperty' }
              ]
            }
          ],
          properties: [
            {
              id: 'hasAddress',
              name: 'hat Adresse',
              description: 'Verknüpft einen Geschäftspartner mit seiner Adresse.',
              domain: 'BusinessPartner',
              range: 'Address',
              type: 'ObjectProperty'
            },
            {
              id: 'hasOrder',
              name: 'hat Bestellung',
              description: 'Verknüpft einen Kunden mit seiner Bestellung.',
              domain: 'Customer',
              range: 'Order',
              type: 'ObjectProperty'
            },
            {
              id: 'providesProduct',
              name: 'liefert Produkt',
              description: 'Verknüpft einen Lieferanten mit den Produkten, die er liefert.',
              domain: 'Supplier',
              range: 'Product',
              type: 'ObjectProperty'
            },
            {
              id: 'name',
              name: 'Name',
              description: 'Der Name einer Entität.',
              type: 'DataProperty'
            },
            {
              id: 'price',
              name: 'Preis',
              description: 'Der Preis eines Produkts.',
              domain: 'Product',
              type: 'DataProperty'
            }
          ],
          imports: [
            'http://www.w3.org/2004/02/skos/core',
            'http://schema.org/'
          ]
        };
        
        // Kurze Verzögerung für Demo-Zwecke
        setTimeout(() => {
          setOntology(mockOntologyData);
          setLoading(false);
        }, 1000);
        
      } catch (err: any) {
        console.error('Fehler beim Laden der Ontologie:', err);
        const error = new Error(err.message || 'Fehler beim Laden der Ontologie');
        setError(error);
        if (onError) {
          onError(error);
        }
        setLoading(false);
      }
    };
    
    fetchOntologyData();
  }, [ontologyId, onError]);
  
  // Tab-Wechsel-Handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Toggle für Klassen-Expansion
  const toggleClassExpansion = (classId: string) => {
    setExpandedClasses(prev => ({
      ...prev,
      [classId]: !prev[classId]
    }));
  };
  
  // Toggle für Property-Expansion
  const togglePropertyExpansion = (propertyId: string) => {
    setExpandedProperties(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId]
    }));
  };
  
  // Such-Handler
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Filtern der Klassen nach Suchbegriff
  const filteredClasses = ontology?.classes.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  // Filtern der Properties nach Suchbegriff
  const filteredProperties = ontology?.properties.filter(prop => 
    prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  // Rendering der Klassen-Liste
  const renderClassList = () => {
    if (filteredClasses.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Keine Klassen gefunden, die dem Suchbegriff entsprechen.
        </Typography>
      );
    }
    
    return (
      <List>
        {filteredClasses.map(cls => (
          <React.Fragment key={cls.id}>
            <ListItem button onClick={() => toggleClassExpansion(cls.id)}>
              <ListItemIcon>
                <ClassIcon />
              </ListItemIcon>
              <ListItemText 
                primary={cls.name} 
                secondary={cls.id}
              />
              {expandedClasses[cls.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItem>
            <Collapse in={expandedClasses[cls.id]} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                {cls.description && (
                  <Typography variant="body2" paragraph>
                    {cls.description}
                  </Typography>
                )}
                
                {cls.superClasses.length > 0 && (
                  <>
                    <Typography variant="subtitle2">Oberklassen:</Typography>
                    <List dense>
                      {cls.superClasses.map(superClass => (
                        <ListItem key={superClass}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <AccountTreeIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={superClass} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                
                {cls.properties.length > 0 && (
                  <>
                    <Typography variant="subtitle2">Properties:</Typography>
                    <List dense>
                      {cls.properties.map(prop => (
                        <ListItem key={prop.id}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {prop.type === 'ObjectProperty' ? 
                              <LinkIcon fontSize="small" /> : 
                              <DataObjectIcon fontSize="small" />
                            }
                          </ListItemIcon>
                          <ListItemText 
                            primary={prop.name} 
                            secondary={prop.id}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Box>
            </Collapse>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    );
  };
  
  // Rendering der Property-Liste
  const renderPropertyList = () => {
    if (filteredProperties.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Keine Properties gefunden, die dem Suchbegriff entsprechen.
        </Typography>
      );
    }
    
    return (
      <List>
        {filteredProperties.map(prop => (
          <React.Fragment key={prop.id}>
            <ListItem button onClick={() => togglePropertyExpansion(prop.id)}>
              <ListItemIcon>
                {prop.type === 'ObjectProperty' ? 
                  <LinkIcon /> : 
                  <DataObjectIcon />
                }
              </ListItemIcon>
              <ListItemText 
                primary={prop.name} 
                secondary={`${prop.id} (${prop.type})`}
              />
              {expandedProperties[prop.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItem>
            <Collapse in={expandedProperties[prop.id]} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                {prop.description && (
                  <Typography variant="body2" paragraph>
                    {prop.description}
                  </Typography>
                )}
                
                <List dense>
                  {prop.domain && (
                    <ListItem>
                      <ListItemText 
                        primary="Domain" 
                        secondary={prop.domain}
                        primaryTypographyProps={{ variant: 'subtitle2' }}
                      />
                    </ListItem>
                  )}
                  {prop.range && (
                    <ListItem>
                      <ListItemText 
                        primary="Range" 
                        secondary={prop.range}
                        primaryTypographyProps={{ variant: 'subtitle2' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Collapse>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    );
  };
  
  // Rendering der Übersichtsseite
  const renderOverview = () => {
    if (!ontology) return null;
    
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          {ontology.name}
        </Typography>
        
        {ontology.description && (
          <Typography variant="body1" paragraph>
            {ontology.description}
          </Typography>
        )}
        
        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Statistik
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Paper sx={{ p: 2, minWidth: 200 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Klassen
              </Typography>
              <Typography variant="h4">
                {ontology.classes.length}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, minWidth: 200 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Properties
              </Typography>
              <Typography variant="h4">
                {ontology.properties.length}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, minWidth: 200 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Importierte Ontologien
              </Typography>
              <Typography variant="h4">
                {ontology.imports.length}
              </Typography>
            </Paper>
          </Box>
        </Box>
        
        {ontology.imports.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Importierte Ontologien
            </Typography>
            <List>
              {ontology.imports.map(imp => (
                <ListItem key={imp}>
                  <ListItemIcon>
                    <ImportIcon />
                  </ListItemIcon>
                  <ListItemText primary={imp} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    );
  };
  
  // Wenn die Daten geladen werden, zeige Ladeanzeige
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Wenn ein Fehler aufgetreten ist, zeige Fehlermeldung
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          Fehler beim Laden der Ontologie
        </Typography>
        <Typography color="error" variant="body2">
          {error.message}
        </Typography>
      </Box>
    );
  }
  
  // Wenn keine Ontologie geladen wurde, zeige Hinweis
  if (!ontology) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1">
          Keine Ontologie ausgewählt.
        </Typography>
      </Box>
    );
  }
  
  // Rendering der Hauptkomponente
  return (
    <Paper sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="ontology viewer tabs"
          variant="fullWidth"
        >
          <Tab label="Übersicht" id="ontology-tab-0" aria-controls="ontology-tabpanel-0" />
          <Tab label="Klassen" id="ontology-tab-1" aria-controls="ontology-tabpanel-1" />
          <Tab label="Properties" id="ontology-tab-2" aria-controls="ontology-tabpanel-2" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        {renderOverview()}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Klassen suchen..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {renderClassList()}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Properties suchen..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {renderPropertyList()}
      </TabPanel>
    </Paper>
  );
};

// Icon für importierte Ontologien
const ImportIcon = () => <InfoIcon />;

export default OntologyViewer;