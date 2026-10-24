"""
Schémas Pydantic pour le module d'audit site web.
"""
from pydantic import BaseModel, HttpUrl


class AuditSiteWebRequest(BaseModel):
    """Requête : l'URL du site à auditer."""
    url: str


class AuditCriterion(BaseModel):
    """Un critère individuel de l'audit."""
    name: str
    score: int
    max_score: int
    detail: str


class AuditSiteWebResponse(BaseModel):
    """Réponse complète de l'audit site web."""
    url: str
    total_score: int
    max_total: int
    grade: str
    criteria: list[AuditCriterion]