# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError

class ModuleMixin(models.AbstractModel):
    """
    Mixin-Klasse, die gemeinsam genutzte Funktionalitäten bereitstellt,
    die in verschiedenen Modellen wiederverwendet werden können.
    """
    _name = 'module.mixin'
    _description = 'Modul Mixin'
    
    # Gemeinsame Tracking-Felder
    created_by_id = fields.Many2one('res.users', string='Erstellt von', readonly=True, 
                                   default=lambda self: self.env.user)
    created_date = fields.Datetime(string='Erstellt am', readonly=True, 
                                  default=fields.Datetime.now)
    modified_by_id = fields.Many2one('res.users', string='Geändert von', readonly=True)
    modified_date = fields.Datetime(string='Geändert am', readonly=True)
    
    # Tagging und Kategorisierung
    tag_ids = fields.Many2many('module.tag', string='Tags')
    category_id = fields.Many2one('module.category', string='Kategorie')
    
    # Archivierungs-Tracking
    archive_reason = fields.Text(string='Archivierungsgrund')
    archived_by_id = fields.Many2one('res.users', string='Archiviert von', readonly=True)
    archived_date = fields.Datetime(string='Archiviert am', readonly=True)
    
    # API-Schnittstellen-Felder
    external_id = fields.Char(string='Externe ID', index=True, 
                             help="Identifikator für die Verwendung in externen Systemen")
    last_sync = fields.Datetime(string='Letzte Synchronisation')
    sync_status = fields.Selection([
        ('pending', 'Ausstehend'),
        ('synced', 'Synchronisiert'),
        ('failed', 'Fehlgeschlagen'),
        ('not_needed', 'Nicht erforderlich')
    ], string='Synchronisationsstatus', default='not_needed')
    
    @api.model_create_multi
    def create(self, vals_list):
        """Fügt automatisch Erstellungsinformationen hinzu"""
        for vals in vals_list:
            vals.update({
                'created_by_id': self.env.user.id,
                'created_date': fields.Datetime.now(),
            })
        return super(ModuleMixin, self).create(vals_list)
    
    def write(self, vals):
        """Fügt automatisch Änderungsinformationen hinzu"""
        vals.update({
            'modified_by_id': self.env.user.id,
            'modified_date': fields.Datetime.now(),
        })
        
        # Archivierungs-Tracking
        if 'active' in vals and not vals.get('active'):
            vals.update({
                'archived_by_id': self.env.user.id,
                'archived_date': fields.Datetime.now(),
            })
            
        return super(ModuleMixin, self).write(vals)
    
    def archive_with_reason(self, reason):
        """Archiviert einen Datensatz mit Grund"""
        self.ensure_one()
        if not reason:
            raise ValidationError(_('Ein Archivierungsgrund ist erforderlich.'))
        
        self.write({
            'active': False,
            'archive_reason': reason,
        })
    
    def mark_as_synced(self):
        """Markiert den Datensatz als synchronisiert"""
        self.write({
            'sync_status': 'synced',
            'last_sync': fields.Datetime.now()
        })
    
    def mark_sync_failed(self):
        """Markiert den Datensatz als fehlgeschlagen bei der Synchronisation"""
        self.write({
            'sync_status': 'failed',
            'last_sync': fields.Datetime.now()
        })
    
    def needs_sync(self):
        """Markiert den Datensatz als synchronisationsbedürftig"""
        self.write({'sync_status': 'pending'})
    
    def get_activity_summary(self):
        """Gibt eine Zusammenfassung der Aktivitäten zurück"""
        self.ensure_one()
        activities = self.env['mail.activity'].search([
            ('res_id', '=', self.id),
            ('res_model', '=', self._name)
        ])
        
        return {
            'total': len(activities),
            'overdue': len(activities.filtered(lambda a: a.date_deadline < fields.Date.today())),
            'today': len(activities.filtered(lambda a: a.date_deadline == fields.Date.today())),
            'planned': len(activities.filtered(lambda a: a.date_deadline > fields.Date.today())),
        }
