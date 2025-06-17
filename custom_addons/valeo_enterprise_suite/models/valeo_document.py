# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError
import base64
import logging
import os
from datetime import datetime

_logger = logging.getLogger(__name__)

class ValeoDocument(models.Model):
    _name = 'valeo.document'
    _description = 'VALEO Dokumentenmanagement'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    name = fields.Char('Dokumentenname', required=True, tracking=True)
    description = fields.Text('Beschreibung')
    document_type = fields.Selection([
        ('contract', 'Vertrag'),
        ('invoice', 'Rechnung'),
        ('report', 'Bericht'),
        ('policy', 'Richtlinie'),
        ('other', 'Sonstige')
    ], string='Dokumententyp', default='other', required=True, tracking=True)
    
    # Dokumentendatei
    file = fields.Binary('Datei', attachment=True, required=True)
    file_name = fields.Char('Dateiname')
    file_size = fields.Integer('Dateigröße (KB)', compute='_compute_file_size', store=True)
    file_type = fields.Char('Dateityp', compute='_compute_file_type', store=True)
    
    # Metadaten
    user_id = fields.Many2one('res.users', string='Eigentümer', default=lambda self: self.env.user, tracking=True)
    company_id = fields.Many2one('res.company', string='Unternehmen', default=lambda self: self.env.company)
    tag_ids = fields.Many2many('valeo.document.tag', string='Tags')
    folder_id = fields.Many2one('valeo.document.folder', string='Ordner')
    version = fields.Integer('Version', default=1, tracking=True)
    state = fields.Selection([
        ('draft', 'Entwurf'),
        ('pending', 'In Prüfung'),
        ('approved', 'Genehmigt'),
        ('rejected', 'Abgelehnt'),
        ('archived', 'Archiviert')
    ], string='Status', default='draft', tracking=True)
    
    # KI-Funktionen
    is_ocr_processed = fields.Boolean('OCR verarbeitet', default=False)
    ocr_content = fields.Text('OCR-Inhalt', help="Extrahierter Text aus dem Dokument")
    ai_summary = fields.Text('KI-Zusammenfassung', help="Automatisch generierte Zusammenfassung des Dokuments")
    ai_tags = fields.Char('KI-Tags', help="Automatisch generierte Tags basierend auf dem Dokumenteninhalt")
    
    # Verknüpfungen
    related_partner_id = fields.Many2one('res.partner', string='Zugehöriger Partner')
    related_document_ids = fields.Many2many('valeo.document', 'valeo_document_rel', 'doc_id', 'related_doc_id', 
                                          string='Verwandte Dokumente')
    
    @api.depends('file')
    def _compute_file_size(self):
        for doc in self:
            if doc.file:
                # Berechne Dateigröße in KB
                doc.file_size = len(base64.b64decode(doc.file)) / 1024
            else:
                doc.file_size = 0
    
    @api.depends('file_name')
    def _compute_file_type(self):
        for doc in self:
            if doc.file_name:
                # Extrahiere Dateityp aus dem Dateinamen
                doc.file_type = os.path.splitext(doc.file_name)[1].lower().strip('.') or 'unbekannt'
            else:
                doc.file_type = 'unbekannt'
    
    def action_process_with_ocr(self):
        """Verarbeitet das Dokument mit OCR und extrahiert Text"""
        self.ensure_one()
        
        # Hier würde die OCR-Logik implementiert werden
        # In einer realen Implementierung würde hier ein OCR-Service wie Tesseract oder
        # ein Cloud-OCR-Dienst angebunden werden
        
        self.is_ocr_processed = True
        self.ocr_content = "OCR-Text würde hier erscheinen"
        
        # Generiere KI-Zusammenfassung und Tags
        self._generate_ai_summary()
        
        return True
    
    def _generate_ai_summary(self):
        """Generiert eine KI-Zusammenfassung und Tags für das Dokument"""
        if not self.ocr_content:
            return
        
        # Hier würde die KI-Logik zur Zusammenfassung implementiert werden
        # In einer realen Implementierung würde hier ein NLP-Service angebunden werden
        
        self.ai_summary = "KI-generierte Zusammenfassung des Dokuments"
        self.ai_tags = "tag1,tag2,tag3"
    
    def action_create_new_version(self):
        """Erstellt eine neue Version des Dokuments"""
        self.ensure_one()
        
        new_version = self.copy({
            'version': self.version + 1,
            'state': 'draft',
        })
        
        return {
            'type': 'ir.actions.act_window',
            'name': _('Neue Version'),
            'res_model': 'valeo.document',
            'res_id': new_version.id,
            'view_mode': 'form',
            'target': 'current',
        }
    
    def action_approve(self):
        """Genehmigt das Dokument"""
        self.write({'state': 'approved'})
    
    def action_reject(self):
        """Lehnt das Dokument ab"""
        self.write({'state': 'rejected'})
    
    def action_archive(self):
        """Archiviert das Dokument"""
        self.write({'state': 'archived'})


class ValeoDocumentTag(models.Model):
    _name = 'valeo.document.tag'
    _description = 'Dokument-Tag'
    
    name = fields.Char('Name', required=True)
    color = fields.Integer('Farbe')
    
    _sql_constraints = [
        ('name_uniq', 'unique (name)', 'Tag-Name muss eindeutig sein!')
    ]


class ValeoDocumentFolder(models.Model):
    _name = 'valeo.document.folder'
    _description = 'Dokumentenordner'
    _parent_name = "parent_id"
    _parent_store = True
    _rec_name = 'complete_name'
    _order = 'parent_path'
    
    name = fields.Char('Name', required=True)
    complete_name = fields.Char('Vollständiger Name', compute='_compute_complete_name', store=True)
    parent_id = fields.Many2one('valeo.document.folder', string='Übergeordneter Ordner', ondelete='cascade')
    parent_path = fields.Char(index=True)
    child_id = fields.One2many('valeo.document.folder', 'parent_id', string='Unterordner')
    document_count = fields.Integer('Anzahl Dokumente', compute='_compute_document_count')
    
    @api.depends('name', 'parent_id.complete_name')
    def _compute_complete_name(self):
        for folder in self:
            if folder.parent_id:
                folder.complete_name = '%s / %s' % (folder.parent_id.complete_name, folder.name)
            else:
                folder.complete_name = folder.name
    
    @api.depends()
    def _compute_document_count(self):
        for folder in self:
            folder.document_count = self.env['valeo.document'].search_count([('folder_id', '=', folder.id)]) 