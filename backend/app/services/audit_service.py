"""
Service d'audit site web pour RiadPulse.
Analyse un site via httpx et retourne un score sur 100.
"""
import time
import httpx


async def audit_site_web(url: str) -> dict:
    """
    Lance l'audit complet d'un site web.
    Retourne un dict compatible avec global_score.py :
    {score, max, details, recommendations}
    """
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    criteria_scores = {}
    criteria_details = {}
    recommendations = []
    html = ""
    response_headers = {}
    site_accessible = False

    try:
        async with httpx.AsyncClient(headers=headers, verify=False, timeout=15) as client:
            start = time.time()
            response = await client.get(url, follow_redirects=True)
            ttfb = time.time() - start
            site_accessible = True
            html = response.text.lower()
            response_headers = {k.lower(): v.lower() for k, v in response.headers.items()}

            # --- 1. HTTPS (25 pts) ---
            if url.startswith("https://"):
                if response.status_code < 400:
                    criteria_scores["https"] = 25
                    criteria_details["https"] = "HTTPS actif avec certificat valide."
                else:
                    criteria_scores["https"] = 10
                    criteria_details["https"] = f"HTTPS actif mais erreur {response.status_code}."
                    recommendations.append({
                        "action": "Votre site HTTPS retourne une erreur. Vérifiez le certificat SSL.",
                        "gain_mad": 15000,
                        "difficulty": "facile",
                    })
            else:
                criteria_scores["https"] = 0
                criteria_details["https"] = "Pas de HTTPS. Les données visiteurs ne sont pas chiffrées."
                recommendations.append({
                    "action": "Activez HTTPS gratuitement via Let's Encrypt. Google pénalise les sites non-sécurisés.",
                    "gain_mad": 20000,
                    "difficulty": "facile",
                })

            # --- 2. Vitesse (25 pts) ---
            if ttfb < 1.0:
                criteria_scores["speed"] = 25
                criteria_details["speed"] = f"Excellent : {ttfb:.2f}s."
            elif ttfb < 2.0:
                criteria_scores["speed"] = 20
                criteria_details["speed"] = f"Bon : {ttfb:.2f}s."
            elif ttfb < 3.0:
                criteria_scores["speed"] = 15
                criteria_details["speed"] = f"Moyen : {ttfb:.2f}s."
                recommendations.append({
                    "action": "Compressez les images (WebP) et activez le cache navigateur pour passer sous 2s.",
                    "gain_mad": 25000,
                    "difficulty": "moyenne",
                })
            elif ttfb < 5.0:
                criteria_scores["speed"] = 8
                criteria_details["speed"] = f"Lent : {ttfb:.2f}s."
                recommendations.append({
                    "action": f"Votre site met {ttfb:.1f}s à charger. 53% des visiteurs partent après 3s. Passez chez un hébergeur plus rapide.",
                    "gain_mad": 35000,
                    "difficulty": "moyenne",
                })
            else:
                criteria_scores["speed"] = 3
                criteria_details["speed"] = f"Très lent : {ttfb:.2f}s."
                recommendations.append({
                    "action": f"Temps de chargement critique ({ttfb:.1f}s). Changez d'hébergeur ou utilisez un CDN comme Cloudflare.",
                    "gain_mad": 40000,
                    "difficulty": "moyenne",
                })

            # --- 3. Responsive (25 pts) ---
            has_viewport = "viewport" in html
            has_media = "@media" in html

            if has_viewport and has_media:
                criteria_scores["responsive"] = 25
                criteria_details["responsive"] = "Site responsive (viewport + media queries)."
            elif has_viewport:
                criteria_scores["responsive"] = 18
                criteria_details["responsive"] = "Viewport présent mais media queries manquantes."
                recommendations.append({
                    "action": "Ajoutez des media queries CSS pour optimiser l'affichage sur mobile.",
                    "gain_mad": 15000,
                    "difficulty": "moyenne",
                })
            else:
                criteria_scores["responsive"] = 5
                criteria_details["responsive"] = "Pas de balise viewport. Non adapté aux mobiles."
                recommendations.append({
                    "action": "Ajoutez la balise <meta name='viewport'> — 70% des voyageurs marocains réservent depuis leur téléphone.",
                    "gain_mad": 30000,
                    "difficulty": "facile",
                })

            # --- 4. Technologie (25 pts) ---
            tech_detected = []
            if "wp-content" in html or "wordpress" in response_headers.get("x-powered-by", ""):
                tech_detected.append("WordPress")
            if "wix.com" in html or "x-wix-request-id" in response_headers:
                tech_detected.append("Wix")
            if "squarespace" in html:
                tech_detected.append("Squarespace")
            if "cdn.shopify.com" in html:
                tech_detected.append("Shopify")

            if "WordPress" in tech_detected:
                criteria_scores["tech"] = 20
                criteria_details["tech"] = "WordPress détecté. Bon choix, vérifiez les plugins SEO."
                if "yoast" not in html and "rank-math" not in html and "seo" not in html:
                    recommendations.append({
                        "action": "Installez Yoast SEO ou RankMath sur WordPress pour améliorer votre référencement.",
                        "gain_mad": 20000,
                        "difficulty": "facile",
                    })
            elif "Wix" in tech_detected or "Squarespace" in tech_detected:
                criteria_scores["tech"] = 12
                criteria_details["tech"] = f"{'/'.join(tech_detected)} détecté. Limité pour le SEO."
                recommendations.append({
                    "action": "Wix/Squarespace limite votre SEO. Envisagez une migration WordPress pour plus de flexibilité.",
                    "gain_mad": 25000,
                    "difficulty": "difficile",
                })
            elif tech_detected:
                criteria_scores["tech"] = 18
                criteria_details["tech"] = f"Technologie : {', '.join(tech_detected)}."
            else:
                criteria_scores["tech"] = 15
                criteria_details["tech"] = "Technologie non identifiée (site sur mesure ou statique)."

            # --- Vérifications bonus ---
            if "booking.com" not in html and "widget" not in html and "reservation" not in html:
                recommendations.append({
                    "action": "Aucun moteur de réservation détecté sur votre site. Ajoutez un widget de réservation directe.",
                    "gain_mad": 30000,
                    "difficulty": "moyenne",
                })

            if "whatsapp" not in html and "wa.me" not in html:
                recommendations.append({
                    "action": "Ajoutez un bouton WhatsApp sur votre site — canal #1 au Maroc pour les réservations directes.",
                    "gain_mad": 15000,
                    "difficulty": "facile",
                })

    except httpx.ConnectTimeout:
        criteria_scores = {"https": 5, "speed": 0, "responsive": 0, "tech": 0}
        criteria_details = {
            "https": "Timeout — le site met trop de temps à répondre.",
            "speed": "Non mesurable (timeout).",
            "responsive": "Non vérifiable (timeout).",
            "tech": "Non détectable (timeout).",
        }
        recommendations.append({
            "action": "Votre site est inaccessible (>15s). Vérifiez l'hébergement immédiatement — chaque heure d'indisponibilité = réservations perdues.",
            "gain_mad": 50000,
            "difficulty": "moyenne",
        })

    except httpx.ConnectError:
        criteria_scores = {"https": 0, "speed": 0, "responsive": 0, "tech": 0}
        criteria_details = {
            "https": "Site inaccessible.",
            "speed": "Non mesurable.",
            "responsive": "Non vérifiable.",
            "tech": "Non détectable.",
        }
        recommendations.append({
            "action": "Votre site est hors ligne. Contactez votre hébergeur urgemment.",
            "gain_mad": 50000,
            "difficulty": "moyenne",
        })

    except Exception as e:
        criteria_scores = {"https": 0, "speed": 0, "responsive": 0, "tech": 0}
        criteria_details = {
            "https": f"Erreur : {str(e)[:80]}",
            "speed": "Non mesurable.",
            "responsive": "Non vérifiable.",
            "tech": "Non détectable.",
        }
        recommendations.append({
            "action": f"Erreur d'audit : {str(e)[:60]}. Vérifiez que l'URL est correcte.",
            "gain_mad": 10000,
            "difficulty": "facile",
        })

    total_score = sum(criteria_scores.values())

    return {
        "score": total_score,
        "max": 100,
        "details": criteria_details,
        "recommendations": recommendations,
    }