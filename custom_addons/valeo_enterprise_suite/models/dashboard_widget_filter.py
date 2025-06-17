from odoo import models, fields, api

class DashboardWidgetFilter(models.Model):
    _name = 'valeo.dashboard.widget.filter'
    _description = 'VALEO Dashboard Filter Widget'

    name = fields.Char(string='Name', required=True)
    dashboard_id = fields.Many2one('valeo.dashboard', string='Dashboard', required=True)
    position_x = fields.Integer(string='X-Position', default=0)
    position_y = fields.Integer(string='Y-Position', default=0)
    width = fields.Integer(string='Breite', default=3)
    height = fields.Integer(string='Höhe', default=1)
    
    filter_type = fields.Selection([
        ('date', 'Datum'),
        ('selection', 'Auswahl'),
        ('many2one', 'Relation')
    ], string='Filtertyp', default='date')
    
    target_field_ids = fields.Many2many('ir.model.fields', string='Zielfelder')
    is_global = fields.Boolean(string='Globaler Filter', default=True,
                              help='Wenn aktiviert, wird dieser Filter auf alle Widgets im Dashboard angewendet')
    
    # Spezifische Felder für Datums-Filter
    date_range_type = fields.Selection([
        ('day', 'Tag'),
        ('week', 'Woche'),
        ('month', 'Monat'),
        ('quarter', 'Quartal'),
        ('year', 'Jahr'),
        ('custom', 'Benutzerdefiniert')
    ], string='Datumsbereich', default='month')
    
    # Spezifische Felder für Auswahl-Filter
    selection_options = fields.Text(string='Auswahloptionen', 
                                   help='Eine Option pro Zeile im Format: Wert|Bezeichnung')
    
    # Spezifische Felder für Relation-Filter
    relation_model_id = fields.Many2one('ir.model', string='Relationsmodell')
    relation_field_id = fields.Many2one('ir.model.fields', string='Anzuzeigende Felder',
                                      domain="[('model_id', '=', relation_model_id)]") 