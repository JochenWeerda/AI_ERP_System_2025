# -*- coding: utf-8 -*-
{
    'name': 'VALEO Enterprise Suite',
    'version': '1.0',
    'category': 'Customizations',
    'summary': 'Enterprise-ähnliche Features für Odoo Community',
    'description': """
VALEO Enterprise Suite
=====================
Dieses Modul bietet Enterprise-ähnliche Features für die Odoo Community Edition.
Es integriert die bereits entwickelten containerisierten Module und fügt neue
Funktionalitäten hinzu, die normalerweise nur in der Enterprise-Version verfügbar sind.

Hauptfunktionen:
* Erweiterte Benutzeroberfläche
* KI-gestützte Analysen und Automatisierung
* Erweiterte Finanzfunktionen
* Integriertes Dokumentenmanagement
* E-Signatur-Funktionalität
* Erweiterte Personalfunktionen
* Marketing-Automatisierung
* Erweiterte Projektmanagement-Tools

Alle Funktionen sind vollständig in die Odoo-Oberfläche integriert und nutzen
die containerisierte Architektur von VALEO NeuroERP.
    """,
    'author': 'VALERO NeuroERP',
    'website': 'https://www.valero-neuroerp.com',
    'depends': [
        'base',
        'mail',
        'web',
        'module_framework',
    ],
    'data': [
        'security/valeo_security.xml',
        'security/ir.model.access.csv',
        'views/dashboard_views.xml',
        'views/menu_views.xml',
        'data/valeo_data.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'valeo_enterprise_suite/static/src/scss/valeo_styles.scss',
            'valeo_enterprise_suite/static/src/js/valeo_dashboard.js',
        ],
        'web.assets_qweb': [
            'valeo_enterprise_suite/static/src/xml/valeo_templates.xml',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
} 