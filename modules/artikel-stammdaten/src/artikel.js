/**
 * Modul für die Verwaltung von Artikeldaten
 * @module artikel-stammdaten/artikel
 */

// Abhängigkeiten importieren
const { logInfo, logError } = require('../../logging-service/src/index');
const { getConnection } = require('../../core-database/src/index');
const { convertUnit } = require('../../einheiten-service/src/index');

/**
 * Artikel-Klasse zur Repräsentation eines Artikels im System
 */
class Artikel {
  /**
   * Erstellt eine neue Artikel-Instanz
   * @param {Object} data - Artikeldaten
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.artikelnummer = data.artikelnummer || '';
    this.bezeichnung = data.bezeichnung || '';
    this.beschreibung = data.beschreibung || '';
    this.einheit = data.einheit || '';
    this.preis = data.preis || 0;
    this.waehrung = data.waehrung || 'EUR';
    this.kategorie = data.kategorie || '';
    this.lagerbestand = data.lagerbestand || 0;
    this.lieferant = data.lieferant || '';
    this.aktiv = data.aktiv !== undefined ? data.aktiv : true;
    this.erstelltAm = data.erstelltAm || new Date();
    this.geaendertAm = data.geaendertAm || new Date();
  }

  /**
   * Validiert die Artikeldaten
   * @returns {boolean} Validierungsergebnis
   */
  validate() {
    if (!this.artikelnummer || this.artikelnummer.trim() === '') {
      return false;
    }
    if (!this.bezeichnung || this.bezeichnung.trim() === '') {
      return false;
    }
    if (this.preis < 0) {
      return false;
    }
    return true;
  }

  /**
   * Wandelt den Artikel in ein JSON-Objekt um
   * @returns {Object} JSON-Darstellung
   */
  toJSON() {
    return {
      id: this.id,
      artikelnummer: this.artikelnummer,
      bezeichnung: this.bezeichnung,
      beschreibung: this.beschreibung,
      einheit: this.einheit,
      preis: this.preis,
      waehrung: this.waehrung,
      kategorie: this.kategorie,
      lagerbestand: this.lagerbestand,
      lieferant: this.lieferant,
      aktiv: this.aktiv,
      erstelltAm: this.erstelltAm,
      geaendertAm: this.geaendertAm
    };
  }
}

/**
 * ArtikelManager-Klasse zur Verwaltung von Artikeln
 */
class ArtikelManager {
  /**
   * Lädt einen Artikel anhand seiner ID
   * @param {string} id - Artikel-ID
   * @returns {Promise<Artikel>} Geladener Artikel
   */
  async getById(id) {
    try {
      logInfo('Lade Artikel mit ID: ' + id);
      const db = getConnection();
      const result = await db.execute('SELECT * FROM artikel WHERE id = ?', [id]);
      if (result.length === 0) {
        return null;
      }
      return new Artikel(result[0]);
    } catch (error) {
      logError('Fehler beim Laden des Artikels: ' + error.message);
      throw error;
    }
  }

  /**
   * Speichert einen Artikel
   * @param {Artikel} artikel - Zu speichernder Artikel
   * @returns {Promise<Artikel>} Gespeicherter Artikel
   */
  async save(artikel) {
    try {
      if (!artikel.validate()) {
        throw new Error('Artikel ist ungültig');
      }

      const db = getConnection();
      artikel.geaendertAm = new Date();

      if (!artikel.id) {
        artikel.erstelltAm = new Date();
        const result = await db.execute(
          'INSERT INTO artikel (artikelnummer, bezeichnung, beschreibung, einheit, preis, waehrung, kategorie, lagerbestand, lieferant, aktiv, erstellt_am, geaendert_am) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            artikel.artikelnummer,
            artikel.bezeichnung,
            artikel.beschreibung,
            artikel.einheit,
            artikel.preis,
            artikel.waehrung,
            artikel.kategorie,
            artikel.lagerbestand,
            artikel.lieferant,
            artikel.aktiv,
            artikel.erstelltAm,
            artikel.geaendertAm
          ]
        );
        artikel.id = result.insertId;
      } else {
        await db.execute(
          'UPDATE artikel SET artikelnummer = ?, bezeichnung = ?, beschreibung = ?, einheit = ?, preis = ?, waehrung = ?, kategorie = ?, lagerbestand = ?, lieferant = ?, aktiv = ?, geaendert_am = ? WHERE id = ?',
          [
            artikel.artikelnummer,
            artikel.bezeichnung,
            artikel.beschreibung,
            artikel.einheit,
            artikel.preis,
            artikel.waehrung,
            artikel.kategorie,
            artikel.lagerbestand,
            artikel.lieferant,
            artikel.aktiv,
            artikel.geaendertAm,
            artikel.id
          ]
        );
      }

      logInfo('Artikel gespeichert: ' + artikel.id);
      return artikel;
    } catch (error) {
      logError('Fehler beim Speichern des Artikels: ' + error.message);
      throw error;
    }
  }
}

// Singleton-Instanz exportieren
const artikelManager = new ArtikelManager();

module.exports = {
  Artikel,
  artikelManager
}; 