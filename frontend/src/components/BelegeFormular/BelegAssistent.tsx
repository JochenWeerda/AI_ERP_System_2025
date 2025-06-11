import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  TextField,
  Button,
  CircularProgress,
  Tooltip,
  Chip
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Lightbulb as LightbulbIcon,
  Send as SendIcon,
  PriceCheck as PriceCheckIcon,
  Schedule as ScheduleIcon,
  LocalShipping as LocalShippingIcon,
  CreditScore as CreditScoreIcon,
  ShoppingBasket as ShoppingBasketIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

// Import für die Dienste
// import { requestAssistance } from '../../services/belegAssistentService';
// import { sendChatMessage } from '../../services/llmService';

// Interface für die Vorschläge
interface AssistantSuggestion {
  id: string;
  type: 'price' | 'delivery' | 'route' | 'payment' | 'order';
  title: string;
  description: string;
  value: string;
  confidence: number;
  icon: React.ReactNode;
}

// Interface für Chat-Nachrichten
interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

// Props für die Komponente
interface BelegAssistentProps {
  belegTyp: 'angebot' | 'auftrag' | 'lieferschein' | 'rechnung' | 'bestellung';
  belegDaten?: any;
  onSuggestionApply?: (suggestion: AssistantSuggestion) => void;
}

const BelegAssistent: React.FC<BelegAssistentProps> = ({
  belegTyp,
  belegDaten,
  onSuggestionApply
}) => {
  // State
  const [open, setOpen] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<AssistantSuggestion[]>([]);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Typspezifische Konfiguration
  const getAssistantConfig = () => {
    switch (belegTyp) {
      case 'angebot':
        return {
          title: 'Angebots-Assistent',
          description: 'KI-gestützte Empfehlungen für Ihr Angebot',
          suggestionTypes: ['price']
        };
      case 'auftrag':
        return {
          title: 'Auftrags-Assistent',
          description: 'KI-gestützte Empfehlungen für Ihren Auftrag',
          suggestionTypes: ['delivery']
        };
      case 'lieferschein':
        return {
          title: 'Lieferschein-Assistent',
          description: 'KI-gestützte Empfehlungen für Ihren Lieferschein',
          suggestionTypes: ['route']
        };
      case 'rechnung':
        return {
          title: 'Rechnungs-Assistent',
          description: 'KI-gestützte Empfehlungen für Ihre Rechnung',
          suggestionTypes: ['payment']
        };
      case 'bestellung':
        return {
          title: 'Bestellungs-Assistent',
          description: 'KI-gestützte Empfehlungen für Ihre Bestellung',
          suggestionTypes: ['order']
        };
      default:
        return {
          title: 'Beleg-Assistent',
          description: 'KI-gestützte Empfehlungen für Ihren Beleg',
          suggestionTypes: []
        };
    }
  };

  // Lade Vorschläge basierend auf dem Belegtyp
  useEffect(() => {
    if (open && belegDaten) {
      loadSuggestions();
    }
  }, [open, belegTyp, belegDaten]);

  // Hilfsfunktion zum Laden der Vorschläge
  const loadSuggestions = async () => {
    setLoading(true);
    try {
      // In einer realen Anwendung würde hier ein API-Aufruf erfolgen
      // const response = await requestAssistance(belegTyp, belegDaten);
      // setSuggestions(response.suggestions);
      
      // Mock-Daten für Demozwecke
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSuggestions: AssistantSuggestion[] = getMockSuggestions();
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Fehler beim Laden der Vorschläge:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock-Vorschläge je nach Belegtyp
  const getMockSuggestions = (): AssistantSuggestion[] => {
    switch (belegTyp) {
      case 'angebot':
        return [
          {
            id: '1',
            type: 'price',
            title: 'Optimaler Preis',
            description: 'Basierend auf Marktanalysen empfehlen wir einen Preis von 67,90 € pro Einheit',
            value: '67.90',
            confidence: 87,
            icon: <PriceCheckIcon />
          },
          {
            id: '2',
            type: 'price',
            title: 'Mengenrabatt',
            description: 'Ein Mengenrabatt von 5% ab 50 Stück könnte den Auftragswert steigern',
            value: '5',
            confidence: 75,
            icon: <PriceCheckIcon />
          }
        ];
      case 'auftrag':
        return [
          {
            id: '1',
            type: 'delivery',
            title: 'Optimaler Liefertermin',
            description: 'Der empfohlene Liefertermin unter Berücksichtigung aller Faktoren ist der 15.06.2024',
            value: '2024-06-15',
            confidence: 92,
            icon: <ScheduleIcon />
          }
        ];
      case 'lieferschein':
        return [
          {
            id: '1',
            type: 'route',
            title: 'Optimierte Route',
            description: 'Die optimale Route spart 12km und reduziert die Lieferzeit um ca. 20 Minuten',
            value: 'route_1',
            confidence: 88,
            icon: <LocalShippingIcon />
          }
        ];
      case 'rechnung':
        return [
          {
            id: '1',
            type: 'payment',
            title: 'Zahlungsprognose',
            description: 'Die voraussichtliche Zahlung erfolgt innerhalb von 12 Tagen mit 94% Wahrscheinlichkeit',
            value: '12',
            confidence: 94,
            icon: <CreditScoreIcon />
          }
        ];
      case 'bestellung':
        return [
          {
            id: '1',
            type: 'order',
            title: 'Bestellmenge optimieren',
            description: 'Die optimale Bestellmenge unter Berücksichtigung der Lagerkosten beträgt 150 Einheiten',
            value: '150',
            confidence: 85,
            icon: <ShoppingBasketIcon />
          }
        ];
      default:
        return [];
    }
  };

  // Chat-Nachricht senden
  const sendMessage = async () => {
    if (!userInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setChatLoading(true);
    
    try {
      // In einer realen Anwendung würde hier ein API-Aufruf erfolgen
      // const response = await sendChatMessage(userMessage.text, belegTyp, belegDaten);
      
      // Mock-Antwort für Demozwecke
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: getMockResponse(userInput, belegTyp),
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      
      // Fehlermeldung als Chat-Nachricht
      const errorMessage: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        sender: 'assistant',
        text: 'Entschuldigung, ich konnte Ihre Anfrage nicht verarbeiten. Bitte versuchen Sie es später erneut.',
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  // Mock-Antwort für den Chat
  const getMockResponse = (input: string, type: string): string => {
    const lowercaseInput = input.toLowerCase();
    
    if (lowercaseInput.includes('preis') || lowercaseInput.includes('rabatt')) {
      return 'Basierend auf den aktuellen Marktdaten und dem Kundenprofil empfehle ich einen Preis von 67,90 € pro Einheit. Dies liegt 3% über Ihren Kosten, ist aber noch konkurrenzfähig im aktuellen Marktumfeld.';
    }
    
    if (lowercaseInput.includes('lieferung') || lowercaseInput.includes('termin')) {
      return 'Für diesen Kunden empfehle ich einen Liefertermin am 15.06.2024. Dies berücksichtigt sowohl Ihre aktuelle Produktionsauslastung als auch die üblichen Lieferzeiten für diese Region.';
    }
    
    if (lowercaseInput.includes('zahlung') || lowercaseInput.includes('frist')) {
      return 'Basierend auf der Zahlungshistorie dieses Kunden erwarte ich eine Zahlung innerhalb von 12 Tagen, obwohl das Zahlungsziel bei 14 Tagen liegt. Die Wahrscheinlichkeit einer pünktlichen Zahlung liegt bei 94%.';
    }
    
    return `Ich habe Ihre Anfrage zu "${input}" erhalten. Als ${type}-Assistent kann ich Ihnen helfen, optimale Entscheidungen zu treffen. Was möchten Sie genauer wissen?`;
  };

  // Vorschlag anwenden
  const applySuggestion = (suggestion: AssistantSuggestion) => {
    if (onSuggestionApply) {
      onSuggestionApply(suggestion);
    }
  };

  // Konfiguration basierend auf dem Belegtyp
  const config = getAssistantConfig();

  return (
    <Box 
      sx={{ 
        position: 'fixed',
        right: open ? 0 : -340,
        top: 64,
        bottom: 0,
        width: 340,
        transition: 'right 0.3s ease-in-out',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Tab zum Öffnen/Schließen */}
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          left: -40,
          top: 20,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          cursor: 'pointer',
          p: 1
        }}
        onClick={() => setOpen(!open)}
      >
        <Tooltip title={open ? "Assistent schließen" : "Assistent öffnen"}>
          <IconButton size="small" color="primary">
            {open ? <CloseIcon /> : <AutoAwesomeIcon />}
          </IconButton>
        </Tooltip>
      </Paper>
      
      {/* Hauptpanel */}
      <Paper
        elevation={4}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AutoAwesomeIcon sx={{ mr: 1 }} />
            <Typography variant="h6">{config.title}</Typography>
          </Box>
          <IconButton size="small" color="inherit" onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* Beschreibung */}
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="body2" color="text.secondary">
            {config.description}
          </Typography>
        </Box>
        
        <Divider />
        
        {/* Hauptinhalt mit Vorschlägen */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Vorschläge-Sektion */}
          <Box sx={{ p: 1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 1,
                cursor: 'pointer'
              }}
              onClick={() => setExpanded(!expanded)}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <LightbulbIcon sx={{ mr: 1, color: 'warning.main' }} />
                Vorschläge
              </Typography>
              <IconButton size="small">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : suggestions.length > 0 ? (
                <List dense>
                  {suggestions.map(suggestion => (
                    <ListItem
                      key={suggestion.id}
                      sx={{
                        mb: 1,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      secondaryAction={
                        <Tooltip title="Vorschlag übernehmen">
                          <IconButton edge="end" onClick={() => applySuggestion(suggestion)}>
                            <AutoAwesomeIcon fontSize="small" color="primary" />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemIcon>
                        {suggestion.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {suggestion.title}
                            <Chip 
                              label={`${suggestion.confidence}%`} 
                              size="small" 
                              color={suggestion.confidence > 85 ? "success" : "warning"}
                              sx={{ ml: 1, height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
                            />
                          </Box>
                        }
                        secondary={suggestion.description}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Keine Vorschläge verfügbar.
                  </Typography>
                </Box>
              )}
            </Collapse>
          </Box>
          
          <Divider />
          
          {/* Chat-Sektion */}
          <Box sx={{ p: 1, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 1,
                cursor: 'pointer'
              }}
              onClick={() => setChatOpen(!chatOpen)}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <AutoAwesomeIcon sx={{ mr: 1, color: 'info.main' }} />
                KI-Assistent Chat
              </Typography>
              <IconButton size="small">
                {chatOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={chatOpen} timeout="auto" unmountOnExit sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Chat-Nachrichten */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1, mt: 1 }}>
                {chatMessages.length > 0 ? (
                  chatMessages.map(message => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                        mb: 1
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1,
                          maxWidth: '80%',
                          bgcolor: message.sender === 'user' ? 'primary.light' : 'background.default',
                          color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary'
                        }}
                      >
                        <Typography variant="body2">{message.text}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', textAlign: 'right', mt: 0.5 }}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Paper>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Stellen Sie eine Frage an den KI-Assistenten.
                    </Typography>
                  </Box>
                )}
                {chatLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                    <Paper sx={{ p: 1, bgcolor: 'background.default' }}>
                      <CircularProgress size={20} />
                    </Paper>
                  </Box>
                )}
              </Box>
              
              {/* Chat-Eingabe */}
              <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Frage an den Assistenten..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={chatLoading}
                  sx={{ mr: 1 }}
                />
                <IconButton 
                  color="primary" 
                  onClick={sendMessage} 
                  disabled={!userInput.trim() || chatLoading}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Collapse>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default BelegAssistent; 