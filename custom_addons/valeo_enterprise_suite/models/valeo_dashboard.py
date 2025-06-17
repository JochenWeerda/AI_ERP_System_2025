# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError
import json
import logging

_logger = logging.getLogger(__name__)

class ValeoDashboard(models.Model):
    _name = 'valeo.dashboard'
    _description = 'VALEO Enterprise Dashboard'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char('Name', required=True)
    user_id = fields.Many2one('res.users', string='Benutzer', default=lambda self: self.env.user)
    company_id = fields.Many2one('res.company', string='Unternehmen', default=lambda self: self.env.company)
    dashboard_type = fields.Selection([
        ('finance', 'Finanzen'),
        ('sales', 'Verkauf'),
        ('hr', 'Personal'),
        ('project', 'Projekte'),
        ('custom', 'Benutzerdefiniert')
    ], string='Dashboard-Typ', default='custom', required=True)
    is_favorite = fields.Boolean('Favorit', default=False)
    active = fields.Boolean('Aktiv', default=True)
    
    # JSON-Feld zur Speicherung der Dashboard-Konfiguration
    config = fields.Text('Konfiguration', default='{}')
    
    # Statistiken und KPIs
    kpi_count = fields.Integer('Anzahl KPIs', compute='_compute_kpi_count')
    last_update = fields.Datetime('Letzte Aktualisierung', default=fields.Datetime.now)
    
    @api.depends('config')
    def _compute_kpi_count(self):
        for record in self:
            try:
                config_dict = json.loads(record.config or '{}')
                record.kpi_count = len(config_dict.get('kpis', []))
            except Exception as e:
                _logger.error("Fehler beim Berechnen der KPI-Anzahl: %s", str(e))
                record.kpi_count = 0
    
    def action_update_dashboard(self):
        """Aktualisiert das Dashboard mit den neuesten Daten"""
        self.ensure_one()
        self.last_update = fields.Datetime.now()
        
        # Hier würden wir die KI-Logik integrieren, um Daten zu analysieren
        # und das Dashboard zu aktualisieren
        
        return {
            'type': 'ir.actions.client',
            'tag': 'reload',
        }
    
    def action_open_dashboard(self):
        """Öffnet das Dashboard in der Benutzeroberfläche"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': self.name,
            'res_model': 'valeo.dashboard',
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'current',
        }
    
    @api.model
    def create_default_dashboards(self):
        """Erstellt Standarddashboards für neue Benutzer"""
        dashboards_to_create = [
            {
                'name': 'Finanz-Dashboard',
                'dashboard_type': 'finance',
                'config': json.dumps({
                    'layout': '2-1',
                    'kpis': [
                        {'name': 'Umsatz', 'model': 'account.move', 'function': 'sum_revenue'},
                        {'name': 'Kosten', 'model': 'account.move', 'function': 'sum_costs'},
                        {'name': 'Gewinn', 'model': 'account.move', 'function': 'calc_profit'}
                    ]
                })
            },
            {
                'name': 'Projekt-Dashboard',
                'dashboard_type': 'project',
                'config': json.dumps({
                    'layout': '3-3',
                    'kpis': [
                        {'name': 'Offene Aufgaben', 'model': 'project.task', 'function': 'count_open'},
                        {'name': 'Überfällige Aufgaben', 'model': 'project.task', 'function': 'count_overdue'},
                        {'name': 'Abgeschlossene Aufgaben', 'model': 'project.task', 'function': 'count_done'}
                    ]
                })
            }
        ]
        
        for dashboard in dashboards_to_create:
            if not self.search([('name', '=', dashboard['name']), ('user_id', '=', self.env.user.id)]):
                self.create(dashboard)
        
        return True 