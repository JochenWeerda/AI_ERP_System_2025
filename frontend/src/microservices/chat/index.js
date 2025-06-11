/**
 * Chat Microservice Module
 * Containerisiertes Modul für den Chat (intern, Kunden, VALERO KI)
 */

import { ModuleBase } from '../../framework/core/ModuleBase.js';
import { registerContainerModule } from '../../framework/examples/ModulContainer.js';
import { createStore } from '../../framework/core/StoreManager.js';

/**
 * Basisklasse für das Chat-Modul
 */
class ChatModule extends ModuleBase {
  static moduleName = 'chat-module';
  
  static template = `
    <div class="chat-module">
      <div class="module-header">
        <h2><t t-esc="props.title || 'Chat'"/></h2>
      </div>
      
      <div class="module-content">
        <div t-if="state.isLoading" class="loading-indicator">
          Daten werden geladen...
        </div>
        <div t-elif="state.error" class="error-message">
          <p>Fehler beim Laden der Daten:</p>
          <p><t t-esc="state.error"/></p>
          <button class="btn btn-secondary" t-on-click="onRefresh">Erneut versuchen</button>
        </div>
        
        <div t-else="" class="chat-container">
          <!-- Chat-Typ Auswahl -->
          <div class="chat-types">
            <button 
              t-foreach="state.chatTypes" 
              t-as="chatType" 
              t-key="chatType.id"
              t-att-class="{'chat-type-btn': true, 'active': state.activeChat === chatType.id}"
              t-on-click="() => onChatTypeChange(chatType.id)"
            >
              <span class="material-icons"><t t-esc="chatType.icon"/></span>
              <span class="chat-type-label"><t t-esc="chatType.label"/></span>
            </button>
          </div>
          
          <!-- Chat-Bereich -->
          <div class="chat-area">
            <!-- Kontaktliste -->
            <div class="contact-list">
              <div class="search-bar">
                <input type="text" placeholder="Suchen..." t-on-input="onSearch" class="search-input" />
              </div>
              
              <div class="contacts">
                <div 
                  t-foreach="getFilteredContacts()" 
                  t-as="contact" 
                  t-key="contact.id"
                  t-att-class="{'contact-item': true, 'active': state.activeContact === contact.id}"
                  t-on-click="() => onContactSelect(contact)"
                >
                  <div class="contact-avatar">
                    <span t-if="!contact.avatar" class="avatar-placeholder">
                      <t t-esc="getInitials(contact.name)"/>
                    </span>
                    <img t-else="" t-att-src="contact.avatar" alt="Avatar" />
                    <span t-if="contact.online" class="online-indicator"></span>
                  </div>
                  <div class="contact-info">
                    <div class="contact-name"><t t-esc="contact.name"/></div>
                    <div class="contact-status"><t t-esc="contact.status"/></div>
                  </div>
                  <div t-if="contact.unreadCount" class="unread-badge">
                    <t t-esc="contact.unreadCount"/>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Nachrichtenbereich -->
            <div class="message-area">
              <div t-if="!state.activeContact" class="no-chat-selected">
                <p>Wählen Sie einen Chat aus der Liste aus</p>
              </div>
              
              <template t-else="">
                <!-- Chat-Header -->
                <div class="chat-header">
                  <div class="chat-contact-info">
                    <div class="contact-avatar">
                      <span t-if="!getActiveContact().avatar" class="avatar-placeholder">
                        <t t-esc="getInitials(getActiveContact().name)"/>
                      </span>
                      <img t-else="" t-att-src="getActiveContact().avatar" alt="Avatar" />
                      <span t-if="getActiveContact().online" class="online-indicator"></span>
                    </div>
                    <div class="contact-details">
                      <div class="contact-name"><t t-esc="getActiveContact().name"/></div>
                      <div class="contact-status"><t t-esc="getActiveContact().status"/></div>
                    </div>
                  </div>
                  
                  <div class="chat-actions">
                    <button class="btn-icon" t-on-click="onOpenSettings">
                      <span class="material-icons">more_vert</span>
                    </button>
                  </div>
                </div>
                
                <!-- Nachrichtenverlauf -->
                <div class="message-history" t-ref="messageHistory">
                  <div 
                    t-foreach="getMessages()" 
                    t-as="message" 
                    t-key="message.id"
                    t-att-class="{'message-item': true, 'own-message': message.sender === 'self', 'ai-message': message.sender === 'ai'}"
                  >
                    <div class="message-content">
                      <div class="message-text"><t t-esc="message.text"/></div>
                      <div class="message-time"><t t-esc="formatTime(message.timestamp)"/></div>
                    </div>
                  </div>
                </div>
                
                <!-- Nachrichteneingabe -->
                <div class="message-input-area">
                  <input 
                    type="text" 
                    placeholder="Nachricht eingeben..." 
                    t-model="state.newMessage"
                    t-on-keyup="onMessageKeyUp"
                    class="message-input" 
                  />
                  <button 
                    class="send-button"
                    t-att-disabled="!state.newMessage.trim()"
                    t-on-click="onSendMessage"
                  >
                    <span class="material-icons">send</span>
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  setup() {
    // Store mit Basisdaten initialisieren
    this.store = createStore(`${this.props.moduleId}-store`, {
      isLoading: true,
      error: null,
      searchQuery: '',
      activeChat: 'intern',
      activeContact: null,
      newMessage: '',
      chatTypes: [
        { id: 'intern', label: 'Intern', icon: 'people' },
        { id: 'kunden', label: 'Kunden', icon: 'business' },
        { id: 'valero', label: 'VALERO KI', icon: 'smart_toy' }
      ],
      contacts: [],
      messages: {}
    });
    
    // State aus dem Store übernehmen
    this.state = this.useState(this.store.state);
    
    // Container-Store nutzen, falls vorhanden
    this.containerStore = this.props.containerStore;
    
    // API-Endpunkte aus den Props übernehmen
    this.apiEndpoints = this.props.apiEndpoints || {};
    
    // Initialisierung
    this.init();
  }
  
  async init() {
    await this.loadData();
    
    // Container-Event auslösen
    this.trigger('module-initialized', {
      moduleId: this.props.moduleId,
      timestamp: new Date().toISOString()
    });
  }
  
  async loadData() {
    try {
      this.store.update({ isLoading: true, error: null });
      
      // Daten vom Container oder API laden
      let chatData;
      
      if (this.containerStore?.state?.data?.chat) {
        // Daten aus dem Container-Store laden
        chatData = this.containerStore.state.data.chat;
      } else if (this.apiEndpoints.getChat) {
        // Daten von der API laden
        const response = await fetch(this.apiEndpoints.getChat);
        
        if (!response.ok) {
          throw new Error(`API-Anfrage fehlgeschlagen: ${response.statusText}`);
        }
        
        chatData = await response.json();
      } else {
        // Beispieldaten verwenden
        chatData = this.getExampleData();
      }
      
      this.store.update({ 
        ...chatData,
        isLoading: false 
      });
    } catch (error) {
      console.error('Fehler beim Laden der Chat-Daten:', error);
      this.store.update({ error: error.message, isLoading: false });
    }
  }
  
  getExampleData() {
    return {
      contacts: [
        {
          id: 'intern-1',
          name: 'Max Mustermann',
          status: 'Online',
          avatar: '',
          online: true,
          unreadCount: 2,
          type: 'intern'
        },
        {
          id: 'intern-2',
          name: 'Erika Musterfrau',
          status: 'In einem Meeting',
          avatar: '',
          online: true,
          unreadCount: 0,
          type: 'intern'
        },
        {
          id: 'kunden-1',
          name: 'Firma GmbH',
          status: 'Letzte Aktivität: Gestern',
          avatar: '',
          online: false,
          unreadCount: 0,
          type: 'kunden'
        },
        {
          id: 'valero-1',
          name: 'VALERO KI',
          status: 'Online',
          avatar: '',
          online: true,
          unreadCount: 0,
          type: 'valero'
        }
      ],
      messages: {
        'intern-1': [
          {
            id: 1,
            sender: 'other',
            text: 'Hallo, wie läuft das Projekt?',
            timestamp: '2023-06-01T10:30:00'
          },
          {
            id: 2,
            sender: 'self',
            text: 'Gut, wir sind im Zeitplan. Habe gerade die letzten Module implementiert.',
            timestamp: '2023-06-01T10:32:00'
          },
          {
            id: 3,
            sender: 'other',
            text: 'Super! Können wir morgen einen Termin machen um die Fortschritte zu besprechen?',
            timestamp: '2023-06-01T10:35:00'
          }
        ],
        'valero-1': [
          {
            id: 1,
            sender: 'self',
            text: 'Hallo VALERO, kannst du mir bei der Implementierung des Inventurmoduls helfen?',
            timestamp: '2023-06-01T11:30:00'
          },
          {
            id: 2,
            sender: 'ai',
            text: 'Natürlich kann ich dir helfen. Das Inventurmodul besteht aus drei Hauptkomponenten: Erfassung, Auswertung und Bestandsanpassung. Welchen Teil möchtest du zuerst implementieren?',
            timestamp: '2023-06-01T11:31:00'
          }
        ]
      }
    };
  }
  
  getFilteredContacts() {
    // Filter Kontakte basierend auf dem aktiven Chat-Typ und der Suche
    return this.state.contacts.filter(contact => {
      const matchesType = contact.type === this.state.activeChat;
      const matchesSearch = !this.state.searchQuery || 
                          contact.name.toLowerCase().includes(this.state.searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }
  
  getActiveContact() {
    if (!this.state.activeContact) return null;
    return this.state.contacts.find(contact => contact.id === this.state.activeContact) || null;
  }
  
  getMessages() {
    if (!this.state.activeContact) return [];
    return this.state.messages[this.state.activeContact] || [];
  }
  
  getInitials(name) {
    if (!name) return '';
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
  onChatTypeChange(chatType) {
    this.store.update({ 
      activeChat: chatType,
      activeContact: null 
    });
  }
  
  onSearch(event) {
    this.store.update({ searchQuery: event.target.value });
  }
  
  onContactSelect(contact) {
    this.store.update({ activeContact: contact.id });
    
    // Nachrichtenverlauf scrollen
    this.nextTick(() => {
      const historyEl = this.refs.messageHistory;
      if (historyEl) {
        historyEl.scrollTop = historyEl.scrollHeight;
      }
    });
  }
  
  onMessageKeyUp(event) {
    if (event.key === 'Enter') {
      this.onSendMessage();
    }
  }
  
  onSendMessage() {
    const message = this.state.newMessage.trim();
    if (!message || !this.state.activeContact) return;
    
    // Neue Nachricht erstellen
    const newMessage = {
      id: Date.now(),
      sender: 'self',
      text: message,
      timestamp: new Date().toISOString()
    };
    
    // Nachricht zum Chat hinzufügen
    const contactId = this.state.activeContact;
    const currentMessages = this.state.messages[contactId] || [];
    
    this.store.update({
      messages: {
        ...this.state.messages,
        [contactId]: [...currentMessages, newMessage]
      },
      newMessage: ''
    });
    
    // Nachrichtenverlauf scrollen
    this.nextTick(() => {
      const historyEl = this.refs.messageHistory;
      if (historyEl) {
        historyEl.scrollTop = historyEl.scrollHeight;
      }
    });
    
    // Bei VALERO KI eine automatische Antwort generieren
    if (contactId === 'valero-1') {
      setTimeout(() => {
        const aiResponse = {
          id: Date.now(),
          sender: 'ai',
          text: 'Ich verarbeite deine Anfrage und werde dir gleich helfen. Einen Moment bitte...',
          timestamp: new Date().toISOString()
        };
        
        const updatedMessages = this.state.messages[contactId] || [];
        
        this.store.update({
          messages: {
            ...this.state.messages,
            [contactId]: [...updatedMessages, aiResponse]
          }
        });
        
        // Nachrichtenverlauf scrollen
        this.nextTick(() => {
          const historyEl = this.refs.messageHistory;
          if (historyEl) {
            historyEl.scrollTop = historyEl.scrollHeight;
          }
        });
      }, 1000);
    }
  }
  
  onOpenSettings() {
    console.log('Chat-Einstellungen öffnen');
    // Hier könnte ein Dialog oder eine neue Ansicht geöffnet werden
  }
  
  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }
  
  onRefresh() {
    this.loadData();
  }
}

// Modul für Container-Verwendung registrieren
registerContainerModule('chat-module', ChatModule, {
  title: 'Chat',
  description: 'Chat (intern, Kunden, VALERO KI)',
  version: '1.0.0',
  apiEndpoints: {
    getChat: '/api/modules/chat/data',
    sendMessage: '/api/modules/chat/send',
    getContacts: '/api/modules/chat/contacts'
  }
});

// CSS-Stylesheet für das Modul
const style = document.createElement('style');
style.textContent = `
  .chat-module {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .module-header {
    padding: 16px;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .module-header h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #2d3748;
  }
  
  .module-content {
    flex: 1;
    padding: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  
  .chat-types {
    display: flex;
    background-color: #f7fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .chat-type-btn {
    padding: 12px 16px;
    background: none;
    border: none;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #4a5568;
    font-weight: 500;
    cursor: pointer;
    position: relative;
  }
  
  .chat-type-btn:hover {
    background-color: #edf2f7;
  }
  
  .chat-type-btn.active {
    color: #4299e1;
    background-color: #ebf8ff;
  }
  
  .chat-type-btn.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background-color: #4299e1;
  }
  
  .chat-area {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  .contact-list {
    width: 300px;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
  }
  
  .search-bar {
    padding: 12px;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .contacts {
    flex: 1;
    overflow-y: auto;
  }
  
  .contact-item {
    display: flex;
    align-items: center;
    padding: 12px;
    cursor: pointer;
    border-bottom: 1px solid #f7fafc;
    position: relative;
  }
  
  .contact-item:hover {
    background-color: #f7fafc;
  }
  
  .contact-item.active {
    background-color: #ebf8ff;
  }
  
  .contact-avatar {
    position: relative;
    margin-right: 12px;
  }
  
  .avatar-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    background-color: #4299e1;
    color: white;
    border-radius: 50%;
    font-weight: 600;
  }
  
  .online-indicator {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    background-color: #48bb78;
    border-radius: 50%;
    border: 2px solid white;
  }
  
  .contact-info {
    flex: 1;
    overflow: hidden;
  }
  
  .contact-name {
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .contact-status {
    font-size: 12px;
    color: #718096;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .unread-badge {
    background-color: #4299e1;
    color: white;
    font-size: 12px;
    font-weight: 600;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 6px;
  }
  
  .message-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .no-chat-selected {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #718096;
    background-color: #f7fafc;
  }
  
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .chat-contact-info {
    display: flex;
    align-items: center;
  }
  
  .contact-details {
    margin-left: 12px;
  }
  
  .chat-actions {
    display: flex;
  }
  
  .message-history {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .message-item {
    max-width: 70%;
    display: flex;
  }
  
  .message-item.own-message {
    align-self: flex-end;
  }
  
  .message-item.ai-message .message-content {
    background-color: #ebf8ff;
    border-color: #bee3f8;
  }
  
  .message-content {
    background-color: #f7fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 12px;
    position: relative;
  }
  
  .message-item.own-message .message-content {
    background-color: #ebf8ff;
    border-color: #bee3f8;
  }
  
  .message-text {
    color: #2d3748;
    margin-bottom: 4px;
    word-break: break-word;
  }
  
  .message-time {
    font-size: 11px;
    color: #718096;
    text-align: right;
  }
  
  .message-input-area {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-top: 1px solid #e2e8f0;
  }
  
  .message-input {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    font-size: 14px;
    margin-right: 8px;
  }
  
  .send-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    background-color: #4299e1;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
  }
  
  .send-button:disabled {
    background-color: #cbd5e0;
    cursor: not-allowed;
  }
  
  .btn-icon {
    background: none;
    border: none;
    color: #4a5568;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
  }
  
  .btn-icon:hover {
    background-color: #edf2f7;
  }
  
  .loading-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #718096;
  }
  
  .error-message {
    padding: 16px;
    background-color: #fed7d7;
    color: #742a2a;
    border-radius: 8px;
    margin-bottom: 16px;
  }
  
  @media (max-width: 768px) {
    .chat-area {
      flex-direction: column;
    }
    
    .contact-list {
      width: 100%;
      height: 300px;
      border-right: none;
      border-bottom: 1px solid #e2e8f0;
    }
  }
`;

document.head.appendChild(style);

// Für die Verwendung in anderen Modulen exportieren
export default ChatModule;
