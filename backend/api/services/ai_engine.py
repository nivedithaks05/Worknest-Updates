from __future__ import annotations

from dataclasses import dataclass
from typing import List, Dict, Any

from ..models import Career, Skill


@dataclass
class CareerMatchResult:
  career: Career
  match_score: float  # 0-1
  missing_skills: List[str]


def _normalize_tokens(values: List[str]) -> List[str]:
  tokens: List[str] = []
  for v in values:
    for part in v.split(","):
      token = part.strip().lower()
      if token:
        tokens.append(token)
  return tokens


def compute_career_matches(skills: List[str], interests: List[str]) -> List[CareerMatchResult]:
  """
  Simple scalable scoring engine:
  - Convert user skills/interests into a normalized token set
  - For each Career, compute overlap between required_skills and user skills
  - Score = 0.7 * skill_overlap + 0.3 * interest_match
  """

  user_skill_tokens = set(_normalize_tokens(skills))
  user_interest_tokens = set(_normalize_tokens(interests))

  results: List[CareerMatchResult] = []

  for career in Career.objects.prefetch_related("required_skills").all():
    required = list(career.required_skills.all())
    if not required:
      # Avoid division by zero; treat as generic role
      skill_score = 0.3
      missing = []
    else:
      required_names = [s.name.lower() for s in required]
      required_set = set(required_names)
      overlap = required_set & user_skill_tokens
      skill_score = len(overlap) / len(required_set)
      missing = sorted(required_set - user_skill_tokens)

    # Basic interest score: how many interest tokens match industry/description
    career_tokens = _normalize_tokens(
      [career.industry or "", career.title, career.description]
    )
    career_token_set = set(career_tokens)
    interest_overlap = career_token_set & user_interest_tokens
    interest_score = (
      min(1.0, len(interest_overlap) / 3) if user_interest_tokens else 0.2
    )

    final_score = 0.7 * skill_score + 0.3 * interest_score

    results.append(
      CareerMatchResult(
        career=career,
        match_score=final_score,
        missing_skills=list(missing),
      )
    )

  # Sort by match score descending
  results.sort(key=lambda r: r.match_score, reverse=True)
  return results


def format_career_response(matches: List[CareerMatchResult], limit: int = 3) -> List[Dict[str, Any]]:
  top = matches[:limit]
  formatted: List[Dict[str, Any]] = []

  for item in top:
    c = item.career
    formatted.append(
      {
        "title": c.title,
        "description": c.description,
        "industry": c.industry,
        "avg_salary": float(c.avg_salary) if c.avg_salary is not None else None,
        "growth_rate": c.growth_rate,
        "match_score": round(item.match_score * 100, 1),  # percentage
        "missing_skills": item.missing_skills,
        "required_skills": [s.name for s in c.required_skills.all()],
        "market_insight": _market_insight(c),
        "learning_path": _learning_path(item),
      }
    )

  return formatted


def _market_insight(career: Career) -> str:
  if career.growth_rate is None:
    return "Growth data not available yet."
  if career.growth_rate >= 15:
    return "High-growth role with strong market demand."
  if career.growth_rate >= 8:
    return "Healthy growth expectations for this career path."
  if career.growth_rate >= 0:
    return "Stable demand with moderate growth projections."
  return "Market is contracting; consider this alongside emerging roles."


def _learning_path(match: CareerMatchResult) -> List[str]:
  if not match.missing_skills:
    return ["Deepen expertise with advanced projects and leadership opportunities."]

  suggestions = []
  for skill in match.missing_skills[:5]:
    suggestions.append(f"Take an intermediate course in {skill}.")
  suggestions.append("Apply new skills on an internal project in WorkNest.")
  return suggestions

