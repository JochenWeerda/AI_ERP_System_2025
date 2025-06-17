from odoo import models, fields, api

class Dashboard(models.Model):
    _name = 'valeo.dashboard'
    _description = 'VALEO Dashboard'
    
    name = fields.Char(string='Name', required=True)
    description = fields.Text(string='Beschreibung')
    is_active = fields.Boolean(string='Aktiv', default=True)
    
    # Dashboard-Widgets
    kpi_widget_ids = fields.One2many('valeo.dashboard.widget.kpi', 'dashboard_id', string='KPI-Widgets')
    chart_widget_ids = fields.One2many('valeo.dashboard.widget.chart', 'dashboard_id', string='Diagramm-Widgets')
    list_widget_ids = fields.One2many('valeo.dashboard.widget.list', 'dashboard_id', string='Listen-Widgets')
    filter_widget_ids = fields.One2many('valeo.dashboard.widget.filter', 'dashboard_id', string='Filter-Widgets')
    
    # Berechtigungs- und Zugriffsverwaltung
    user_ids = fields.Many2many('res.users', string='Berechtigte Benutzer')
    group_ids = fields.Many2many('res.groups', string='Berechtigte Gruppen')
    is_public = fields.Boolean(string='Öffentlich', default=False,
                              help='Wenn aktiviert, ist das Dashboard für alle Benutzer sichtbar')
    
    @api.depends('kpi_widget_ids', 'chart_widget_ids', 'list_widget_ids', 'filter_widget_ids')
    def _compute_widget_count(self):
        for record in self:
            record.kpi_count = len(record.kpi_widget_ids)
            record.chart_count = len(record.chart_widget_ids)
            record.list_count = len(record.list_widget_ids)
            record.filter_count = len(record.filter_widget_ids)
            record.total_widget_count = record.kpi_count + record.chart_count + record.list_count + record.filter_count
    
    kpi_count = fields.Integer(string='Anzahl KPIs', compute='_compute_widget_count')
    chart_count = fields.Integer(string='Anzahl Diagramme', compute='_compute_widget_count')
    list_count = fields.Integer(string='Anzahl Listen', compute='_compute_widget_count')
    filter_count = fields.Integer(string='Anzahl Filter', compute='_compute_widget_count')
    total_widget_count = fields.Integer(string='Gesamtanzahl Widgets', compute='_compute_widget_count') 