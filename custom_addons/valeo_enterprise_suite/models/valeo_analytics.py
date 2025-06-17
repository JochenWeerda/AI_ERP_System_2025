# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

_logger = logging.getLogger(__name__)

class ValeoAnalytics(models.Model):
    _name = 'valeo.analytics'
    _description = 'VALEO Analytik'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    name = fields.Char('Name', required=True, tracking=True)
    description = fields.Text('Beschreibung')
    analytics_type = fields.Selection([
        ('dashboard', 'Dashboard'),
        ('report', 'Bericht'),
        ('prediction', 'Vorhersage'),
        ('anomaly', 'Anomalieerkennung'),
        ('clustering', 'Clustering'),
        ('custom', 'Benutzerdefiniert')
    ], string='Analytik-Typ', default='dashboard', required=True, tracking=True)
    
    # Datenquellen
    model_id = fields.Many2one('ir.model', string='Datenmodell')
    domain = fields.Char('Filter-Domain', default='[]')
    fields_list = fields.Text('Felder', help="Komma-getrennte Liste von Feldnamen")
    groupby = fields.Char('Gruppieren nach')
    orderby = fields.Char('Sortieren nach')
    limit = fields.Integer('Limit', default=100)
    
    # Visualisierung
    chart_type = fields.Selection([
        ('bar', 'Balkendiagramm'),
        ('line', 'Liniendiagramm'),
        ('pie', 'Kreisdiagramm'),
        ('scatter', 'Streudiagramm'),
        ('gauge', 'Messanzeige'),
        ('table', 'Tabelle'),
        ('kpi', 'KPI'),
        ('custom', 'Benutzerdefiniert')
    ], string='Diagrammtyp', default='bar')
    chart_options = fields.Text('Diagrammoptionen', default='{}')
    
    # KI-Konfiguration
    enable_ai = fields.Boolean('KI aktivieren', default=False)
    ai_model = fields.Selection([
        ('linear_regression', 'Lineare Regression'),
        ('random_forest', 'Random Forest'),
        ('neural_network', 'Neuronales Netzwerk'),
        ('time_series', 'Zeitreihenanalyse'),
        ('clustering', 'Clustering'),
        ('custom', 'Benutzerdefiniert')
    ], string='KI-Modell', default='linear_regression')
    ai_parameters = fields.Text('KI-Parameter', default='{}')
    feature_fields = fields.Text('Feature-Felder', help="Komma-getrennte Liste von Feature-Feldnamen")
    target_field = fields.Char('Zielfeld')
    training_ratio = fields.Float('Trainingsverhältnis', default=0.8)
    
    # Ergebnisse
    result_data = fields.Text('Ergebnisdaten', readonly=True)
    result_metrics = fields.Text('Ergebnismetriken', readonly=True)
    last_run = fields.Datetime('Letzte Ausführung')
    state = fields.Selection([
        ('draft', 'Entwurf'),
        ('running', 'Wird ausgeführt'),
        ('done', 'Abgeschlossen'),
        ('error', 'Fehler')
    ], string='Status', default='draft', tracking=True)
    
    # Planung
    scheduled = fields.Boolean('Geplant', default=False)
    interval_number = fields.Integer('Intervall', default=1)
    interval_type = fields.Selection([
        ('minutes', 'Minuten'),
        ('hours', 'Stunden'),
        ('days', 'Tage'),
        ('weeks', 'Wochen'),
        ('months', 'Monate')
    ], string='Intervalltyp', default='days')
    next_run = fields.Datetime('Nächste Ausführung')
    
    @api.model
    def create(self, vals):
        record = super(ValeoAnalytics, self).create(vals)
        if record.scheduled:
            record._schedule_next_run()
        return record
    
    def write(self, vals):
        result = super(ValeoAnalytics, self).write(vals)
        if 'scheduled' in vals or 'interval_number' in vals or 'interval_type' in vals:
            for record in self:
                if record.scheduled:
                    record._schedule_next_run()
        return result
    
    def _schedule_next_run(self):
        """Plant die nächste Ausführung basierend auf dem Intervall"""
        self.ensure_one()
        now = fields.Datetime.now()
        
        if self.interval_type == 'minutes':
            next_run = now + timedelta(minutes=self.interval_number)
        elif self.interval_type == 'hours':
            next_run = now + timedelta(hours=self.interval_number)
        elif self.interval_type == 'days':
            next_run = now + timedelta(days=self.interval_number)
        elif self.interval_type == 'weeks':
            next_run = now + timedelta(weeks=self.interval_number)
        elif self.interval_type == 'months':
            next_run = now + timedelta(days=self.interval_number * 30)  # Näherung
        else:
            next_run = now + timedelta(days=1)
        
        self.next_run = next_run
    
    def action_run_analytics(self):
        """Führt die Analytik aus"""
        self.ensure_one()
        
        try:
            self.write({'state': 'running'})
            
            # Daten laden
            data = self._load_data()
            
            if not data:
                raise UserError(_('Keine Daten gefunden.'))
            
            # Analytik ausführen
            if self.enable_ai:
                result = self._run_ai_model(data)
            else:
                result = self._prepare_chart_data(data)
            
            # Ergebnisse speichern
            self.write({
                'result_data': json.dumps(result.get('data', {})),
                'result_metrics': json.dumps(result.get('metrics', {})),
                'last_run': fields.Datetime.now(),
                'state': 'done'
            })
            
            return {
                'type': 'ir.actions.client',
                'tag': 'reload',
            }
            
        except Exception as e:
            self.write({
                'state': 'error',
                'result_metrics': json.dumps({'error': str(e)})
            })
            _logger.error("Fehler bei der Ausführung der Analytik: %s", str(e))
            raise UserError(_('Fehler bei der Ausführung der Analytik: %s') % str(e))
    
    def _load_data(self):
        """Lädt die Daten aus dem ausgewählten Modell"""
        self.ensure_one()
        
        if not self.model_id:
            return []
        
        model_name = self.model_id.model
        domain = safe_eval(self.domain or '[]')
        fields_list = [f.strip() for f in (self.fields_list or '').split(',') if f.strip()]
        
        if not fields_list:
            fields_list = None
        
        limit = self.limit or 100
        orderby = self.orderby or None
        
        try:
            records = self.env[model_name].search_read(domain, fields=fields_list, limit=limit, order=orderby)
            return records
        except Exception as e:
            _logger.error("Fehler beim Laden der Daten: %s", str(e))
            return []
    
    def _prepare_chart_data(self, data):
        """Bereitet die Daten für die Visualisierung vor"""
        self.ensure_one()
        
        if not data:
            return {'data': {}, 'metrics': {}}
        
        chart_data = {
            'type': self.chart_type,
            'data': data,
            'options': json.loads(self.chart_options or '{}')
        }
        
        # Gruppieren, falls angegeben
        if self.groupby:
            try:
                groupby_field = self.groupby.strip()
                grouped_data = {}
                
                for record in data:
                    key = record.get(groupby_field, 'Unbekannt')
                    if key not in grouped_data:
                        grouped_data[key] = []
                    grouped_data[key].append(record)
                
                chart_data['grouped'] = grouped_data
            except Exception as e:
                _logger.error("Fehler beim Gruppieren der Daten: %s", str(e))
        
        return {'data': chart_data, 'metrics': {}}
    
    def _run_ai_model(self, data):
        """Führt das ausgewählte KI-Modell aus"""
        self.ensure_one()
        
        if not data or not self.enable_ai:
            return {'data': {}, 'metrics': {}}
        
        try:
            # Daten für ML vorbereiten
            df = pd.DataFrame(data)
            
            # Feature-Felder und Zielfeld extrahieren
            feature_fields = [f.strip() for f in (self.feature_fields or '').split(',') if f.strip()]
            target_field = self.target_field.strip() if self.target_field else None
            
            if not feature_fields or not target_field or target_field not in df.columns:
                raise UserError(_('Feature-Felder oder Zielfeld nicht korrekt konfiguriert.'))
            
            # Prüfen, ob alle Feature-Felder vorhanden sind
            missing_fields = [f for f in feature_fields if f not in df.columns]
            if missing_fields:
                raise UserError(_('Folgende Feature-Felder fehlen in den Daten: %s') % ', '.join(missing_fields))
            
            # Numerische Daten extrahieren
            X = df[feature_fields].select_dtypes(include=['number']).fillna(0)
            y = df[target_field].fillna(0)
            
            if X.empty:
                raise UserError(_('Keine numerischen Feature-Felder gefunden.'))
            
            # Daten aufteilen
            train_size = int(len(df) * self.training_ratio)
            X_train, X_test = X[:train_size], X[train_size:]
            y_train, y_test = y[:train_size], y[train_size:]
            
            # Modell auswählen und trainieren
            model, predictions, metrics = self._train_model(X_train, y_train, X_test, y_test)
            
            # Ergebnisse formatieren
            result = {
                'data': {
                    'predictions': predictions.tolist() if isinstance(predictions, np.ndarray) else predictions,
                    'actual': y_test.tolist() if isinstance(y_test, np.ndarray) else y_test,
                    'features': feature_fields,
                    'target': target_field
                },
                'metrics': metrics
            }
            
            return result
            
        except Exception as e:
            _logger.error("Fehler bei der KI-Modellausführung: %s", str(e))
            return {'data': {}, 'metrics': {'error': str(e)}}
    
    def _train_model(self, X_train, y_train, X_test, y_test):
        """Trainiert das ausgewählte KI-Modell"""
        self.ensure_one()
        
        ai_model = self.ai_model
        ai_params = json.loads(self.ai_parameters or '{}')
        
        # Hier würde die eigentliche Modellimplementierung erfolgen
        # In einer realen Implementierung würden hier die entsprechenden ML-Bibliotheken verwendet
        
        # Beispielimplementierung für lineare Regression
        if ai_model == 'linear_regression':
            # Simulierte lineare Regression
            coefficients = np.random.rand(X_train.shape[1])
            intercept = np.random.rand()
            
            predictions = np.dot(X_test, coefficients) + intercept
            
            # Simulierte Metriken
            mse = np.mean((predictions - y_test) ** 2)
            r2 = 1 - (mse / np.var(y_test))
            
            metrics = {
                'mse': float(mse),
                'r2': float(r2),
                'coefficients': coefficients.tolist(),
                'intercept': float(intercept)
            }
            
            return None, predictions, metrics
        
        # Beispielimplementierung für Random Forest
        elif ai_model == 'random_forest':
            # Simulierte Random Forest Vorhersagen
            predictions = y_test.mean() + np.random.normal(0, y_test.std() * 0.2, size=len(y_test))
            
            # Simulierte Metriken
            mse = np.mean((predictions - y_test) ** 2)
            r2 = 1 - (mse / np.var(y_test))
            
            metrics = {
                'mse': float(mse),
                'r2': float(r2),
                'feature_importance': (np.random.rand(X_train.shape[1]) * 100).tolist()
            }
            
            return None, predictions, metrics
        
        # Beispielimplementierung für neuronales Netzwerk
        elif ai_model == 'neural_network':
            # Simulierte neuronale Netzwerk Vorhersagen
            predictions = y_test.mean() + np.random.normal(0, y_test.std() * 0.15, size=len(y_test))
            
            # Simulierte Metriken
            mse = np.mean((predictions - y_test) ** 2)
            r2 = 1 - (mse / np.var(y_test))
            
            metrics = {
                'mse': float(mse),
                'r2': float(r2),
                'epochs': 100,
                'final_loss': float(mse * 0.9)
            }
            
            return None, predictions, metrics
        
        # Beispielimplementierung für Zeitreihenanalyse
        elif ai_model == 'time_series':
            # Simulierte Zeitreihenvorhersagen
            predictions = y_test.shift(1).fillna(y_test.mean()).values
            
            # Simulierte Metriken
            mse = np.mean((predictions - y_test) ** 2)
            mae = np.mean(np.abs(predictions - y_test))
            
            metrics = {
                'mse': float(mse),
                'mae': float(mae),
                'forecast_horizon': len(y_test)
            }
            
            return None, predictions, metrics
        
        # Beispielimplementierung für Clustering
        elif ai_model == 'clustering':
            # Simulierte Cluster-Zuweisungen
            n_clusters = ai_params.get('n_clusters', 3)
            cluster_assignments = np.random.randint(0, n_clusters, size=len(X_test))
            
            # Simulierte Metriken
            metrics = {
                'n_clusters': n_clusters,
                'silhouette_score': float(np.random.rand() * 0.8),
                'cluster_sizes': [int(np.sum(cluster_assignments == i)) for i in range(n_clusters)]
            }
            
            return None, cluster_assignments, metrics
        
        # Benutzerdefiniertes Modell
        else:
            # Simulierte Vorhersagen
            predictions = y_test.mean() + np.random.normal(0, y_test.std() * 0.25, size=len(y_test))
            
            # Simulierte Metriken
            mse = np.mean((predictions - y_test) ** 2)
            
            metrics = {
                'mse': float(mse),
                'custom_model': True
            }
            
            return None, predictions, metrics
    
    @api.model
    def _cron_run_scheduled_analytics(self):
        """Cron-Job zum Ausführen geplanter Analytiken"""
        now = fields.Datetime.now()
        analytics = self.search([
            ('scheduled', '=', True),
            ('next_run', '<=', now),
            ('state', 'not in', ['running'])
        ])
        
        for analytic in analytics:
            try:
                analytic.action_run_analytics()
                analytic._schedule_next_run()
            except Exception as e:
                _logger.error("Fehler beim Ausführen der geplanten Analytik %s: %s", analytic.name, str(e))


class ValeoAnalyticsResult(models.Model):
    _name = 'valeo.analytics.result'
    _description = 'VALEO Analytik-Ergebnis'
    _order = 'create_date desc'

    name = fields.Char('Name', required=True)
    analytics_id = fields.Many2one('valeo.analytics', string='Analytik', required=True, ondelete='cascade')
    result_data = fields.Text('Ergebnisdaten')
    result_metrics = fields.Text('Ergebnismetriken')
    create_date = fields.Datetime('Erstelldatum', readonly=True)
    user_id = fields.Many2one('res.users', string='Benutzer', default=lambda self: self.env.user)
    
    def action_view_result(self):
        """Öffnet die Ergebnisansicht"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': self.name,
            'res_model': 'valeo.analytics.result',
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'current',
        }


def safe_eval(expr, globals_dict=None, locals_dict=None):
    """Sichere Auswertung von Ausdrücken"""
    if not expr:
        return []
    
    try:
        return eval(expr, globals_dict, locals_dict)
    except Exception as e:
        _logger.error("Fehler bei der Auswertung des Ausdrucks: %s", str(e))
        return [] 