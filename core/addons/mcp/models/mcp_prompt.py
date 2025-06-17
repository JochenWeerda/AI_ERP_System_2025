# -*- coding: utf-8 -*-

import json
import logging
import re
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError, UserError

_logger = logging.getLogger(__name__)


class MCPPromptCategory(models.Model):
    """
    Kategorisierung von Prompt-Vorlagen für bessere Organisation.
    """
    _name = 'mcp.prompt.category'
    _description = 'MCP Prompt-Kategorie'
    _order = 'sequence, name'
    
    name = fields.Char(string='Name', required=True)
    code = fields.Char(string='Code', required=True)
    description = fields.Text(string='Beschreibung')
    sequence = fields.Integer(string='Sequenz', default=10)
    parent_id = fields.Many2one('mcp.prompt.category', string='Übergeordnete Kategorie')
    child_ids = fields.One2many('mcp.prompt.category', 'parent_id', string='Unterkategorien')
    
    prompt_template_count = fields.Integer(string='Anzahl Vorlagen', compute='_compute_prompt_template_count')
    
    _sql_constraints = [
        ('code_uniq', 'unique(code)', 'Der Kategorie-Code muss eindeutig sein!')
    ]
    
    @api.depends('prompt_template_ids')
    def _compute_prompt_template_count(self):
        """Berechnet die Anzahl der Vorlagen in dieser Kategorie."""
        for category in self:
            category.prompt_template_count = self.env['mcp.prompt.template'].search_count(
                [('category_id', '=', category.id)]
            )
    
    @api.constrains('parent_id')
    def _check_parent_id(self):
        """Verhindert rekursive Kategoriestrukturen."""
        if not self._check_recursion():
            raise ValidationError(_('Fehler! Sie können keine rekursiven Kategorien erstellen.'))
    
    def name_get(self):
        """Zeigt den vollständigen Pfad für die Kategorie an."""
        result = []
        for category in self:
            names = []
            current = category
            while current:
                names.insert(0, current.name)
                current = current.parent_id
            result.append((category.id, ' / '.join(names)))
        return result


class MCPPromptTemplate(models.Model):
    """
    Wiederverwendbare Vorlagen für Prompts mit Parametern und Versionierung.
    """
    _name = 'mcp.prompt.template'
    _description = 'MCP Prompt-Vorlage'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    
    name = fields.Char(string='Name', required=True, tracking=True)
    code = fields.Char(string='Code', required=True, tracking=True)
    description = fields.Text(string='Beschreibung', tracking=True)
    template_content = fields.Text(string='Vorlageninhalt', required=True, tracking=True)
    
    category_id = fields.Many2one('mcp.prompt.category', string='Kategorie')
    parameter_ids = fields.One2many('mcp.prompt.parameter', 'template_id', string='Parameter')
    version_ids = fields.One2many('mcp.prompt.template.version', 'template_id', string='Versionen')
    
    is_active = fields.Boolean(string='Aktiv', default=True, tracking=True)
    usage_count = fields.Integer(string='Verwendungen', default=0, readonly=True)
    
    # Standardeinstellungen für die Verwendung der Vorlage
    default_provider_id = fields.Many2one('mcp.provider', string='Standard-Provider')
    default_model_id = fields.Many2one('mcp.provider.model', string='Standard-Modell',
                                      domain="[('provider_id', '=', default_provider_id)]")
    
    default_max_tokens = fields.Integer(string='Standard Max. Tokens', default=1000)
    default_temperature = fields.Float(string='Standard Temperatur', default=0.7)
    
    created_by_id = fields.Many2one('res.users', string='Erstellt von', default=lambda self: self.env.user, readonly=True)
    created_date = fields.Datetime(string='Erstellt am', default=fields.Datetime.now, readonly=True)
    
    last_used = fields.Datetime(string='Zuletzt verwendet', readonly=True)
    
    _sql_constraints = [
        ('code_uniq', 'unique(code)', 'Der Vorlagen-Code muss eindeutig sein!')
    ]
    
    @api.model
    def create(self, vals):
        """Erstellt eine neue Vorlage und speichert die initiale Version."""
        template = super(MCPPromptTemplate, self).create(vals)
        
        # Initiale Version erstellen
        self.env['mcp.prompt.template.version'].create({
            'template_id': template.id,
            'version_number': '1.0',
            'template_content': template.template_content,
            'description': _('Initiale Version'),
            'created_by_id': self.env.user.id,
        })
        
        return template
    
    def write(self, vals):
        """Aktualisiert die Vorlage und erstellt eine neue Version bei Inhaltsänderungen."""
        for template in self:
            create_version = False
            old_content = template.template_content
            
            # Prüfen, ob der Inhalt geändert wurde
            if 'template_content' in vals and vals['template_content'] != old_content:
                create_version = True
            
            result = super(MCPPromptTemplate, self).write(vals)
            
            # Neue Version erstellen, wenn der Inhalt geändert wurde
            if create_version:
                # Versionsnummer berechnen
                last_version = self.env['mcp.prompt.template.version'].search([
                    ('template_id', '=', template.id)
                ], order='create_date DESC', limit=1)
                
                if last_version:
                    major, minor = map(int, last_version.version_number.split('.'))
                    new_version = f"{major}.{minor + 1}"
                else:
                    new_version = "1.0"
                
                self.env['mcp.prompt.template.version'].create({
                    'template_id': template.id,
                    'version_number': new_version,
                    'template_content': vals.get('template_content', old_content),
                    'description': vals.get('version_description', _('Inhaltsupdate')),
                    'created_by_id': self.env.user.id,
                })
            
            return result
    
    def copy(self, default=None):
        """Erstellt eine Kopie der Vorlage mit eindeutigem Code."""
        default = dict(default or {})
        if 'name' not in default:
            default['name'] = _("%s (Kopie)") % self.name
        if 'code' not in default:
            default['code'] = _("%s_copy") % self.code
        
        return super(MCPPromptTemplate, self).copy(default)
    
    def generate_prompt(self, params=None):
        """
        Generiert einen konkreten Prompt aus der Vorlage mit den gegebenen Parametern.
        
        :param params: Dict mit Parameterwerten
        :return: Der generierte Prompt-Text
        """
        self.ensure_one()
        
        if not params:
            params = {}
        
        # Vorlage laden
        content = self.template_content
        
        # Parameter validieren
        missing_params = []
        for param in self.parameter_ids.filtered(lambda p: p.required):
            if param.code not in params:
                missing_params.append(param.name)
        
        if missing_params:
            raise UserError(_('Fehlende erforderliche Parameter: %s') % ', '.join(missing_params))
        
        # Parameter ersetzen
        for param in self.parameter_ids:
            if param.code in params:
                value = params[param.code]
                placeholder = '{%s}' % param.code
                content = content.replace(placeholder, str(value))
        
        # Prüfen, ob noch nicht ersetzte Platzhalter vorhanden sind
        remaining_placeholders = re.findall(r'\{([^}]+)\}', content)
        if remaining_placeholders:
            _logger.warning(f"Nicht ersetzte Platzhalter in Prompt: {remaining_placeholders}")
        
        # Verwendungszähler aktualisieren
        self.write({
            'usage_count': self.usage_count + 1,
            'last_used': fields.Datetime.now(),
        })
        
        return content
    
    @api.model
    def get_by_code(self, code):
        """
        Findet eine Vorlage anhand ihres Codes.
        
        :param code: Der Vorlagen-Code
        :return: mcp.prompt.template Recordset oder False
        """
        return self.search([('code', '=', code), ('is_active', '=', True)], limit=1)


class MCPPromptParameter(models.Model):
    """
    Parameter für Prompt-Vorlagen zur dynamischen Anpassung.
    """
    _name = 'mcp.prompt.parameter'
    _description = 'MCP Prompt-Parameter'
    _order = 'sequence, id'
    
    name = fields.Char(string='Name', required=True)
    code = fields.Char(string='Code', required=True, 
                      help="Wird als Platzhalter im Format {code} verwendet")
    description = fields.Text(string='Beschreibung')
    template_id = fields.Many2one('mcp.prompt.template', string='Vorlage', required=True, ondelete='cascade')
    
    data_type = fields.Selection([
        ('string', 'Text'),
        ('integer', 'Ganzzahl'),
        ('float', 'Dezimalzahl'),
        ('boolean', 'Ja/Nein'),
        ('date', 'Datum'),
        ('datetime', 'Datum/Zeit'),
        ('selection', 'Auswahl')
    ], string='Datentyp', required=True, default='string')
    
    required = fields.Boolean(string='Erforderlich', default=False)
    default_value = fields.Char(string='Standardwert')
    
    min_value = fields.Float(string='Minimalwert', help="Für numerische Typen")
    max_value = fields.Float(string='Maximalwert', help="Für numerische Typen")
    
    selection_values = fields.Text(string='Auswahlwerte', 
                                  help="Kommagetrennte Liste von Werten für den Auswahl-Typ")
    
    sequence = fields.Integer(string='Sequenz', default=10)
    
    _sql_constraints = [
        ('code_template_uniq', 'unique(code, template_id)', 
         'Der Parameter-Code muss innerhalb einer Vorlage eindeutig sein!')
    ]
    
    @api.constrains('code')
    def _check_code_format(self):
        """Stellt sicher, dass der Code das richtige Format hat."""
        for param in self:
            if not re.match(r'^[a-zA-Z][a-zA-Z0-9_]*$', param.code):
                raise ValidationError(_(
                    'Der Parameter-Code muss mit einem Buchstaben beginnen und darf nur '
                    'Buchstaben, Zahlen und Unterstriche enthalten.'
                ))
    
    @api.constrains('data_type', 'default_value', 'min_value', 'max_value')
    def _validate_default_value(self):
        """Validiert den Standardwert basierend auf dem Datentyp."""
        for param in self:
            if not param.default_value:
                continue
            
            try:
                if param.data_type == 'integer':
                    value = int(param.default_value)
                    if param.min_value and value < param.min_value:
                        raise ValidationError(_('Standardwert ist kleiner als der Minimalwert'))
                    if param.max_value and value > param.max_value:
                        raise ValidationError(_('Standardwert ist größer als der Maximalwert'))
                
                elif param.data_type == 'float':
                    value = float(param.default_value)
                    if param.min_value and value < param.min_value:
                        raise ValidationError(_('Standardwert ist kleiner als der Minimalwert'))
                    if param.max_value and value > param.max_value:
                        raise ValidationError(_('Standardwert ist größer als der Maximalwert'))
                
                elif param.data_type == 'boolean':
                    if param.default_value.lower() not in ('true', 'false', '0', '1', 'yes', 'no'):
                        raise ValidationError(_('Ungültiger Standardwert für Boolean'))
                
                elif param.data_type == 'date':
                    # Datum-Validierung könnte hier implementiert werden
                    pass
                
                elif param.data_type == 'datetime':
                    # Datum/Zeit-Validierung könnte hier implementiert werden
                    pass
                
                elif param.data_type == 'selection' and param.selection_values:
                    valid_values = [v.strip() for v in param.selection_values.split(',')]
                    if param.default_value not in valid_values:
                        raise ValidationError(_('Standardwert ist nicht in den Auswahlwerten enthalten'))
            
            except (ValueError, TypeError):
                raise ValidationError(_('Der Standardwert ist nicht kompatibel mit dem gewählten Datentyp'))


class MCPPromptTemplateVersion(models.Model):
    """
    Versionierung von Prompt-Vorlagen für Änderungsverfolgung und Rollback-Funktionalität.
    """
    _name = 'mcp.prompt.template.version'
    _description = 'MCP Prompt-Vorlagenversion'
    _order = 'create_date DESC'
    
    template_id = fields.Many2one('mcp.prompt.template', string='Vorlage', required=True, ondelete='cascade')
    version_number = fields.Char(string='Version', required=True)
    template_content = fields.Text(string='Vorlageninhalt', required=True)
    description = fields.Text(string='Änderungsbeschreibung')
    
    created_by_id = fields.Many2one('res.users', string='Erstellt von', default=lambda self: self.env.user, readonly=True)
    create_date = fields.Datetime(string='Erstellt am', readonly=True)
    
    is_current = fields.Boolean(string='Aktuelle Version', compute='_compute_is_current')
    
    @api.depends('template_id.template_content', 'template_content')
    def _compute_is_current(self):
        """Bestimmt, ob dies die aktuell verwendete Version ist."""
        for version in self:
            version.is_current = version.template_content == version.template_id.template_content
    
    def restore_version(self):
        """Stellt diese Version als aktuelle Version wieder her."""
        self.ensure_one()
        
        if self.is_current:
            return
        
        self.template_id.write({
            'template_content': self.template_content,
            'version_description': _('Wiederherstellung von Version %s') % self.version_number
        })
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Version wiederhergestellt'),
                'message': _('Version %s wurde wiederhergestellt.') % self.version_number,
                'type': 'success',
                'sticky': False,
            }
        } 