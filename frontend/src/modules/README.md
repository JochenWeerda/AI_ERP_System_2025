# Modulare Frontend-Struktur

Diese Dokumentation beschreibt die modulare Struktur des Frontends unseres ERP-Systems.

## Überblick der Modulstruktur

Das Frontend ist in folgende Hauptmodule unterteilt:

```
src/
├── modules/                     # Hauptverzeichnis für Module
│   ├── belegfolge/              # Belegfolge-Module
│   │   ├── verkauf/             # Verkaufs-Belegarten
│   │   │   ├── AngeboteModule.tsx
│   │   │   ├── AuftraegeModule.tsx
│   │   │   ├── LieferscheineModule.tsx
│   │   │   └── RechnungenModule.tsx
│   │   ├── einkauf/             # Einkaufs-Belegarten
│   │   │   ├── BestellungenModule.tsx
│   │   │   ├── EingangslieferscheineModule.tsx
│   │   │   └── EingangsrechnungenModule.tsx
│   │   └── BelegfolgeModule.tsx # Hauptmodul für Belegfolge
│   │
│   ├── stammdaten/              # Stammdaten-Module
│   │   ├── artikel/             # Artikel-Stammdaten
│   │   │   ├── ArtikelStammdatenModule.tsx
│   │   │   └── ArtikelGruppenModule.tsx
│   │   ├── partner/             # Partner-Stammdaten
│   │   │   ├── PartnerStammdatenModule.tsx
│   │   │   ├── KundenModule.tsx
│   │   │   └── LieferantenModule.tsx
│   │   ├── cpd/                 # CPD-Konten Module
│   │   │   └── CPDKontenModule.tsx
│   │   ├── lager/               # Lager-Stammdaten
│   │   │   └── LagerStammdatenModule.tsx
│   │   └── StammdatenModule.tsx # Hauptmodul für Stammdaten
│   │
│   └── ... weitere Module ...
│
├── services/                    # Service-Schicht für API-Zugriffe
│   ├── belegfolge/              # Belegfolge-Services
│   │   └── BelegfolgeService.ts
│   ├── stammdaten/              # Stammdaten-Services
│   │   └── StammdatenService.ts
│   └── ... weitere Services ...
│
├── components/                  # Wiederverwendbare UI-Komponenten
├── pages/                       # Seiten-Komponenten
└── routes.tsx                   # Zentrale Routing-Konfiguration
```

## Entwurfsprinzipien

Die Modulstruktur folgt diesen Prinzipien:

1. **Modularer Aufbau**: Jedes Modul ist eigenständig und enthält alle benötigten Komponenten.
2. **Klare Trennung**: Module sind nach fachlichen Aspekten getrennt (Belegfolge, Stammdaten, etc.).
3. **Lazy Loading**: Module werden bei Bedarf geladen, um die initiale Ladezeit zu reduzieren.
4. **Service-Schicht**: Die Kommunikation mit dem Backend erfolgt über spezialisierte Services.

## Module und ihre Verantwortlichkeiten

### Belegfolge-Module

Das Belegfolge-Modul verwaltet alle dokumentenbasierten Geschäftsprozesse:

- **Verkauf**: Angebote, Aufträge, Lieferscheine, Rechnungen
- **Einkauf**: Bestellungen, Eingangslieferscheine, Eingangsrechnungen

Die Belegfolge folgt einem definierten Ablauf:
- **Verkauf**: Angebot → Auftrag → Lieferschein → Rechnung
- **Einkauf**: Bestellung → Eingangslieferschein → Eingangsrechnung

### Stammdaten-Module

Das Stammdaten-Modul verwaltet alle zentralen Daten des ERP-Systems:

- **Artikel**: Artikel, Artikelgruppen, Preise
- **Partner**: Kunden, Lieferanten, Kontakte
- **CPD-Konten**: Creditor-Debitor-Konten für Buchhaltung
- **Lager**: Lagerorte, Lagerbestände

## Erweiterungsrichtlinien

Beim Hinzufügen neuer Module oder Funktionalitäten sollten folgende Richtlinien beachtet werden:

1. **Modulgröße**: Module sollten nicht zu groß werden, bei Bedarf in Untermodule aufteilen.
2. **Konsistente Benennung**: Module mit dem Suffix "Module" benennen (z.B. `ArtikelStammdatenModule.tsx`).
3. **Service-Abstraktion**: Für jedes Modul einen entsprechenden Service erstellen.
4. **Lazy Loading**: Neue Module für Lazy Loading vorbereiten.
5. **Routing**: Neue Routen in `routes.tsx` registrieren.

## Entwicklungsworkflow

1. **Neues Modul erstellen**: Im entsprechenden Verzeichnis unter `modules/` erstellen.
2. **Service implementieren**: API-Dienste im `services/`-Verzeichnis implementieren.
3. **Routen einrichten**: Modul in `routes.tsx` registrieren.
4. **Testen**: Funktionalität und Navigation testen.

## Performance-Optimierung

Durch die modulare Struktur und Lazy Loading wird die Anwendung auch bei steigender Komplexität performant bleiben. Weitere Optimierungsmöglichkeiten:

- **Code-Splitting**: Automatisches Code-Splitting durch React.lazy und Suspense
- **Komponenten-Memoization**: React.memo für teure Berechnungen
- **Virtualisierte Listen**: Für lange Listen der Stammdaten 