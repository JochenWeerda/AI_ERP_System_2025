"""
Monitoring-Paket für das ERP-System.
"""

from .prometheus_exporter import init_app

__all__ = ["init_app"] 