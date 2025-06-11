/**
 * Utility-Funktionen für die Formatierung von Daten
 */

/**
 * Formatiert einen Betrag als Währung (EUR)
 * 
 * @param amount - Der zu formatierende Betrag
 * @returns Formatierter Währungsbetrag als String
 */
export const formatCurrency = (amount: number): string => {
  if (amount === undefined || amount === null) return '-';
  
  try {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  } catch (error) {
    console.error('Fehler bei der Währungsformatierung:', error);
    return '-';
  }
};

/**
 * Formatiert ein Unix-Timestamp als Datum
 * 
 * @param timestamp - Der Unix-Timestamp (in Millisekunden)
 * @returns Formatiertes Datum als String
 */
export const formatDate = (timestamp: number): string => {
  if (!timestamp) return '-';
  
  try {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Fehler bei der Datumsformatierung:', error);
    return '-';
  }
};

/**
 * Formatiert ein Unix-Timestamp als Datum mit Uhrzeit
 * 
 * @param timestamp - Der Unix-Timestamp (in Millisekunden)
 * @returns Formatiertes Datum mit Uhrzeit als String
 */
export const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Kürzt einen Text auf eine bestimmte Länge und fügt Auslassungspunkte hinzu
 * 
 * @param text - Der zu kürzende Text
 * @param maxLength - Die maximale Länge
 * @returns Gekürzter Text mit Auslassungspunkten
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Formatiert eine Menge mit Einheit
 * 
 * @param quantity - Die Menge
 * @param unit - Die Einheit (optional)
 * @returns Formatierte Menge mit Einheit
 */
export const formatQuantity = (quantity: number, unit?: string): string => {
  const formattedQuantity = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(quantity);
  
  return unit ? `${formattedQuantity} ${unit}` : formattedQuantity;
};

/**
 * Formatiert einen Prozentwert
 * @param value Der zu formatierende Wert (0.1 für 10%)
 * @param locale Die zu verwendende Locale (Standard: 'de-DE')
 * @returns Formatierter Prozentwert als String
 */
export const formatPercent = (
  value: number, 
  locale: string = 'de-DE'
): string => {
  if (value === undefined || value === null) return '-';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    }).format(value);
  } catch (error) {
    console.error('Fehler bei der Prozentformatierung:', error);
    return '-';
  }
};

/**
 * Formatiert eine Kontonummer mit führenden Nullen
 * @param accountNumber Die zu formatierende Kontonummer
 * @param length Die Zielgesamtlänge der Kontonummer (Standard: 4)
 * @returns Formatierte Kontonummer als String
 */
export const formatAccountNumber = (
  accountNumber: string | number, 
  length: number = 4
): string => {
  const strValue = accountNumber.toString();
  return strValue.padStart(length, '0');
};

/**
 * Formatiert einen Wert in einem einheitlichen Format für das Sortieren
 * @param value Der zu formatierende Wert
 * @returns Formatierter Wert als String
 */
export const formatForSorting = (value: any): string => {
  if (value == null) return '';
  
  if (typeof value === 'number') {
    return value.toString().padStart(20, '0');
  }
  
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  return String(value).toLowerCase();
};

/**
 * Formatiert eine Zahl mit einer bestimmten Anzahl von Nachkommastellen.
 * 
 * @param value Wert
 * @param decimalPlaces Anzahl der Nachkommastellen (Standard: 2)
 * @returns Formatierte Zahl
 */
export const formatNumber = (value: number, decimalPlaces: number = 2): string => {
  if (value === undefined || value === null) return '-';
  
  try {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).format(value);
  } catch (error) {
    console.error('Fehler bei der Zahlenformatierung:', error);
    return '-';
  }
}; 