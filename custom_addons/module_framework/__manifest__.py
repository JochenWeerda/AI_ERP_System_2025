# -*- coding: utf-8 -*-
{
    'name': 'Modulframework',
    'version': '1.0',
    'category': 'Customizations',
    'summary': 'Wiederverwendbares Modulframework für ERP-Erweiterungen',
    'description': """
Modulframework
=============
Dieses Modul bietet ein wiederverwendbares Framework, das als Basis für 
benutzerdefinierte Entwicklungen dienen kann. Es folgt der Odoo-Architektur 
und enthält:

* Basismodelle mit Vererbungsmechanismen
* Framework für Benutzeroberflächen
* Integrierte Sicherheitskonzepte
* Standardisierte API-Schnittstellen
* Vorlagen für Berichte und Wizards

Einfach zu erweitern und anzupassen für spezifische Geschäftsanforderungen.
    """,
    'author': 'VALERO NeuroERP',
    'website': 'https://www.valero-neuroerp.com',
    'depends': [
        'base',
        'mail',
        'web',
    ],
    'data': [
        'security/module_security.xml',
        'security/ir.model.access.csv',
        'views/module_views.xml',
        'views/module_templates.xml',
        'views/menu_views.xml',
        'data/module_data.xml',
        'wizards/module_wizard_views.xml',
        'reports/module_report_templates.xml',
        'reports/module_reports.xml',
    ],
    'demo': [
        'demo/module_demo.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'module_framework/static/src/scss/module_styles.scss',
            'module_framework/static/src/js/module_widget.js',
        ],
        'web.assets_qweb': [
            'module_framework/static/src/xml/module_templates.xml',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
} 