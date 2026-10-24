"""
Service d'audit site web pour RiadPulse.
Analyse un site via httpx et retourne un score sur 100.
"""
import time
import httpx
from app.schemas.audit import AuditCriterion


async def check_https(url: str, client: httpx.AsyncClient) -> AuditCriterion:
    """Vérifie si le site utilise HTTPS avec un certificat valide."""
    name = "HTTPS / Sécurité"
    max_score = 25

    if not url.startswith("https://"):
        return AuditCriterion(
            name=name,
            score=0,
            max_score=max_score,
            detail="Le site n'utilise pas HTTPS. Les données des visiteurs ne sont pas chiffrées.",
        )

    try:
        response = await client.get(url, follow_redirects=True, timeout=10)
        if response.status_code < 400:
            return AuditCriterion(
                name=name,
                score=max_score,
                max_score=max_score,
                detail="HTTPS actif avec certificat valide.",
            )
        else:
            return AuditCriterion(
                name=name,
                score=10,
                max_score=max_score,
                detail=f"HTTPS actif mais le site retourne une erreur {response.status_code}.",
            )
    except httpx.ConnectError:
        return AuditCriterion(
            name=name,
            score=5,
            max_score=max_score,
            detail="HTTPS configuré mais le certificat semble invalide ou expiré.",
        )
    except Exception as e:
        return AuditCriterion(
            name=name,
            score=0,
            max_score=max_score,
            detail=f"Erreur de connexion HTTPS : {str(e)}",
        )


async def check_speed(url: str, client: httpx.AsyncClient) -> AuditCriterion:
    """Mesure le temps de réponse du serveur (TTFB)."""
    name = "Vitesse de chargement"
    max_score = 25

    try:
        start = time.time()
        response = await client.get(url, follow_redirects=True, timeout=15)
        ttfb = time.time() - start

        if ttfb < 1.0:
            score = max_score
            detail = f"Excellent : {ttfb:.2f}s de temps de réponse."
        elif ttfb < 2.0:
            score = 20
            detail = f"Bon : {ttfb:.2f}s. Peut être amélioré."
        elif ttfb < 3.0:
            score = 15
            detail = f"Moyen : {ttfb:.2f}s. Les visiteurs risquent de partir."
        elif ttfb < 5.0:
            score = 8
            detail = f"Lent : {ttfb:.2f}s. Impact négatif sur le SEO et les conversions."
        else:
            score = 3
            detail = f"Très lent : {ttfb:.2f}s. Perte de clients garantie."

        return AuditCriterion(
            name=name,
            score=score,
            max_score=max_score,
            detail=detail,
        )
    except Exception as e:
        return AuditCriterion(
            name=name,
            score=0,
            max_score=max_score,
            detail=f"Impossible de mesurer la vitesse : {str(e)}",
        )


async def check_responsive(url: str, client: httpx.AsyncClient) -> AuditCriterion:
    """Vérifie la présence de la balise viewport (indicateur de responsive)."""
    name = "Responsive (mobile)"
    max_score = 25

    try:
        response = await client.get(url, follow_redirects=True, timeout=10)
        html = response.text.lower()

        has_viewport = "viewport" in html
        has_media_queries = "@media" in html

        if has_viewport and has_media_queries:
            score = max_score
            detail = "Balise viewport et media queries détectées. Le site est responsive."
        elif has_viewport:
            score = 18
            detail = "Balise viewport présente mais pas de media queries détectées. Responsive partiel."
        else:
            score = 5
            detail = "Pas de balise viewport. Le site n'est probablement pas adapté aux mobiles."

        return AuditCriterion(
            name=name,
            score=score,
            max_score=max_score,
            detail=detail,
        )
    except Exception as e:
        return AuditCriterion(
            name=name,
            score=0,
            max_score=max_score,
            detail=f"Impossible de vérifier le responsive : {str(e)}",
        )


async def check_tech(url: str, client: httpx.AsyncClient) -> AuditCriterion:
    """Détecte la technologie utilisée par le site."""
    name = "Technologie"
    max_score = 25

    try:
        response = await client.get(url, follow_redirects=True, timeout=10)
        html = response.text.lower()
        headers = {k.lower(): v.lower() for k, v in response.headers.items()}

        tech_detected = []

        # WordPress
        if "wp-content" in html or "wp-includes" in html or "wordpress" in headers.get("x-powered-by", ""):
            tech_detected.append("WordPress")

        # Wix
        if "wix.com" in html or "x-wix-request-id" in headers:
            tech_detected.append("Wix")

        # Squarespace
        if "squarespace" in html:
            tech_detected.append("Squarespace")

        # Shopify
        if "cdn.shopify.com" in html or "x-shopid" in headers:
            tech_detected.append("Shopify")

        # Joomla
        if "joomla" in html or "joomla" in headers.get("x-powered-by", ""):
            tech_detected.append("Joomla")

        if tech_detected:
            tech_str = ", ".join(tech_detected)
            # WordPress/Wix = OK mais limité pour le SEO
            if "WordPress" in tech_detected:
                score = 20
                detail = f"Technologie détectée : {tech_str}. Bon choix, mais vérifiez les plugins de SEO."
            elif "Wix" in tech_detected or "Squarespace" in tech_detected:
                score = 12
                detail = f"Technologie détectée : {tech_str}. Limité pour le SEO et la personnalisation."
            else:
                score = 18
                detail = f"Technologie détectée : {tech_str}."
        else:
            score = 15
            detail = "Technologie non identifiée. Probablement un site sur mesure ou statique."

        return AuditCriterion(
            name=name,
            score=score,
            max_score=max_score,
            detail=detail,
        )
    except Exception as e:
        return AuditCriterion(
            name=name,
            score=0,
            max_score=max_score,
            detail=f"Impossible de détecter la technologie : {str(e)}",
        )


def calculate_grade(total_score: int, max_total: int) -> str:
    """Calcule la lettre de note (A-F) basée sur le score."""
    percentage = (total_score / max_total) * 100 if max_total > 0 else 0

    if percentage >= 90:
        return "A"
    elif percentage >= 75:
        return "B"
    elif percentage >= 60:
        return "C"
    elif percentage >= 40:
        return "D"
    else:
        return "F"


async def audit_site_web(url: str) -> dict:
    """
    Lance l'audit complet d'un site web.
    Retourne un dict avec le score total, la note et les détails par critère.
    """
    # Normaliser l'URL
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    headers = {
        "User-Agent": "RiadPulse-Audit/1.0 (audit digital pour riads au Maroc)"
    }

    async with httpx.AsyncClient(headers=headers, verify=False) as client:
        criteria = []

        # Lancer les 4 vérifications
        https_result = await check_https(url, client)
        criteria.append(https_result)

        speed_result = await check_speed(url, client)
        criteria.append(speed_result)

        responsive_result = await check_responsive(url, client)
        criteria.append(responsive_result)

        tech_result = await check_tech(url, client)
        criteria.append(tech_result)

    total_score = sum(c.score for c in criteria)
    max_total = sum(c.max_score for c in criteria)
    grade = calculate_grade(total_score, max_total)

    return {
        "url": url,
        "total_score": total_score,
        "max_total": max_total,
        "grade": grade,
        "criteria": [c.model_dump() for c in criteria],
    }