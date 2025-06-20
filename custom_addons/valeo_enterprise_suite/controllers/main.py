# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request


class ValeoEnterpriseController(http.Controller):
    
    @http.route('/valeo_enterprise_suite/dashboard_data', type='json', auth='user')
    def get_dashboard_data(self):
        """Liefert Daten für das VALEO Enterprise Dashboard"""
        
        # In einer echten Implementierung würden hier Daten aus verschiedenen Modellen abgefragt
        # Für dieses Beispiel verwenden wir Dummy-Daten
        
        return {
            'document_count': 42,
            'analytics_count': 7,
            'task_count': 12,
            'insight_count': 5,
        }                        ' d o c u m e n t _ c o u n t ' :   4 2 , 
 
 