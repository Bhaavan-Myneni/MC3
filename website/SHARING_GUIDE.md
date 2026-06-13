# How to Share Your MC3 Summit 2025 Website

This guide provides several methods to share your website with others, from quick temporary sharing to permanent hosting.

## 🚀 Option 1: Vercel (Recommended - Free & Professional)

**Best for**: Permanent hosting with a custom domain option

### Quick Deployment Steps:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy from your project folder**:
   ```bash
   cd target-repo
   vercel
   ```

3. **Follow the prompts**:
   - Login to Vercel (or create account)
   - Confirm project settings
   - Deploy!

4. **Share the URL**: Vercel will give you a URL like `https://your-project.vercel.app`

### Alternative: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - Framework: **Other**
   - Root Directory: `target-repo` (or leave blank if deploying from repo root)
   - Build Command: Leave empty
   - Output Directory: Leave empty
6. Click "Deploy"

**Pros**: Free, fast, automatic HTTPS, custom domains available
**Cons**: None for basic use

---

## 📦 Option 2: GitHub Pages (Free)

**Best for**: Free hosting with GitHub integration

### Steps:

1. **Create a GitHub repository** (if you haven't already)

2. **Push your code to GitHub**:
   ```bash
   cd target-repo
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **main branch** (or your default branch)
   - Click **Save**

4. **Access your site**: 
   - URL will be: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`
   - Note: If your site is in a subfolder (like `target-repo`), you may need to adjust the root directory in Pages settings

**Pros**: Free, integrated with GitHub
**Cons**: Must be public repository (or need GitHub Pro for private)

---

## 🌐 Option 3: Netlify (Free & Easy)

**Best for**: Drag-and-drop deployment

### Steps:

1. **Go to [netlify.com](https://netlify.com)** and sign up (free)

2. **Deploy**:
   - Drag and drop your `target-repo` folder onto Netlify
   - OR connect to GitHub for automatic deployments
   
3. **Share the URL**: Netlify provides a URL like `https://random-name.netlify.app`

**Pros**: Very easy, free, automatic HTTPS
**Cons**: Free tier has some limitations

---

## 🔗 Option 4: Quick Temporary Sharing (ngrok)

**Best for**: Quick testing with others (temporary access)

### Steps:

1. **Install ngrok**:
   - Download from [ngrok.com](https://ngrok.com/download)
   - Or use: `choco install ngrok` (if you have Chocolatey)

2. **Start your local server**:
   ```bash
   cd target-repo
   python -m http.server 8000
   ```

3. **Start ngrok in a new terminal**:
   ```bash
   ngrok http 8000
   ```

4. **Share the ngrok URL**: ngrok will give you a public URL like `https://abc123.ngrok.io`

**Pros**: Instant sharing, good for testing
**Cons**: URL changes each time (unless paid), temporary

---

## 🏠 Option 5: Local Network Sharing

**Best for**: Sharing on the same Wi-Fi network

### Steps:

1. **Find your local IP address**:
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., `192.168.1.100`)

2. **Start the server** (allowing external connections):
   ```bash
   cd target-repo
   python -m http.server 8000 --bind 0.0.0.0
   ```

3. **Share the URL**: `http://YOUR-IP-ADDRESS:8000`
   - Example: `http://192.168.1.100:8000`

4. **Tell others to access this URL** (they must be on the same network)

**Pros**: No internet needed, instant
**Cons**: Only works on same network, requires firewall configuration

---

## 📝 Quick Comparison

| Method | Setup Time | Cost | Duration | Best For |
|--------|-----------|------|----------|----------|
| **Vercel** | 5 min | Free | Permanent | Production sites |
| **GitHub Pages** | 10 min | Free | Permanent | Open source projects |
| **Netlify** | 2 min | Free | Permanent | Quick deployments |
| **ngrok** | 2 min | Free* | Temporary | Testing |
| **Local Network** | 1 min | Free | While running | Same-network sharing |

*ngrok has a free tier with limitations

---

## 🎯 Recommended Approach

**For sharing with others**: Use **Vercel** or **Netlify** - they're free, easy, and provide permanent URLs.

**Quick command to deploy with Vercel**:
```bash
cd target-repo
vercel --prod
```

---

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify all file paths are correct
3. Make sure all files are included in deployment
4. Check the deployment logs on your hosting platform

---

**Your website is ready to share!** 🎉




