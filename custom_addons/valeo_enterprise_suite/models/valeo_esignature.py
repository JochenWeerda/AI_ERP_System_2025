# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
import base64
import hashlib
import uuid
import logging
from datetime import datetime, timedelta

_logger = logging.getLogger(__name__)

class ValeoESignature(models.Model):
    _name = 'valeo.esignature'
    _description = 'VALEO E-Signatur'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    name = fields.Char('Referenz', required=True, copy=False, default=lambda self: _('Neue Signaturanfrage'))
    document_id = fields.Many2one('valeo.document', string='Dokument', required=True)
    document_name = fields.Char(related='document_id.name', string='Dokumentenname', readonly=True)
    document_file = fields.Binary(related='document_id.file', string='Dokumentendatei', readonly=True)
    document_filename = fields.Char(related='document_id.file_name', string='Dateiname', readonly=True)
    
    # Signaturanforderungen
    user_id = fields.Many2one('res.users', string='Anforderer', default=lambda self: self.env.user, tracking=True)
    company_id = fields.Many2one('res.company', string='Unternehmen', default=lambda self: self.env.company)
    signer_ids = fields.One2many('valeo.esignature.signer', 'esignature_id', string='Unterzeichner')
    signer_count = fields.Integer('Anzahl Unterzeichner', compute='_compute_signer_count')
    completion_percentage = fields.Float('Fortschritt', compute='_compute_completion_percentage')
    
    # Sicherheitsfelder
    hash_value = fields.Char('Dokumenten-Hash', compute='_compute_hash_value', store=True)
    signature_token = fields.Char('Signatur-Token', readonly=True, copy=False)
    expiration_date = fields.Datetime('Ablaufdatum', default=lambda self: fields.Datetime.now() + timedelta(days=30))
    
    # Status
    state = fields.Selection([
        ('draft', 'Entwurf'),
        ('sent', 'Gesendet'),
        ('partial', 'Teilweise signiert'),
        ('completed', 'Vollständig signiert'),
        ('expired', 'Abgelaufen'),
        ('canceled', 'Abgebrochen')
    ], string='Status', default='draft', tracking=True)
    
    # Protokollierung
    sign_log_ids = fields.One2many('valeo.esignature.log', 'esignature_id', string='Signatur-Protokoll')
    
    @api.model
    def create(self, vals):
        if vals.get('name', _('Neue Signaturanfrage')) == _('Neue Signaturanfrage'):
            vals['name'] = self.env['ir.sequence'].next_by_code('valeo.esignature') or _('Neue Signaturanfrage')
        if not vals.get('signature_token'):
            vals['signature_token'] = str(uuid.uuid4())
        return super(ValeoESignature, self).create(vals)
    
    @api.depends('document_id.file')
    def _compute_hash_value(self):
        for record in self:
            if record.document_id and record.document_id.file:
                file_content = base64.b64decode(record.document_id.file)
                record.hash_value = hashlib.sha256(file_content).hexdigest()
            else:
                record.hash_value = False
    
    @api.depends('signer_ids')
    def _compute_signer_count(self):
        for record in self:
            record.signer_count = len(record.signer_ids)
    
    @api.depends('signer_ids.state')
    def _compute_completion_percentage(self):
        for record in self:
            if not record.signer_ids:
                record.completion_percentage = 0.0
            else:
                signed_count = len(record.signer_ids.filtered(lambda s: s.state == 'signed'))
                record.completion_percentage = (signed_count / len(record.signer_ids)) * 100
    
    def action_send_signature_requests(self):
        """Sendet Signaturanfragen an alle Unterzeichner"""
        self.ensure_one()
        
        if not self.signer_ids:
            raise UserError(_('Es müssen Unterzeichner hinzugefügt werden, bevor Signaturanfragen gesendet werden können.'))
        
        # Hier würde die E-Mail-Logik implementiert werden
        # In einer realen Implementierung würden E-Mails an die Unterzeichner gesendet
        
        # Erstelle Log-Einträge
        for signer in self.signer_ids:
            self.env['valeo.esignature.log'].create({
                'esignature_id': self.id,
                'user_id': self.env.user.id,
                'action': 'send_request',
                'description': _('Signaturanfrage an %s gesendet') % signer.partner_id.name,
                'signer_id': signer.id
            })
            
            # Aktualisiere Unterzeichner-Status
            signer.write({'state': 'sent'})
        
        # Aktualisiere Signaturanfrage-Status
        self.write({'state': 'sent'})
        
        return True
    
    def action_cancel(self):
        """Bricht die Signaturanfrage ab"""
        self.ensure_one()
        
        if self.state == 'completed':
            raise UserError(_('Eine abgeschlossene Signaturanfrage kann nicht abgebrochen werden.'))
        
        self.write({'state': 'canceled'})
        
        # Erstelle Log-Eintrag
        self.env['valeo.esignature.log'].create({
            'esignature_id': self.id,
            'user_id': self.env.user.id,
            'action': 'cancel',
            'description': _('Signaturanfrage abgebrochen')
        })
        
        return True
    
    @api.model
    def _cron_check_expired_signatures(self):
        """Überprüft und markiert abgelaufene Signaturanfragen"""
        expired_signatures = self.search([
            ('state', 'in', ['sent', 'partial']),
            ('expiration_date', '<', fields.Datetime.now())
        ])
        
        for signature in expired_signatures:
            signature.write({'state': 'expired'})
            
            # Erstelle Log-Eintrag
            self.env['valeo.esignature.log'].create({
                'esignature_id': signature.id,
                'action': 'expire',
                'description': _('Signaturanfrage automatisch als abgelaufen markiert')
            })
    
    @api.onchange('signer_ids')
    def _onchange_signers(self):
        """Aktualisiert den Status basierend auf den Unterzeichnern"""
        if self.signer_ids and all(s.state == 'signed' for s in self.signer_ids):
            self.state = 'completed'
        elif self.signer_ids and any(s.state == 'signed' for s in self.signer_ids):
            self.state = 'partial'


class ValeoESignatureSigner(models.Model):
    _name = 'valeo.esignature.signer'
    _description = 'E-Signatur Unterzeichner'
    _rec_name = 'partner_id'
    _order = 'sequence, id'

    esignature_id = fields.Many2one('valeo.esignature', string='Signaturanfrage', required=True, ondelete='cascade')
    partner_id = fields.Many2one('res.partner', string='Kontakt', required=True)
    email = fields.Char(related='partner_id.email', string='E-Mail', readonly=True)
    role = fields.Char('Rolle', help="z.B. Geschäftsführer, Kunde, etc.")
    sequence = fields.Integer('Reihenfolge', default=10, help="Bestimmt die Reihenfolge der Unterzeichner")
    
    state = fields.Selection([
        ('draft', 'Entwurf'),
        ('sent', 'Gesendet'),
        ('viewed', 'Angesehen'),
        ('signed', 'Signiert'),
        ('rejected', 'Abgelehnt')
    ], string='Status', default='draft', tracking=True)
    
    signature_date = fields.Datetime('Signatur-Datum')
    signature = fields.Binary('Signatur')
    signature_method = fields.Selection([
        ('draw', 'Gezeichnet'),
        ('type', 'Getippt'),
        ('image', 'Bild hochgeladen')
    ], string='Signaturmethode')
    
    access_token = fields.Char('Zugangstoken', readonly=True, copy=False)
    ip_address = fields.Char('IP-Adresse', readonly=True, help="IP-Adresse, von der aus signiert wurde")
    user_agent = fields.Char('User Agent', readonly=True, help="Browser-Informationen")
    
    _sql_constraints = [
        ('partner_esignature_uniq', 'unique (esignature_id, partner_id)', 'Ein Kontakt kann nur einmal pro Signaturanfrage hinzugefügt werden!')
    ]
    
    @api.model
    def create(self, vals):
        if not vals.get('access_token'):
            vals['access_token'] = str(uuid.uuid4())
        return super(ValeoESignatureSigner, self).create(vals)
    
    def action_mark_as_viewed(self):
        """Markiert die Signaturanfrage als angesehen"""
        self.ensure_one()
        
        if self.state in ['draft', 'sent']:
            self.write({'state': 'viewed'})
            
            # Erstelle Log-Eintrag
            self.env['valeo.esignature.log'].create({
                'esignature_id': self.esignature_id.id,
                'signer_id': self.id,
                'action': 'view',
                'description': _('%s hat das Dokument angesehen') % self.partner_id.name
            })
        
        return True
    
    def action_sign(self, signature=None, signature_method='type', ip_address=None, user_agent=None):
        """Signiert das Dokument"""
        self.ensure_one()
        
        if self.state in ['draft', 'sent', 'viewed']:
            vals = {
                'state': 'signed',
                'signature_date': fields.Datetime.now(),
                'signature_method': signature_method
            }
            
            if signature:
                vals['signature'] = signature
            
            if ip_address:
                vals['ip_address'] = ip_address
                
            if user_agent:
                vals['user_agent'] = user_agent
                
            self.write(vals)
            
            # Erstelle Log-Eintrag
            self.env['valeo.esignature.log'].create({
                'esignature_id': self.esignature_id.id,
                'signer_id': self.id,
                'action': 'sign',
                'description': _('%s hat das Dokument signiert') % self.partner_id.name
            })
            
            # Prüfe, ob alle Unterzeichner signiert haben
            if all(s.state == 'signed' for s in self.esignature_id.signer_ids):
                self.esignature_id.write({'state': 'completed'})
            else:
                self.esignature_id.write({'state': 'partial'})
        
        return True
    
    def action_reject(self, reason=None):
        """Lehnt die Signatur ab"""
        self.ensure_one()
        
        if self.state in ['draft', 'sent', 'viewed']:
            self.write({'state': 'rejected'})
            
            # Erstelle Log-Eintrag
            description = _('%s hat die Signatur abgelehnt') % self.partner_id.name
            if reason:
                description += ': ' + reason
                
            self.env['valeo.esignature.log'].create({
                'esignature_id': self.esignature_id.id,
                'signer_id': self.id,
                'action': 'reject',
                'description': description
            })
        
        return True


class ValeoESignatureLog(models.Model):
    _name = 'valeo.esignature.log'
    _description = 'E-Signatur Protokoll'
    _order = 'create_date desc'

    esignature_id = fields.Many2one('valeo.esignature', string='Signaturanfrage', required=True, ondelete='cascade')
    user_id = fields.Many2one('res.users', string='Benutzer', default=lambda self: self.env.user)
    signer_id = fields.Many2one('valeo.esignature.signer', string='Unterzeichner')
    
    action = fields.Selection([
        ('create', 'Erstellt'),
        ('send_request', 'Anfrage gesendet'),
        ('view', 'Angesehen'),
        ('sign', 'Signiert'),
        ('reject', 'Abgelehnt'),
        ('cancel', 'Abgebrochen'),
        ('expire', 'Abgelaufen'),
        ('update', 'Aktualisiert')
    ], string='Aktion', required=True)
    
    description = fields.Text('Beschreibung')
    create_date = fields.Datetime('Datum', readonly=True)
    ip_address = fields.Char('IP-Adresse', readonly=True)