# -*- coding: utf-8 -*-
# Part of VALEO NeuroERP. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, tools, _
from odoo.exceptions import UserError, ValidationError
import logging
import json
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

_logger = logging.getLogger(__name__)

class MCPAnalyticsReport(models.Model):
    _name = 'mcp.analytics.report'
    _description = 'KI-gestützte Analyseberichte'
    _order = 'create_date desc'
    
    name = fields.Char('Berichtsname', required=True)
    description = fields.Text('Beschreibung')
    user_id = fields.Many2one('res.users', string='Erstellt von', default=lambda self: self.env.user)
    company_id = fields.Many2one('res.company', string='Unternehmen', default=lambda self: self.env.company)
    create_date = fields.Datetime('Erstellungsdatum', readonly=True)
    
    report_type = fields.Selection([
        ('anomaly_detection', 'Anomalieerkennung'),
        ('trend_analysis', 'Trendanalyse'),
        ('forecast', 'Prognose'),
        ('customer_segmentation', 'Kundensegmentierung'),
        ('product_recommendation', 'Produktempfehlung'),
        ('custom', 'Benutzerdefiniert')
    ], string='Berichtstyp', required=True)
    
    model_id = fields.Many2one('mcp.provider.model', string='KI-Modell', 
                              domain=[('provider_id.model_type', '=', 'completion')])
    
    data_source = fields.Selection([
        ('accounting', 'Buchhaltung'),
        ('sales', 'Verkauf'),
        ('inventory', 'Bestand'),
        ('purchase', 'Einkauf'),
        ('manufacturing', 'Fertigung'),
        ('crm', 'CRM'),
        ('hr', 'Personal'),
        ('custom_query', 'Benutzerdefinierte Abfrage')
    ], string='Datenquelle', required=True)
    
    time_range = fields.Selection([
        ('last_week', 'Letzte Woche'),
        ('last_month', 'Letzter Monat'),
        ('last_quarter', 'Letztes Quartal'),
        ('last_year', 'Letztes Jahr'),
        ('ytd', 'Jahr bis heute'),
        ('custom', 'Benutzerdefiniert')
    ], string='Zeitraum', default='last_month')
    
    date_from = fields.Date('Von Datum')
    date_to = fields.Date('Bis Datum')
    
    query = fields.Text('SQL-Abfrage', help="Benutzerdefinierte SQL-Abfrage für die Datenextraktion")
    raw_data = fields.Text('Rohdaten', help="JSON-formatierte Rohdaten für die Analyse")
    
    result = fields.Text('Analyseergebnis', help="JSON-formatiertes Ergebnis der Analyse")
    summary = fields.Text('Zusammenfassung', help="KI-generierte Zusammenfassung der Analyseergebnisse")
    
    chart_type = fields.Selection([
        ('bar', 'Balkendiagramm'),
        ('line', 'Liniendiagramm'),
        ('pie', 'Kreisdiagramm'),
        ('scatter', 'Streudiagramm'),
        ('heatmap', 'Heatmap'),
        ('table', 'Tabelle')
    ], string='Diagrammtyp', default='bar')
    
    chart_config = fields.Text('Diagrammkonfiguration', 
                              help="JSON-formatierte Konfiguration für das Diagramm")
    
    state = fields.Selection([
        ('draft', 'Entwurf'),
        ('processing', 'In Bearbeitung'),
        ('done', 'Abgeschlossen'),
        ('error', 'Fehler')
    ], string='Status', default='draft')
    
    error_message = fields.Text('Fehlermeldung')
    
    def _prepare_data(self):
        """Daten aus der ausgewählten Quelle vorbereiten"""
        self.ensure_one()
        if self.data_source == 'custom_query' and self.query:
            try:
                self.env.cr.execute(self.query)
                results = self.env.cr.dictfetchall()
                self.raw_data = json.dumps(results)
                return results
            except Exception as e:
                self.write({
                    'state': 'error',
                    'error_message': str(e)
                })
                return False
        else:
            # Implementierung für Standarddatenquellen
            date_from = self.date_from
            date_to = self.date_to
            
            if not date_from or not date_to:
                today = fields.Date.today()
                if self.time_range == 'last_week':
                    date_from = today - timedelta(days=7)
                    date_to = today
                elif self.time_range == 'last_month':
                    date_from = today.replace(day=1) - timedelta(days=1)
                    date_from = date_from.replace(day=1)
                    date_to = today
                elif self.time_range == 'last_quarter':
                    month = (today.month - 1) // 3 * 3 + 1
                    date_from = today.replace(month=month, day=1) - timedelta(days=90)
                    date_to = today
                elif self.time_range == 'last_year':
                    date_from = today.replace(year=today.year-1)
                    date_to = today
                elif self.time_range == 'ytd':
                    date_from = today.replace(month=1, day=1)
                    date_to = today
            
            # Datenbeschaffungslogik je nach Datenquelle
            if self.data_source == 'accounting':
                return self._get_accounting_data(date_from, date_to)
            elif self.data_source == 'sales':
                return self._get_sales_data(date_from, date_to)
            # Weitere Implementierungen für andere Datenquellen
        
        return False
    
    def _get_accounting_data(self, date_from, date_to):
        """Buchhaltungsdaten für die Analyse abrufen"""
        query = """
            SELECT 
                am.id as move_id,
                am.name as move_name,
                am.date,
                am.journal_id,
                aj.name as journal_name,
                aj.type as journal_type,
                am.partner_id,
                rp.name as partner_name,
                am.amount_total,
                am.amount_total_signed,
                am.state,
                aml.account_id,
                aa.name as account_name,
                aa.code as account_code,
                aml.debit,
                aml.credit,
                aml.balance
            FROM account_move am
            JOIN account_move_line aml ON am.id = aml.move_id
            JOIN account_journal aj ON am.journal_id = aj.id
            JOIN account_account aa ON aml.account_id = aa.id
            LEFT JOIN res_partner rp ON am.partner_id = rp.id
            WHERE am.date >= %s AND am.date <= %s
            AND am.state = 'posted'
        """
        self.env.cr.execute(query, (date_from, date_to))
        results = self.env.cr.dictfetchall()
        self.raw_data = json.dumps(results)
        return results
    
    def _get_sales_data(self, date_from, date_to):
        """Verkaufsdaten für die Analyse abrufen"""
        query = """
            SELECT 
                so.id as order_id,
                so.name as order_name,
                so.date_order,
                so.partner_id,
                rp.name as partner_name,
                rp.partner_category,
                sol.product_id,
                pt.name as product_name,
                pc.name as category_name,
                sol.product_uom_qty,
                sol.price_unit,
                sol.price_subtotal,
                sol.price_total,
                so.amount_untaxed,
                so.amount_tax,
                so.amount_total,
                so.state
            FROM sale_order so
            JOIN sale_order_line sol ON so.id = sol.order_id
            JOIN res_partner rp ON so.partner_id = rp.id
            JOIN product_product pp ON sol.product_id = pp.id
            JOIN product_template pt ON pp.product_tmpl_id = pt.id
            LEFT JOIN product_category pc ON pt.categ_id = pc.id
            WHERE so.date_order::date >= %s AND so.date_order::date <= %s
        """
        self.env.cr.execute(query, (date_from, date_to))
        results = self.env.cr.dictfetchall()
        self.raw_data = json.dumps(results)
        return results
    
    def generate_report(self):
        """Bericht basierend auf dem ausgewählten Typ generieren"""
        self.ensure_one()
        
        if not self.model_id:
            raise UserError(_('Bitte ein KI-Modell auswählen'))
        
        self.write({'state': 'processing'})
        
        try:
            data = self._prepare_data()
            if not data:
                raise UserError(_('Keine Daten zum Analysieren gefunden'))
            
            # Führe die entsprechende Analysemethode basierend auf dem Berichtstyp aus
            if self.report_type == 'anomaly_detection':
                result = self._perform_anomaly_detection(data)
            elif self.report_type == 'trend_analysis':
                result = self._perform_trend_analysis(data)
            elif self.report_type == 'forecast':
                result = self._perform_forecast(data)
            elif self.report_type == 'customer_segmentation':
                result = self._perform_customer_segmentation(data)
            elif self.report_type == 'product_recommendation':
                result = self._perform_product_recommendation(data)
            else:
                result = self._perform_custom_analysis(data)
            
            # Generiere eine KI-Zusammenfassung der Ergebnisse
            summary = self._generate_ai_summary(result)
            
            self.write({
                'result': json.dumps(result),
                'summary': summary,
                'state': 'done'
            })
            
            return True
            
        except Exception as e:
            self.write({
                'state': 'error',
                'error_message': str(e)
            })
            _logger.error("Fehler bei der Berichtsgenerierung: %s", str(e))
            return False
    
    def _perform_anomaly_detection(self, data):
        """Führt eine Anomalieerkennung auf den Daten durch"""
        try:
            # Konvertiere Daten in ein pandas DataFrame
            df = pd.DataFrame(data)
            
            # Extrahiere numerische Spalten für die Analyse
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            
            if not numeric_cols:
                return {'error': 'Keine numerischen Daten für die Analyse gefunden'}
            
            # Standardisiere die Daten
            scaler = StandardScaler()
            scaled_data = scaler.fit_transform(df[numeric_cols])
            
            # Dimensionalitätsreduktion mit PCA
            pca = PCA(n_components=2)
            pca_result = pca.fit_transform(scaled_data)
            
            # Anomalien mit Mahalanobis-Distanz identifizieren
            from scipy.stats import chi2
            
            # Berechne Mahalanobis-Distanz
            mean = np.mean(scaled_data, axis=0)
            cov = np.cov(scaled_data, rowvar=False)
            inv_cov = np.linalg.inv(cov)
            
            mahalanobis_dist = []
            for i in range(scaled_data.shape[0]):
                x = scaled_data[i]
                dist = np.sqrt(np.dot(np.dot((x - mean), inv_cov), (x - mean).T))
                mahalanobis_dist.append(dist)
            
            # Schwellenwert für Anomalien (95% Konfidenzintervall)
            threshold = chi2.ppf(0.95, df=len(numeric_cols))
            
            # Identifiziere Anomalien
            anomalies_indices = [i for i, dist in enumerate(mahalanobis_dist) if dist > threshold]
            anomalies = df.iloc[anomalies_indices].to_dict('records')
            
            result = {
                'anomaly_count': len(anomalies),
                'anomaly_percentage': len(anomalies) / len(data) * 100,
                'anomalies': anomalies,
                'pca_result': pca_result.tolist(),
                'mahalanobis_distances': mahalanobis_dist,
                'threshold': threshold
            }
            
            return result
            
        except Exception as e:
            _logger.error("Fehler bei der Anomalieerkennung: %s", str(e))
            return {'error': str(e)}
    
    def _perform_trend_analysis(self, data):
        """Führt eine Trendanalyse auf den Daten durch"""
        try:
            # Konvertiere Daten in ein pandas DataFrame
            df = pd.DataFrame(data)
            
            # Bestimme die Datumsspalte
            date_columns = [col for col in df.columns if 'date' in col.lower()]
            if not date_columns:
                return {'error': 'Keine Datumsspalte für die Trendanalyse gefunden'}
            
            date_col = date_columns[0]
            
            # Konvertiere Datumsspalte in datetime
            df[date_col] = pd.to_datetime(df[date_col])
            
            # Gruppiere nach Datum
            if self.data_source == 'accounting':
                # Gruppiere nach Datum und berechne Summen für Buchhaltungsdaten
                grouped = df.groupby(pd.Grouper(key=date_col, freq='D')).agg({
                    'debit': 'sum',
                    'credit': 'sum',
                    'balance': 'sum'
                }).reset_index()
                
                # Berechne gleitenden Durchschnitt
                grouped['debit_ma7'] = grouped['debit'].rolling(window=7).mean()
                grouped['credit_ma7'] = grouped['credit'].rolling(window=7).mean()
                grouped['balance_ma7'] = grouped['balance'].rolling(window=7).mean()
                
            elif self.data_source == 'sales':
                # Gruppiere nach Datum und berechne Summen für Verkaufsdaten
                grouped = df.groupby(pd.Grouper(key=date_col, freq='D')).agg({
                    'price_total': 'sum',
                    'product_uom_qty': 'sum'
                }).reset_index()
                
                # Berechne gleitenden Durchschnitt
                grouped['price_total_ma7'] = grouped['price_total'].rolling(window=7).mean()
                grouped['product_uom_qty_ma7'] = grouped['product_uom_qty'].rolling(window=7).mean()
            
            # Identifiziere Trends mit linearer Regression
            from sklearn.linear_model import LinearRegression
            
            X = np.array(range(len(grouped))).reshape(-1, 1)
            
            trends = {}
            for col in grouped.columns:
                if col != date_col and 'ma7' not in col and pd.api.types.is_numeric_dtype(grouped[col]):
                    y = grouped[col].fillna(0).values
                    model = LinearRegression()
                    model.fit(X, y)
                    
                    trends[col] = {
                        'slope': float(model.coef_[0]),
                        'trend': 'steigend' if model.coef_[0] > 0 else 'fallend' if model.coef_[0] < 0 else 'stabil',
                        'r2': model.score(X, y)
                    }
            
            result = {
                'time_series': grouped.to_dict('records'),
                'trends': trends
            }
            
            return result
            
        except Exception as e:
            _logger.error("Fehler bei der Trendanalyse: %s", str(e))
            return {'error': str(e)}
    
    def _perform_customer_segmentation(self, data):
        """Führt eine Kundensegmentierung durch"""
        try:
            # Konvertiere Daten in ein pandas DataFrame
            df = pd.DataFrame(data)
            
            # Prüfe ob Kundendaten vorhanden sind
            if 'partner_id' not in df.columns:
                return {'error': 'Keine Partnerdaten für die Segmentierung gefunden'}
            
            # Aggregiere Daten nach Kunden
            customer_data = df.groupby('partner_id').agg({
                'price_total': 'sum',
                'order_id': 'count'
            }).reset_index()
            
            customer_data.columns = ['partner_id', 'total_spend', 'order_count']
            
            # Berechne durchschnittlichen Bestellwert
            customer_data['avg_order_value'] = customer_data['total_spend'] / customer_data['order_count']
            
            # Standardisiere die Daten für Clustering
            features = ['total_spend', 'order_count', 'avg_order_value']
            scaler = StandardScaler()
            scaled_features = scaler.fit_transform(customer_data[features])
            
            # KMeans Clustering für Kundensegmentierung
            kmeans = KMeans(n_clusters=4, random_state=42)
            customer_data['cluster'] = kmeans.fit_predict(scaled_features)
            
            # Beschreibe die Cluster
            cluster_description = {}
            for cluster in range(4):
                cluster_data = customer_data[customer_data['cluster'] == cluster]
                cluster_description[f'cluster_{cluster}'] = {
                    'count': len(cluster_data),
                    'avg_total_spend': float(cluster_data['total_spend'].mean()),
                    'avg_order_count': float(cluster_data['order_count'].mean()),
                    'avg_order_value': float(cluster_data['avg_order_value'].mean())
                }
            
            # Erweitere mit Partnernamen
            partner_ids = customer_data['partner_id'].tolist()
            partners = self.env['res.partner'].browse(partner_ids)
            partner_names = {partner.id: partner.name for partner in partners}
            
            segmentation_results = []
            for _, row in customer_data.iterrows():
                segmentation_results.append({
                    'partner_id': int(row['partner_id']),
                    'partner_name': partner_names.get(int(row['partner_id']), 'Unbekannt'),
                    'total_spend': float(row['total_spend']),
                    'order_count': int(row['order_count']),
                    'avg_order_value': float(row['avg_order_value']),
                    'cluster': int(row['cluster'])
                })
            
            result = {
                'cluster_description': cluster_description,
                'customer_segments': segmentation_results
            }
            
            return result
            
        except Exception as e:
            _logger.error("Fehler bei der Kundensegmentierung: %s", str(e))
            return {'error': str(e)}
    
    def _generate_ai_summary(self, result):
        """Generiert eine KI-basierte Zusammenfassung der Analyseergebnisse"""
        if not self.model_id:
            return _("Kein KI-Modell ausgewählt für die Zusammenfassung.")
            
        if 'error' in result:
            return _("Fehler bei der Analyse: %s") % result['error']
            
        try:
            # Bereite die Eingabeaufforderung vor
            prompt = f"""
            Analysiere die folgenden Daten und erstelle eine kurze, prägnante Zusammenfassung 
            für Geschäftsführer. Hebe die wichtigsten Erkenntnisse hervor und biete
            konkrete Handlungsempfehlungen basierend auf den Daten.
            
            Berichtstyp: {self.report_type}
            Datenquelle: {self.data_source}
            Zeitraum: {self.time_range}
            
            Analyseergebnisse:
            {json.dumps(result, indent=2)}
            """
            
            # Führe die KI-Anfrage durch
            provider = self.model_id.provider_id
            model = self.model_id
            
            mcp_context = self.env['mcp.context'].create({
                'name': f'Analyse-Zusammenfassung für {self.name}',
                'content': prompt
            })
            
            response = provider._call_api(
                model.name,
                prompt,
                max_tokens=1000,
                temperature=0.3
            )
            
            # Protokolliere die Interaktion
            self.env['mcp.interaction.log'].create({
                'name': f'Analyse-Zusammenfassung für {self.name}',
                'user_id': self.env.user.id,
                'provider_id': provider.id,
                'model_id': model.id,
                'prompt': prompt,
                'response': response,
                'context_id': mcp_context.id,
                'token_usage': len(prompt.split()) + len(response.split()),  # Einfache Schätzung
                'success': True
            })
            
            return response
            
        except Exception as e:
            _logger.error("Fehler bei der KI-Zusammenfassung: %s", str(e))
            return _("Fehler bei der Generierung der KI-Zusammenfassung: %s") % str(e)

class MCPAnalyticsDashboard(models.Model):
    _name = 'mcp.analytics.dashboard'
    _description = 'KI-Analysedashboard'
    
    name = fields.Char('Dashboard-Name', required=True)
    description = fields.Text('Beschreibung')
    user_id = fields.Many2one('res.users', string='Erstellt von', default=lambda self: self.env.user)
    company_id = fields.Many2one('res.company', string='Unternehmen', default=lambda self: self.env.company)
    
    report_ids = fields.Many2many('mcp.analytics.report', string='Enthaltene Berichte')
    layout = fields.Text('Dashboard-Layout', help="JSON-formatiertes Layout des Dashboards")
    
    is_favorite = fields.Boolean('Favorit', default=False)
    is_public = fields.Boolean('Öffentlich', default=False)
    
    def open_dashboard(self):
        """Öffnet die Dashboard-Ansicht"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'mcp.analytics.dashboard',
            'view_mode': 'form',
            'res_id': self.id,
            'target': 'current',
            'context': {'form_view_ref': 'mcp.view_mcp_analytics_dashboard_form'}
        } 