# MC3 Deployment Guide

Deploy the static MC3 dashboard to Netlify or any static host. PostgreSQL is **optional** and not required for the public website.

---

## Prerequisites

- Git repository pushed to GitHub (or GitLab/Bitbucket)
- Verified JSON up to date: `cd etl && python automated_pipeline.py`
- Netlify account (free tier works)

---

## Netlify Deployment (Recommended)

### 1. Prepare the repository

```bash
cd etl
pip install -r requirements.txt
python automated_pipeline.py
```

Confirm `website/data/verified/` contains all eight JSON files.

### 2. Push to GitHub

```bash
git add .
git commit -m "Prepare MC3 dashboard for deployment"
git push origin main
```

### 3. Create Netlify site

1. Log in to [Netlify](https://www.netlify.com/)
2. **Add new site** → **Import an existing project**
3. Connect your Git provider and select the MC3 repository
4. Configure build settings:

| Setting | Value |
|---------|-------|
| **Base directory** | *(leave empty)* |
| **Build command** | *(leave empty)* |
| **Publish directory** | `website` |

5. Click **Deploy site**

### 4. Post-deploy checks

Open your Netlify URL and verify:

- [ ] Homepage loads
- [ ] **Verified Community Indicators** shows all five values (14.0%, 90.77%, 5.8%, 44,236, 7,527)
- [ ] Mini charts render (Chart.js CDN must be reachable)
- [ ] Detailed child poverty chart renders
- [ ] Story sections appear (What Surrounds Us, CDC framework, Looking Ahead)
- [ ] Subpages load: `/pages/demographics.html`, `/pages/education.html`, etc.
- [ ] Verified JSON loads: open DevTools → Network → confirm `data/verified/*.json` return 200

### 5. Custom domain (optional)

Netlify → **Domain settings** → add a custom domain or use the default `*.netlify.app` URL.

---

## Alternative: Manual Deploy

Upload the `website/` folder directly to any static host (S3 + CloudFront, GitHub Pages with publish dir, etc.).

**GitHub Pages note:** If using GitHub Pages from `/docs` or a branch, set the publish root to `website/` or copy `website/` contents to the Pages root.

---

## Local Preview Before Deploy

```bash
cd website
python3 -m http.server 8000
```

If port 8000 is busy:

```bash
python3 -m http.server 8765
```

Open http://localhost:8000

Always run the server from the **`website/`** directory, not the project root.

---

## What Not to Deploy as "Verified"

The original dashboard JSON in `website/data/processed/` is preserved for legacy charts on subpages. The homepage verified sections read from `website/data/verified/` only. Do not merge or overwrite `processed/` with `verified/`.

---

## Optional PostgreSQL (Not Required for Netlify)

Database hosting is separate from the static site. For local or cloud PostgreSQL:

```bash
docker compose up -d
export DATABASE_URL=postgresql://mc3_user:mc3_password@localhost:5432/mc3
psql "$DATABASE_URL" -f database/schema/001_initial_schema.sql
psql "$DATABASE_URL" -f database/views/001_poverty_views.sql
psql "$DATABASE_URL" -f database/schema/002_add_verified_indicators.sql
psql "$DATABASE_URL" -f database/views/002_verified_dashboard_views.sql
cd etl
python automated_pipeline.py
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Verified cards show "Data unavailable" | Run ETL; confirm JSON exists in `website/data/verified/` |
| Charts blank | Check Chart.js CDN blocked; verify browser console |
| Subpage 404 | Confirm publish directory is `website`, not project root |
| Links broken on subpages | Serve from `website/` root; paths are relative |

---

## Reference

Live MC3-style reference site: [mc3-monroecounty2025.netlify.app](https://mc3-monroecounty2025.netlify.app/)
