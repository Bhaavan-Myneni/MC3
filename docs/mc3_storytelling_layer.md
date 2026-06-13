# MC3 Data Storytelling Layer

**Phase:** 6.6 — public-sector storytelling around verified indicators.

---

## 1. Why the Dashboard Needed More Story

Phase 6.5 added verified indicator cards and mini charts, but charts alone do not explain why the data matters for Monroe County children and families. Community partners, summit attendees, and portfolio reviewers need context that connects numbers to the MC3 mission without overstating what the data can prove.

---

## 2. How “What Surrounds Us, Shapes Us” Was Added

A new homepage section (`#mc3-story-intro`) introduces the MC3 theme before the verified indicators:

> *What surrounds us, shapes us.*

The text explains that childhood conditions are shaped by relationships, neighborhoods, learning and play environments, and the policies and practices of institutions that interact with families. Verified indicators are framed as one way to translate that idea into data — not the whole story.

An **MC3 2025 Focus** callout highlights the 10th Annual MC3 as a moment to look back, celebrate progress, and plan for the next decade.

---

## 3. How CDC Essentials for Childhood Was Connected

Section `#mc3-cdc-framework` connects the dashboard to the CDC’s Essentials for Childhood framework:

- Safe, stable, and nurturing relationships and environments
- Thriving children growing into thriving adults

Four concept cards map the framework to everyday community conditions:

| Card | Focus |
|------|-------|
| Relationships | Family, peer, school, and community support |
| Neighborhoods | Housing, transportation, safety, nearby resources |
| Learning and Play | Schools, childcare, parks, youth spaces |
| Policies and Practices | Institutions, service systems, funding decisions |

The section explicitly states the goal is not to reduce children’s lives to numbers.

---

## 4. How Each Verified Indicator Supports the Story

Each verified indicator card now includes:

- ETL-verified metric and year (from JSON)
- Trend label (computed or noted)
- Story connection (plain English)
- Why it matters
- ETL source note
- Limitation / caution note

| Indicator | Story role |
|-----------|------------|
| Child poverty | Economic pressure surrounding families; verified improvement noted without claiming cause |
| Graduation rate | Learning environment context; source ends 2017 |
| Unemployment | Broader labor-market context around families |
| Child population | Scale of need for planning |
| SNAP participants | Food assistance demand and household economic pressure |

Story text is defined in `website/js/verified-indicators.js`. Metric values come from `website/data/verified/` only.

---

## 5. How the 2026 Pause Was Framed Respectfully

Section `#mc3-looking-ahead` acknowledges:

- MC3 will not be budgeted and planned for 2026
- County budget reductions and YSB’s need to focus on staff retention and emergency shelter operations
- This does **not** necessarily mean the end of MC3
- Momentum can continue through partnerships, resource alignment, and new formats

The dashboard is positioned as a tool to keep verified data accessible during that transition.

---

## 6. How the Dashboard Avoids Unsupported Causal Claims

Language guidelines used throughout:

**Use:** could support, may help, can inform, supports conversation, helps describe

**Avoid:** proves, caused, guarantees, drove policy impact

Each indicator includes an explicit **Limitation** note. The poverty card states the trend does not explain what caused the decline. Graduation warns against newer unverified claims. Unemployment is labeled as county-level context, not direct child well-being. SNAP is noted as program use, not full food insecurity.

No PDF-specific values were added. No “Data Walk vs ETL” comparison section was created.

---

## 7. How This Helps Stakeholders and Interviewers

- **Community partners** can use the dashboard to start cross-sector conversations with shared, verified numbers.
- **Summit attendees** see how MC3’s decade-long theme connects to local data.
- **Portfolio reviewers** can see data engineering plus public-sector communication skills in one project.
- **Interviewers** can ask about validation discipline, storytelling restraint, and translating ETL output for non-technical audiences.

---

## Homepage Section Map

| Section ID | Title |
|------------|-------|
| `#mc3-story-intro` | What Surrounds Us, Shapes Us |
| `#mc3-cdc-framework` | Safe, Stable, and Nurturing Relationships and Environments |
| `#verified-etl-hub` | Verified Community Indicators (expanded cards) |
| `#reading-indicators-together` | Reading the Indicators Together |
| `#verified-poverty-section` | Verified Child Poverty — Detailed Trend (preserved) |
| `#mc3-policy-use` | How Community Partners Could Use This Dashboard |
| `#mc3-looking-ahead` | Looking Ahead: Continuing the Momentum |

---

## Story Flow Cleanup

Phase 6.6.1 reduced duplicate storytelling on the homepage:

- **Removed:** the standalone **Verified Indicator Stories** section, which repeated per-indicator explanations already present in the expanded verified cards.
- **Preserved in cards:** metric value, year, trend label, story connection, why it matters, source note, and limitation note — all populated from ETL JSON plus explanatory text in `verified-indicators.js`.
- **Cross-indicator meaning** lives in **Reading the Indicators Together**, preceded by a short transition explaining that indicators are strongest when read together.
- **Policy-use framing** lives in **How Community Partners Could Use This Dashboard**.
- **Future planning context** lives in **Looking Ahead: Continuing the Momentum**.

One unique sentence from the old stories — about ETL validation flagging gaps when dashboard claims diverge — was merged into the Reading section body. Unverified figure warnings (95% graduation, 3.9% unemployment) remain in card limitation notes and the validation warning box.

### Final homepage story flow

1. Hero / existing MC3 intro
2. What Surrounds Us, Shapes Us
3. Safe, Stable, and Nurturing Relationships and Environments
4. Verified Community Indicators (cards + mini charts)
5. Reading the Indicators Together
6. Verified Child Poverty — Detailed Trend
7. How Community Partners Could Use This Dashboard
8. Looking Ahead: Continuing the Momentum
9. Footer / data source sections

---

## Files Changed

| File | Change |
|------|--------|
| `website/index.html` | Story, CDC, reading-together, looking-ahead, policy sections |
| `website/js/verified-indicators.js` | Story fields per indicator |
| `website/css/style.css` | Storytelling layout and card styles |
| `docs/mc3_storytelling_layer.md` | This document |

`website/data/processed/` was not modified. Verified values remain in `website/data/verified/`.
