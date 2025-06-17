from odoo import models, fields, api

class DashboardWidgetList(models.Model):
    _name = 'valeo.dashboard.widget.list'
    _description = 'VALEO Dashboard List Widget'

    name = fields.Char(string='Name', required=True)
    dashboard_id = fields.Many2one('valeo.dashboard', string='Dashboard', required=True)
    position_x = fields.Integer(string='X-Position', default=0)
    position_y = fields.Integer(string='Y-Position', default=0)
    width = fields.Integer(string='Breite', default=6)
    height = fields.Integer(string='Höhe', default=4)
    
    model_id = fields.Many2one('ir.model', string='Quellmodell', required=True)
    model_name = fields.Char(related='model_id.model', string='Modellname', readonly=True)
    domain = fields.Char(string='Filter-Domain', default='[]')
    limit = fields.Integer(string='Limit', default=10)
    
    field_ids = fields.Many2many('ir.model.fields', string='Anzuzeigende Felder',
                                domain="[('model_id', '=', model_id)]")
    
    @api.depends('model_id', 'domain', 'limit')
    def _compute_record_count(self):
        for record in self:
            if record.model_id and record.model_name:
                try:
                    model = self.env[record.model_name]
                    domain = eval(record.domain) if record.domain else []
                    record.record_count = model.search_count(domain)
                except:
                    record.record_count = 0
            else:
                record.record_count = 0
    
    record_count = fields.Integer(string='Datensatzanzahl', compute='_compute_record_count') 