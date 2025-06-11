import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Avatar, 
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import aiAssistantApi, { ChatMessage, SystemAction, ChatRequest, ChatResponse } from '../../api/aiAssistantApi';
import { v4 as uuidv4 } from 'uuid';

// Stil-Konstanten
const ASSISTANT_COLOR = '#f0f7ff';
const USER_COLOR = '#f5f5f5';

interface ChatAssistantProps {
  initialMessage?: string;
  containerHeight?: string | number;
  showHeader?: boolean;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({
  initialMessage = "Wie kann ich Ihnen helfen?",
  containerHeight = 500,
  showHeader = true
}) => {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(uuidv4());
  const [suggestedActions, setSuggestedActions] = useState<SystemAction[]>([]);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<SystemAction | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Beim ersten Rendering initiale Nachricht hinzufügen
  useEffect(() => {
    const initialSystemMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date().toISOString()
    };
    setMessages([initialSystemMessage]);
  }, [initialMessage]);

  // Auto-Scroll zum letzten Nachrichten-Element
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Nachricht senden
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      const request: ChatRequest = {
        message: input,
        session_id: sessionId
      };
      
      const response = await aiAssistantApi.sendChatMessage(request);
      
      setMessages(prev => [...prev, response.message]);
      setSuggestedActions(response.suggested_actions || []);
    } catch (error) {
      console.error("Fehler bei der Kommunikation mit dem KI-Assistenten:", error);
      
      // Fehlermeldung als Assistenten-Nachricht anzeigen
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: "Entschuldigung, ich konnte Ihre Anfrage nicht verarbeiten. Bitte versuchen Sie es später erneut.",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      
      // Fokus wieder auf Eingabefeld setzen
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Systemaktion ausführen
  const executeAction = async (action: SystemAction) => {
    setIsLoading(true);
    
    try {
      const result = await aiAssistantApi.executeSystemAction(action);
      
      // Aktionsausführung als Systemnachricht anzeigen
      const actionMessage: ChatMessage = {
        id: uuidv4(),
        role: 'system',
        content: `Aktion "${action.description}" wurde ausgeführt.`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, actionMessage]);
      
      // Ergebnisnachricht vom Assistenten
      const responseMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `Die Aktion wurde erfolgreich ausgeführt. ${result.status === 'success' 
          ? 'Hier ist das Ergebnis: ' + JSON.stringify(result.result, null, 2)
          : 'Es gab ein Problem bei der Ausführung: ' + result.message}`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error("Fehler bei der Ausführung der Systemaktion:", error);
      
      // Fehlermeldung als Assistenten-Nachricht anzeigen
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: "Entschuldigung, ich konnte die Aktion nicht ausführen. Bitte versuchen Sie es später erneut.",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setActionDialogOpen(false);
      setSelectedAction(null);
    }
  };

  // Handler für Aktions-Dialog
  const handleActionClick = (action: SystemAction) => {
    setSelectedAction(action);
    setActionDialogOpen(true);
  };

  // Tastatur-Handler für Eingabefeld
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format-Funktion für Zeitstempel
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: containerHeight, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2
      }}
    >
      {/* Header */}
      {showHeader && (
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #e0e0e0', 
          display: 'flex', 
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <SmartToyIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            KI-Assistent
          </Typography>
          <Chip 
            label="Online" 
            size="small" 
            sx={{ 
              bgcolor: 'success.main', 
              color: 'white',
              height: 24
            }} 
          />
        </Box>
      )}
      
      {/* Nachrichten-Container */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        p: 2,
        bgcolor: '#f9f9f9'
      }}>
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              mb: 2,
              alignItems: 'flex-start'
            }}
          >
            <Avatar
              sx={{
                bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                width: 36,
                height: 36,
                mr: msg.role === 'user' ? 0 : 1,
                ml: msg.role === 'user' ? 1 : 0
              }}
            >
              {msg.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
            </Avatar>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                maxWidth: '70%',
                borderRadius: 2,
                bgcolor: msg.role === 'user' ? USER_COLOR : ASSISTANT_COLOR,
                borderTopLeftRadius: msg.role === 'user' ? 2 : 0,
                borderTopRightRadius: msg.role === 'user' ? 0 : 2,
              }}
            >
              <Typography variant="body1">{msg.content}</Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  mt: 1, 
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                  color: 'text.secondary'
                }}
              >
                {formatTimestamp(msg.timestamp)}
              </Typography>
            </Paper>
          </Box>
        ))}
        
        {/* Lade-Animation während der Verarbeitung */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {/* Vorgeschlagene Aktionen anzeigen */}
        {suggestedActions.length > 0 && !isLoading && (
          <Box sx={{ mt: 2, mb: 1 }}>
            <Divider textAlign="center" sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Vorgeschlagene Aktionen
              </Typography>
            </Divider>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {suggestedActions.map((action) => (
                <Chip
                  key={action.id}
                  label={action.description}
                  onClick={() => handleActionClick(action)}
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          </Box>
        )}
        
        {/* Referenz für Auto-Scroll */}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Eingabebereich */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid #e0e0e0', 
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
      }}>
        <TextField
          fullWidth
          placeholder="Ihre Nachricht an den KI-Assistenten..."
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          inputRef={inputRef}
          multiline
          maxRows={3}
          sx={{ mr: 1 }}
          size="small"
          disabled={isLoading}
        />
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
        >
          Senden
        </Button>
      </Box>
      
      {/* Dialog für Aktionsbestätigung */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        aria-labelledby="action-dialog-title"
      >
        <DialogTitle id="action-dialog-title">Aktion bestätigen</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Möchten Sie die folgende Aktion ausführen?
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
            {selectedAction?.description}
          </Typography>
          
          {selectedAction && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Parameter:</Typography>
              <List dense>
                {Object.entries(selectedAction.parameters).map(([key, value]) => (
                  <ListItem key={key}>
                    <ListItemText
                      primary={`${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Abbrechen</Button>
          <Button 
            onClick={() => selectedAction && executeAction(selectedAction)} 
            variant="contained" 
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Ausführen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ChatAssistant; 