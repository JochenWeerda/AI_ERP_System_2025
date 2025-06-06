import os
import logging
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime

class EmailService:
    """
    E-Mail-Dienst zur Integration mit verschiedenen E-Mail-Providern
    Unterstützt: SMTP, SendGrid, Mailgun
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        self.logger = logging.getLogger(__name__)
        self.config = config or {}
        self.provider = self.config.get("provider", "smtp").lower()
        
        # Default-Konfiguration
        if not self.config:
            self.config = {
                "provider": "smtp",
                "smtp": {
                    "server": os.environ.get("SMTP_SERVER", "smtp.example.com"),
                    "port": int(os.environ.get("SMTP_PORT", "587")),
                    "username": os.environ.get("SMTP_USERNAME", "user@example.com"),
                    "password": os.environ.get("SMTP_PASSWORD", "password"),
                    "use_tls": os.environ.get("SMTP_USE_TLS", "True").lower() == "true",
                    "from_email": os.environ.get("SMTP_FROM_EMAIL", "noreply@example.com"),
                    "from_name": os.environ.get("SMTP_FROM_NAME", "ERP-System")
                },
                "sendgrid": {
                    "api_key": os.environ.get("SENDGRID_API_KEY", ""),
                    "from_email": os.environ.get("SENDGRID_FROM_EMAIL", "noreply@example.com"),
                    "from_name": os.environ.get("SENDGRID_FROM_NAME", "ERP-System")
                },
                "mailgun": {
                    "api_key": os.environ.get("MAILGUN_API_KEY", ""),
                    "domain": os.environ.get("MAILGUN_DOMAIN", "mg.example.com"),
                    "from_email": os.environ.get("MAILGUN_FROM_EMAIL", "noreply@example.com"),
                    "from_name": os.environ.get("MAILGUN_FROM_NAME", "ERP-System")
                }
            }
    
    def send_email(self, to_email: str, subject: str, body: str, 
                   cc: List[str] = None, bcc: List[str] = None, 
                   html_body: str = None, attachments: List[Dict[str, Any]] = None,
                   template_id: str = None, template_data: Dict[str, Any] = None) -> Tuple[bool, str]:
        """
        Sendet eine E-Mail über den konfigurierten Provider
        
        Args:
            to_email: Empfänger-E-Mail-Adresse oder kommagetrennte Liste von Adressen
            subject: Betreff der E-Mail
            body: Textkörper der E-Mail
            cc: Liste von CC-Empfängern
            bcc: Liste von BCC-Empfängern
            html_body: HTML-Version des E-Mail-Körpers
            attachments: Liste von Anhängen (Dict mit name, content_type, content)
            template_id: ID einer E-Mail-Vorlage (für Provider, die Templates unterstützen)
            template_data: Daten für die Vorlage
            
        Returns:
            Tuple mit (Erfolg, Fehlermeldung oder leerer String)
        """
        try:
            self.logger.info(f"Sende E-Mail an {to_email} über {self.provider}")
            
            if self.provider == "smtp":
                return self._send_via_smtp(to_email, subject, body, cc, bcc, html_body, attachments)
            elif self.provider == "sendgrid":
                return self._send_via_sendgrid(to_email, subject, body, cc, bcc, html_body, attachments, template_id, template_data)
            elif self.provider == "mailgun":
                return self._send_via_mailgun(to_email, subject, body, cc, bcc, html_body, attachments, template_id, template_data)
            else:
                error_msg = f"Unbekannter E-Mail-Provider: {self.provider}"
                self.logger.error(error_msg)
                return False, error_msg
                
        except Exception as e:
            error_msg = f"Fehler beim Senden der E-Mail: {str(e)}"
            self.logger.error(error_msg)
            return False, error_msg
    
    def _send_via_smtp(self, to_email: str, subject: str, body: str, 
                      cc: List[str] = None, bcc: List[str] = None, 
                      html_body: str = None, attachments: List[Dict[str, Any]] = None) -> Tuple[bool, str]:
        """Sendet eine E-Mail über SMTP"""
        try:
            smtp_config = self.config.get("smtp", {})
            
            message = MIMEMultipart("alternative")
            message["From"] = f"{smtp_config.get('from_name')} <{smtp_config.get('from_email')}>"
            message["To"] = to_email
            message["Subject"] = subject
            
            if cc:
                message["Cc"] = ", ".join(cc)
            if bcc:
                message["Bcc"] = ", ".join(bcc)
            
            # Text-Version
            part1 = MIMEText(body, "plain")
            message.attach(part1)
            
            # HTML-Version (falls vorhanden)
            if html_body:
                part2 = MIMEText(html_body, "html")
                message.attach(part2)
            
            # Anhänge werden hier nicht implementiert, können aber hinzugefügt werden
            
            # SMTP-Verbindung herstellen und E-Mail senden
            server = smtplib.SMTP(smtp_config.get("server"), smtp_config.get("port"))
            
            if smtp_config.get("use_tls", True):
                server.starttls()
                
            if smtp_config.get("username") and smtp_config.get("password"):
                server.login(smtp_config.get("username"), smtp_config.get("password"))
            
            all_recipients = [to_email]
            if cc:
                all_recipients.extend(cc)
            if bcc:
                all_recipients.extend(bcc)
                
            server.sendmail(
                smtp_config.get("from_email"),
                all_recipients,
                message.as_string()
            )
            server.quit()
            
            return True, ""
            
        except Exception as e:
            error_msg = f"SMTP-Fehler: {str(e)}"
            self.logger.error(error_msg)
            return False, error_msg
    
    def _send_via_sendgrid(self, to_email: str, subject: str, body: str, 
                         cc: List[str] = None, bcc: List[str] = None, 
                         html_body: str = None, attachments: List[Dict[str, Any]] = None,
                         template_id: str = None, template_data: Dict[str, Any] = None) -> Tuple[bool, str]:
        """Sendet eine E-Mail über SendGrid API"""
        try:
            sendgrid_config = self.config.get("sendgrid", {})
            api_key = sendgrid_config.get("api_key")
            
            if not api_key:
                return False, "SendGrid API-Schlüssel fehlt"
            
            # SendGrid API v3 Endpunkt
            url = "https://api.sendgrid.com/v3/mail/send"
            
            # E-Mail-Daten vorbereiten
            email_data = {
                "personalizations": [
                    {
                        "to": [{"email": email.strip()} for email in to_email.split(",")]
                    }
                ],
                "from": {
                    "email": sendgrid_config.get("from_email"),
                    "name": sendgrid_config.get("from_name")
                },
                "subject": subject
            }
            
            # CC und BCC hinzufügen
            if cc:
                email_data["personalizations"][0]["cc"] = [{"email": email} for email in cc]
            if bcc:
                email_data["personalizations"][0]["bcc"] = [{"email": email} for email in bcc]
            
            # Inhalt oder Vorlage
            if template_id:
                email_data["template_id"] = template_id
                if template_data:
                    email_data["personalizations"][0]["dynamic_template_data"] = template_data
            else:
                email_data["content"] = [{"type": "text/plain", "value": body}]
                if html_body:
                    email_data["content"].append({"type": "text/html", "value": html_body})
            
            # Anhänge würden hier hinzugefügt werden
            
            # API-Anfrage senden
            response = requests.post(
                url,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json=email_data
            )
            
            response.raise_for_status()
            return True, ""
            
        except requests.exceptions.RequestException as e:
            error_msg = f"SendGrid API-Fehler: {str(e)}"
            if hasattr(e, 'response') and e.response:
                error_msg += f" - {e.response.text}"
            self.logger.error(error_msg)
            return False, error_msg
    
    def _send_via_mailgun(self, to_email: str, subject: str, body: str, 
                        cc: List[str] = None, bcc: List[str] = None, 
                        html_body: str = None, attachments: List[Dict[str, Any]] = None,
                        template_id: str = None, template_data: Dict[str, Any] = None) -> Tuple[bool, str]:
        """Sendet eine E-Mail über Mailgun API"""
        try:
            mailgun_config = self.config.get("mailgun", {})
            api_key = mailgun_config.get("api_key")
            domain = mailgun_config.get("domain")
            
            if not api_key or not domain:
                return False, "Mailgun API-Schlüssel oder Domain fehlt"
            
            # Mailgun API Endpunkt
            url = f"https://api.mailgun.net/v3/{domain}/messages"
            
            # E-Mail-Daten vorbereiten
            email_data = {
                "from": f"{mailgun_config.get('from_name')} <{mailgun_config.get('from_email')}>",
                "to": to_email,
                "subject": subject,
                "text": body
            }
            
            # HTML-Version
            if html_body:
                email_data["html"] = html_body
            
            # CC und BCC
            if cc:
                email_data["cc"] = ", ".join(cc)
            if bcc:
                email_data["bcc"] = ", ".join(bcc)
            
            # Vorlagenvariablen
            if template_data:
                for key, value in template_data.items():
                    email_data[f"v:{key}"] = value
            
            # Anhänge würden hier hinzugefügt werden
            
            # API-Anfrage senden
            response = requests.post(
                url,
                auth=("api", api_key),
                data=email_data
            )
            
            response.raise_for_status()
            return True, ""
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Mailgun API-Fehler: {str(e)}"
            if hasattr(e, 'response') and e.response:
                error_msg += f" - {e.response.text}"
            self.logger.error(error_msg)
            return False, error_msg 