# -*- coding: utf-8 -*-
{
    'name': 'Model Context Protocol (MCP)',
    'version': '1.0.0',
    'category': 'Technical',
    'summary': 'Integration von KI-Modellen in VALEO NeuroERP',
    'description': """
Model Context Protocol (MCP)
===========================

Dieses Modul ermöglicht die nahtlose Integration von KI-Modellen mit dem ERP-System.

Funktionen:
----------
* Kontextualisierung: Automatische Bereitstellung von relevanten Geschäftsdaten als Kontext für KI-Modelle
* Standardisierte Schnittstellen: Einheitliche API für die Kommunikation mit verschiedenen KI-Anbietern
* Datenkonnektivität: Sichere Verbindungen zu KI-Modellen mit entsprechenden Authentifizierungs- und Autorisierungsmechanismen
* Prompt-Management: Verwaltung und Optimierung von Prompts für verschiedene Geschäftsprozesse
* Stammdaten-Migration: Import von Artikeln und Einheiten aus L3-Export
* Chargenverwaltung: Erweiterte Funktionen für Chargen mit Artikelkonto-Integration
* Partner-Integration: Erweiterte Funktionen für Partner mit L3-Stammdaten und CPD-Konten
* CPD-Konten: Erweiterte Funktionalität für Conto pro diverse-Konten mit automatischem Ausgleich
* KI-Analytics: Intelligente Berichte und Dashboards mit KI-generierter Analyse und Visualisierung
    """,
    'author': 'VALEO GmbH',
    'website': 'https://www.valeo-gmbh.de',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'web',
        'mail',
        'product',
        'uom',
        'stock',
        'account',
        'stock_account',
        'purchase',
    ],
    'data': [
        'security/mcp_security.xml',
        'security/ir.model.access.csv',
        'views/mcp_views.xml',
        'views/mcp_menus.xml',
        'views/mcp_dashboard.xml',
        'views/migration_views.xml',
        'views/stock_lot_views.xml',
        'views/product_views.xml',
        'views/stock_picking_views.xml',
        'views/res_partner_views.xml',
        'views/account_views.xml',
        'views/account_reporting_views.xml',
        'views/mcp_analytics_views.xml',
        'data/migration_mapping.xml',
        'data/connector_providers.xml',
        'data/context_generators_base.xml',
        'data/context_generators_sales.xml',
        'data/context_generators_accounting.xml',
        'data/context_generators_inventory.xml',
        'data/context_generators_manufacturing.xml',
        'data/context_generators_purchase.xml',
        'data/context_generators_project.xml',
        'data/context_generators_hr.xml',
        'data/context_generators_crm.xml',
        'data/scheduler_data.xml',
    ],
    'demo': [
        # Demo-Daten für Entwicklung und Tests
    ],
    'images': [
        'static/description/banner.png',
    ],
    'assets': {
        'web.assets_backend': [
            'mcp/static/src/js/**/*',
            'mcp/static/src/scss/**/*',
        ],
    },
    'external_dependencies': {
        'python': ['requests', 'openai', 'anthropic', 'pandas', 'numpy', 'scikit-learn'],
    },
    'application': True,
    'installable': True,
    'auto_install': False,
} 