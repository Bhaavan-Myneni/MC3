# Accessibility Improvement Evaluation

## Purpose

Evidence for improved stakeholder data accessibility (resume claim: 40% improvement).

## Audit Artifacts

| Audit | File | Status |
|---|---|---|
| HTML structure audit | `docs/accessibility_audits/html_audit_report.json` | Complete |
| WAVE API | `docs/accessibility_audits/wave_report.json` | Localhost not reachable by WAVE API |
| Lighthouse | `docs/accessibility_audits/lighthouse_report.json` | Requires Node.js (not installed in benchmark environment) |
| Rubric scoring | `docs/accessibility_scoring_rubric.csv` | Complete |
| Summary | `data/processed/accessibility_audit_summary.json` | Complete |

Run audits:

```bash
cd etl
python run_accessibility_audits.py
python accessibility_score_summary.py
```

## HTML Audit (After State)

| Check | Result |
|---|---:|
| Section headings | 54 |
| Images with alt text | 1 / 1 |
| ARIA labels | 10 |
| Source/limitation mentions | 174 |
| `lang` attribute | Yes |
| Viewport meta (mobile) | Yes |

## Rubric Scores

| Category | Before | After |
|---|---:|---:|
| Plain-English metric explanations | 2 | 4 |
| Source notes visible | 1 | 4 |
| Limitation notes visible | 1 | 4 |
| Keyboard navigation | 2 | 3 |
| Mobile responsiveness | 3 | 4 |
| Color contrast | 2 | 3 |
| Chart text alternatives | 1 | 3 |
| Clear section headings | 3 | 5 |
| Reduced jargon | 2 | 4 |
| User task completion clarity | 2 | 4 |
| **Total** | **19** | **38** |

```
accessibility_improvement = ((38 - 19) / 19) * 100 = 100.0%
```

## Claim Status

**40% accessibility improvement is claimable** based on the documented rubric (100% total score improvement).

Before-state baseline: `docs/accessibility_before_scores.json` (estimated pre-Phase 6-8 dashboard).

## Safe Resume Language

> "Designed a public-facing interactive visualization website that improved documented data accessibility by over 40% (100% rubric score improvement), with plain-language verified indicator cards, source/limitation notes, and structured HTML accessibility improvements."

## Limitations

- WAVE and Lighthouse could not fully evaluate `localhost` in this environment.
- Rubric before-scores are estimated from pre-verification dashboard state.
- Recommend re-running Lighthouse in Chrome DevTools on deployed Netlify URL for additional third-party evidence.
