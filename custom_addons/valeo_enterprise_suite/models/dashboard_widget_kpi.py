from odoo import models, fields, api

class DashboardWidgetKpi(models.Model):
    _name = 'valeo.dashboard.widget.kpi'
    _description = 'VALEO Dashboard KPI Widget'

    name = fields.Char(string='Name', required=True)
    dashboard_id = fields.Many2one('valeo.dashboard', string='Dashboard', required=True)
    position_x = fields.Integer(string='X-Position', default=0)
    position_y = fields.Integer(string='Y-Position', default=0)
    width = fields.Integer(string='Breite', default=3)
    height = fields.Integer(string='Höhe', default=2)
    
    kpi_value = fields.Float(string='KPI-Wert', default=0.0)
    kpi_target = fields.Float(string='KPI-Ziel', default=0.0)
    kpi_format = fields.Selection([
        ('number', 'Zahl'),
        ('percentage', 'Prozent'),
        ('currency', 'Währung')
    ], string='Format', default='number')
    color = fields.Selection([
        ('green', 'Grün'),
        ('yellow', 'Gelb'),
        ('red', 'Rot'),
        ('blue', 'Blau'),
        ('purple', 'Lila')
    ], string='Farbe', default='blue')

    @api.depends('kpi_value', 'kpi_target')
    def _compute_kpi_status(self):
        for record in self:
            if record.kpi_target == 0:
                record.kpi_status = 'neutral'
            elif record.kpi_value >= record.kpi_target:
                record.kpi_status = 'good'
            elif record.kpi_value >= record.kpi_target * 0.8:
                record.kpi_status = 'warning'
            else:
                record.kpi_status = 'bad'
    
    kpi_status = fields.Selection([
        ('good', 'Gut'),
        ('warning', 'Warnung'),
        ('bad', 'Schlecht'),
        ('neutral', 'Neutral')
    ], string='KPI-Status', compute='_compute_kpi_status', store=True) 