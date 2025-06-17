# -*- coding: utf-8 -*-
{
    'name': 'Landwirtschaftliche Stammdaten',
    'version': '1.0',
    'category': 'Agriculture',
    'summary': 'Verwaltung landwirtschaftlicher Betriebe, Felder und Kulturen',
    'description': """
Landwirtschaftliche Stammdaten
==============================
Dieses Modul ermöglicht die Verwaltung Ihrer landwirtschaftlichen Stammdaten:
* Betriebe
* Felder
* Kulturen
* Bodenarten

Mit integrierter Schnittstelle zum ENNI-System für die Düngebedarfsermittlung.
    """,
    'author': 'VALERO NeuroERP',
    'website': 'https://www.valero-neuroerp.com',
    'depends': [
        'base',
        'mail',
        'contacts',
    ],
    'data': [
        'security/farm_security.xml',
        'security/ir.model.access.csv',
        'views/farm_views.xml',
        'views/field_views.xml',
        'views/crop_views.xml',
        'views/menu_views.xml',
        'views/enni_export_views.xml',
        'views/enni_import_views.xml',
        'data/farm_data.xml',
    ],
    'demo': [
        # 'demo/farm_demo.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
} 