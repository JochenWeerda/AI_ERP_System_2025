from odoo import models, fields, api
import json

class DashboardWidgetChart(models.Model):
    _name = 'valeo.dashboard.widget.chart'
    _description = 'VALEO Dashboard Chart Widget'

    name = fields.Char(string='Name', required=True)
    dashboard_id = fields.Many2one('valeo.dashboard', string='Dashboard', required=True)
    position_x = fields.Integer(string='X-Position', default=0)
    position_y = fields.Integer(string='Y-Position', default=0)
    width = fields.Integer(string='Breite', default=6)
    height = fields.Integer(string='Höhe', default=4)
    
    chart_type = fields.Selection([
        ('bar', 'Balkendiagramm'),
        ('line', 'Liniendiagramm'),
        ('pie', 'Kreisdiagramm'),
        ('radar', 'Netzdiagramm')
    ], string='Diagrammtyp', default='bar')
    
    data_source = fields.Text(string='Datenquelle (JSON)', default='{"labels": ["Jan", "Feb", "Mar"], "datasets": [{"label": "Verkäufe", "data": [10, 20, 30]}]}')
    show_legend = fields.Boolean(string='Legende anzeigen', default=True)
    
    @api.depends('data_source')
    def _compute_chart_data(self):
        for record in self:
            try:
                data = json.loads(record.data_source)
                record.chart_data_valid = True
                record.chart_labels = ', '.join(data.get('labels', []))
                
                datasets = data.get('datasets', [])
                if datasets:
                    record.chart_dataset_count = len(datasets)
                    record.chart_dataset_labels = ', '.join([d.get('label', '') for d in datasets])
                else:
                    record.chart_dataset_count = 0
                    record.chart_dataset_labels = ''
            except:
                record.chart_data_valid = False
                record.chart_labels = ''
                record.chart_dataset_count = 0
                record.chart_dataset_labels = ''
    
    chart_data_valid = fields.Boolean(string='Daten gültig', compute='_compute_chart_data', store=True)
    chart_labels = fields.Char(string='Diagramm-Labels', compute='_compute_chart_data', store=True)
    chart_dataset_count = fields.Integer(string='Anzahl Datensätze', compute='_compute_chart_data', store=True)
    chart_dataset_labels = fields.Char(string='Datensatz-Labels', compute='_compute_chart_data', store=True) 