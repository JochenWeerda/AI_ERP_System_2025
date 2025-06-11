# CSS-Designrichtlinien für OWL-Framework-Module

## Übersicht

Diese Dokumentation enthält Richtlinien zur CSS-Gestaltung von OWL-Framework-Modulen und analysiert, welche CSS-Eigenschaften vom Browser übernommen werden können und welche explizit definiert werden sollten.

## Browserübergreifende Standardwerte

Die folgenden CSS-Standardwerte werden normalerweise vom Browser übernommen und müssen nicht explizit definiert werden, es sei denn, sie sollen überschrieben werden:

### Schrift und Typografie

- **font-family**: Die Standardschriftart des Browsers (meist sans-serif)
- **font-size**: Standardgröße für Text (meist 16px)
- **line-height**: Standardzeilenhöhe (ca. 1.2)
- **font-weight**: Normale Schriftstärke (400)
- **text-align**: Links ausgerichteter Text

### Box-Modell

- **box-sizing**: Standardmäßig `content-box` (ohne explizites Reset)
- **margin**: 0 für die meisten Elemente (außer p, h1-h6, etc.)
- **padding**: 0 für die meisten Elemente (außer Formularelemente)
- **border**: Keine Rahmenlinie für die meisten Elemente

### Elemente

1. **Überschriften (h1-h6)**:
   - Standardmäßige Schriftgrößen und Abstände
   - Fettgedruckt (font-weight: bold)

2. **Absätze (p)**:
   - Standardabstände oben und unten
   - Normale Schriftstärke

3. **Formularelemente**:
   - **input, select, textarea**:
     - Standardformatierung mit leichtem Padding
     - Systemeigene Rahmen (Browser-spezifisch)
   - **button**:
     - Standardformatierung mit leichtem Padding
     - Systemeigene Rahmen und Hintergrund

4. **Links (a)**:
   - Unterstrichener Text
   - Standardlinkfarbe des Browsers

## Was explizit definiert werden sollte

Folgende Elemente sollten im OWL-Framework-CSS explizit definiert werden:

### Allgemeine Einstellungen

1. **Einheitliche Box-Modell-Berechnung**:
   ```css
   * {
     box-sizing: border-box;
   }
   ```

2. **Grundlegende Typografie**:
   ```css
   body {
     font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
     font-size: 16px;
     line-height: 1.5;
     color: #333;
   }
   ```

3. **Konsistente Marginresets**:
   ```css
   body, h1, h2, h3, h4, h5, h6, p, ul, ol, dl, figure {
     margin: 0;
     padding: 0;
   }
   ```

### Module und Komponenten

1. **Modulcontainer**:
   - Explizite Breite, Höhe und Positionierung
   - Hintergrundfarbe und Rahmen
   - Schatten und Rundungen

2. **Interaktive Elemente**:
   - Konsistente Hover- und Fokuszustände
   - Aktive und deaktivierte Zustände
   - Übergänge und Animationen

3. **Layoutraster**:
   - Flexbox oder Grid für konsistentes Layout
   - Abstände zwischen Elementen
   - Responsives Verhalten

## Analyseergebnisse aus Tests

Die automatisierten Tests erfassen die folgenden CSS-Eigenschaften und deren Browser-Standardwerte:

### Container-Elemente

- **Display**: Block
- **Position**: Static
- **Box-Sizing**: Content-box (ohne Reset)
- **Margin**: 0
- **Padding**: 0
- **Width/Height**: Auto

### Text-Elemente

- **Überschriften**: 
  - Größe variiert nach Hierarchie (h1 größer als h2, etc.)
  - Fette Schriftstärke
  - Marginabstände oben und unten

- **Absätze**:
  - Normaler Schriftschnitt
  - Standardabstände oben und unten

### Formularelemente

- **Buttons**:
  - Browser-spezifisches Erscheinungsbild
  - Leichtes Padding
  - Systemeigene Rahmen

- **Eingabefelder**:
  - Browser-spezifisches Erscheinungsbild
  - Leichtes Padding
  - Systemeigene Rahmen

## Interaktive Zustände

Interaktive Zustände wie Hover, Focus, Active und Visited sind stark browserabhängig und sollten im Framework vereinheitlicht werden:

### Hover-Zustand

Für Buttons und interaktive Elemente:
```css
.btn:hover, .interactive:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}
```

### Fokus-Zustand

Für fokussierbare Elemente:
```css
.btn:focus, input:focus, select:focus, textarea:focus {
  outline: 2px solid #4a90e2;
  outline-offset: 2px;
}
```

## Best Practices für Module

1. **Kapseln Sie Module mit BEM-Methodologie**:
   ```css
   .module-name {}
   .module-name__element {}
   .module-name--modifier {}
   ```

2. **Verwenden Sie CSS-Variablen für Wiederverwendbarkeit**:
   ```css
   :root {
     --primary-color: #4a90e2;
     --spacing-unit: 8px;
     --border-radius: 4px;
   }
   ```

3. **Minimieren Sie die Spezifität von Selektoren**:
   - Vermeiden Sie ID-Selektoren (#id)
   - Begrenzen Sie die Verschachtelungstiefe
   - Verwenden Sie Klassenselektoren (.class)

4. **Implementieren Sie responsives Design**:
   ```css
   @media (max-width: 768px) {
     .module-container {
       flex-direction: column;
     }
   }
   ```

## Implementierungshinweise

Bei der Implementierung des OWL-Framework-CSS:

1. **Erstellen Sie ein Reset/Normalisierungs-Stylesheet**
2. **Definieren Sie Grundlegende Variablen für Design-Tokens**
3. **Implementieren Sie eine Komponentenbibliothek**
4. **Dokumentieren Sie CSS-Klassen und Verwendung**

## Automatische Analysetests

Das Framework enthält automatisierte Tests, um die Browser-Standardwerte zu analysieren. Diese Tests können ausgeführt werden, um neue Browser oder Umgebungen zu evaluieren.

Die Ergebnisse werden im localStorage unter dem Schlüssel `module-base-css-analysis` gespeichert und können für Dokumentationszwecke verwendet werden.

### Testausführung

```javascript
// Führt die CSS-Analysetests aus
npm test -- -t "ModuleBase CSS-Analyse"
```

### Extrahieren der Ergebnisse

```javascript
// Extrahiert die gespeicherten CSS-Analyseergebnisse
const cssAnalysis = JSON.parse(localStorage.getItem('module-base-css-analysis'));
console.log(cssAnalysis);
```
