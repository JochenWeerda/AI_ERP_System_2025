"""
Tasks-Paket für asynchrone Verarbeitung im ERP-System.
"""

from .celery_app import celery_app, init_celery

__all__ = ["celery_app", "init_celery"] 