# Modulabhängigkeiten im ERP-System

Dieses Dokument zeigt die Abhängigkeiten zwischen den verschiedenen Modulen des ERP-Systems.

## Übersicht der Hauptmodule

```mermaid
graph TD
    subgraph Kernmodule
        core-database[Core Database]
        auth-service[Authentication Service]
        logging-service[Logging Service]
    end
    
    subgraph Funktionsmodule
        einheiten-service[Einheiten Service]
        finance-core[Finance Core]
        artikel-stammdaten[Artikel Stammdaten]
    end
    
    %% Abhängigkeiten der Kernmodule
    auth-service --> core-database
    logging-service --> core-database
    
    %% Abhängigkeiten von Finance Core
    finance-core --> core-database
    finance-core --> auth-service
    finance-core --> logging-service
    
    %% Abhängigkeiten von Einheiten Service
    einheiten-service --> core-database
    einheiten-service --> auth-service
    einheiten-service --> logging-service
    
    %% Abhängigkeiten von Artikel Stammdaten
    artikel-stammdaten --> core-database
    artikel-stammdaten --> auth-service
    artikel-stammdaten --> logging-service
    artikel-stammdaten --> finance-core
    artikel-stammdaten --> einheiten-service
    
    %% Stil
    classDef core fill:#f9f,stroke:#333,stroke-width:2px
    classDef service fill:#bbf,stroke:#333,stroke-width:1px
    classDef module fill:#bfb,stroke:#333,stroke-width:1px
    
    class core-database,auth-service,logging-service core
    class einheiten-service,finance-core service
    class artikel-stammdaten module
```

## Detaillierte Abhängigkeiten des Artikelstammdaten-Moduls

```mermaid
graph TD
    artikel-stammdaten[Artikel Stammdaten]
    
    subgraph Abhängigkeiten
        core-database[Core Database ^2.0.0]
        auth-service[Authentication Service ^1.5.0]
        logging-service[Logging Service ~1.2.3]
        finance-core[Finance Core ^1.0.0]
        einheiten-service[Einheiten Service ^1.0.0]
    end
    
    artikel-stammdaten --> core-database
    artikel-stammdaten --> auth-service
    artikel-stammdaten --> logging-service
    artikel-stammdaten --> finance-core
    artikel-stammdaten --> einheiten-service
    
    subgraph Interne Module
        artikel[Artikel]
        artikelgruppen[Artikelgruppen]
        preise[Preise]
        einheiten[Einheiten]
        validators[Validators]
    end
    
    artikel-stammdaten --> artikel
    artikel-stammdaten --> artikelgruppen
    artikel-stammdaten --> preise
    artikel-stammdaten --> einheiten
    artikel-stammdaten --> validators
    
    %% Interne Abhängigkeiten
    artikel --> validators
    artikelgruppen --> validators
    preise --> validators
    preise --> finance-core
    einheiten --> validators
    einheiten --> einheiten-service
    
    %% Stil
    classDef main fill:#f96,stroke:#333,stroke-width:2px
    classDef dependency fill:#bbf,stroke:#333,stroke-width:1px
    classDef internal fill:#bfb,stroke:#333,stroke-width:1px
    
    class artikel-stammdaten main
    class core-database,auth-service,logging-service,finance-core,einheiten-service dependency
    class artikel,artikelgruppen,preise,einheiten,validators internal
```

## Versionskompatibilität

Die folgende Tabelle zeigt die Versionskompatibilität zwischen den Modulen:

| Modul | Version | Abhängigkeiten |
|-------|---------|----------------|
| core-database | 2.0.0 | - |
| auth-service | 1.5.0 | core-database ^2.0.0 |
| logging-service | 1.2.3 | core-database ^2.0.0 |
| finance-core | 1.0.0 | core-database ^2.0.0, auth-service ^1.5.0, logging-service ~1.2.3 |
| einheiten-service | 1.0.0 | core-database ^2.0.0, auth-service ^1.5.0, logging-service ~1.2.3 |
| artikel-stammdaten | 1.0.0 | core-database ^2.0.0, auth-service ^1.5.0, logging-service ~1.2.3, finance-core ^1.0.0, einheiten-service ^1.0.0 |

## Schnittstellenübersicht

Die folgende Tabelle zeigt die von den Modulen bereitgestellten Schnittstellen:

| Modul | Schnittstelle | Version | Beschreibung |
|-------|---------------|---------|--------------|
| finance-core | FinancialTransactionAPI | 1.0.0 | API für Finanztransaktionen |
| finance-core | AccountingAPI | 1.0.0 | API für Buchhaltungsfunktionen |
| artikel-stammdaten | ArtikelStammdatenAPI | 1.0.0 | API für die Verwaltung von Artikelstammdaten |
| artikel-stammdaten | ArtikelSucheAPI | 1.0.0 | API für die Suche nach Artikeln | 