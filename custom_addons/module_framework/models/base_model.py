# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError

class BaseModel(models.AbstractModel):
    """
    Abstrakte Basisklasse für alle Modelle im Framework.
    Bietet gemeinsame Funktionalitäten und Felder, die von anderen Modellen geerbt werden können.
    """
    _name = 'module.base'
    _description = 'Basis-Modell'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'sequence, name'

    name = fields.Char(string='Name', required=True, tracking=True, 
                      translate=True, index=True)
    description = fields.Text(string='Beschreibung', translate=True)
    active = fields.Boolean(default=True, tracking=True)
    sequence = fields.Integer(default=10, help="Reihenfolge der Anzeige")
    color = fields.Integer(string='Farbe')
    company_id = fields.Many2one('res.company', string='Unternehmen', 
                                required=True, default=lambda self: self.env.company)
    user_id = fields.Many2one('res.users', string='Verantwortlicher', 
                             default=lambda self: self.env.user, tracking=True)
    date_created = fields.Datetime(string='Erstelldatum', default=fields.Datetime.now, readonly=True)
    last_updated = fields.Datetime(string='Zuletzt aktualisiert', readonly=True)
    notes = fields.Html(string='Interne Notizen')
    state = fields.Selection([
        ('draft', 'Entwurf'),
        ('active', 'Aktiv'),
        ('done', 'Abgeschlossen'),
        ('cancelled', 'Storniert')
    ], string='Status', default='draft', tracking=True)
    
    # Technische Felder
    technical_name = fields.Char(string='Technischer Name', index=True)
    module_version = fields.Char(string='Modulversion', default='1.0')
    
    @api.model_create_multi
    def create(self, vals_list):
        """Überschreibe create-Methode für benutzerdefinierte Logik"""
        for vals in vals_list:
            # Erzeuge technischen Namen falls nicht vorhanden
            if not vals.get('technical_name') and vals.get('name'):
                vals['technical_name'] = self._generate_technical_name(vals['name'])
        return super(BaseModel, self).create(vals_list)
    
    def write(self, vals):
        """Überschreibe write-Methode für benutzerdefinierte Logik"""
        # Aktualisiere last_updated Feld
        vals['last_updated'] = fields.Datetime.now()
        
        # Aktualisiere technischen Namen, wenn der Name geändert wird
        if vals.get('name') and not vals.get('technical_name'):
            vals['technical_name'] = self._generate_technical_name(vals['name'])
            
        return super(BaseModel, self).write(vals)
    
    def toggle_active(self):
        """Schalte das Aktiv-Flag um"""
        for record in self:
            record.active = not record.active
    
    def _generate_technical_name(self, name):
        """Erzeuge einen technischen Namen aus dem angezeigten Namen"""
        if not name:
            return False
        return name.lower().replace(' ', '_').replace('-', '_')
    
    def action_set_to_draft(self):
        """Setze Status auf Entwurf"""
        self.write({'state': 'draft'})
    
    def action_activate(self):
        """Setze Status auf Aktiv"""
        self.write({'state': 'active'})
    
    def action_done(self):
        """Setze Status auf Abgeschlossen"""
        self.write({'state': 'done'})
    
    def action_cancel(self):
        """Setze Status auf Storniert"""
        self.write({'state': 'cancelled'})
    
    @api.model
    def get_module_info(self):
        """Gibt Informationen über das Modul zurück"""
        IrModule = self.env['ir.module.module']
        module = IrModule.search([('name', '=', 'module_framework')], limit=1)
        return {
            'name': module.name,
            'version': module.latest_version,
            'author': module.author,
            'description': module.description,
        }
        
    def log_action(self, action_name, message=None):
        """Protokolliert eine Aktion im Chatter"""
        self.ensure_one()
        if not message:
            message = _("Aktion '%s' wurde ausgeführt.") % action_name
        self.message_post(body=message)
        
    def export_data_json(self):
        """Exportiert die Daten als JSON"""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'state': self.state,
            'date_created': fields.Datetime.to_string(self.date_created),
            'last_updated': fields.Datetime.to_string(self.last_updated) if self.last_updated else False,
        } 