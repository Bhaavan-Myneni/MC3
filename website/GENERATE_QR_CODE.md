# 📱 Generate QR Code for Your Website

This guide shows you how to create a QR code that people can scan to access your MC3 Summit 2025 website.

## ⚠️ Important: Deploy Your Website First!

**Before generating a QR code, you must deploy your website online** to get a public URL. 
QR codes for local URLs (like `localhost:8000`) won't work for others.

### Deploy Your Website:
1. **Quickest option**: Use [Netlify Drop](https://app.netlify.com/drop) - drag and drop your `target-repo` folder
2. **Free & permanent**: Use [GitHub Pages](https://pages.github.com)
3. **Professional**: Use [Vercel](https://vercel.com)

Once deployed, you'll get a URL like:
- `https://your-site.netlify.app`
- `https://yourusername.github.io/mc3-summit-2025/`
- `https://your-site.vercel.app`

---

## 🚀 Method 1: Using the Web Interface (Easiest)

### Steps:
1. **Deploy your website** and get your public URL
2. **Open** `generate-qr.html` in your web browser
3. **Paste your website URL** in the input field
4. **Click "Generate QR Code"**
5. **Download the QR code** image
6. **Share or print** the QR code!

### Features:
- ✅ Visual interface
- ✅ Instant generation
- ✅ Download as PNG
- ✅ Works in any browser

---

## 🐍 Method 2: Using Python Script

### Step 1: Install Required Library
```bash
pip install qrcode[pil]
```

Or install from requirements file:
```bash
pip install -r requirements-qr.txt
```

### Step 2: Generate QR Code

**Option A: Run with URL as argument**
```bash
python generate_qr_code.py https://your-website.netlify.app
```

**Option B: Run interactively**
```bash
python generate_qr_code.py
```
Then enter your URL when prompted.

### Step 3: Find Your QR Code
The QR code will be saved as `mc3-summit-2025-qrcode.png` in the same folder.

---

## 📋 Usage Examples

### Example 1: Netlify Deployment
```bash
python generate_qr_code.py https://mc3-summit-2025.netlify.app
```

### Example 2: GitHub Pages
```bash
python generate_qr_code.py https://yourusername.github.io/mc3-summit-2025/
```

### Example 3: Vercel Deployment
```bash
python generate_qr_code.py https://mc3-summit-2025.vercel.app
```

---

## 🎨 Customizing the QR Code

### Using Python Script:
Edit `generate_qr_code.py` to change:
- **Size**: Change the `size` parameter (default: 10)
- **Colors**: Modify `fill_color` and `back_color`
- **Border**: Adjust the `border` parameter (default: 4)

### Using Web Interface:
The web interface uses Monroe County colors:
- **Primary Color**: #003366 (Navy Blue)
- **Background**: #FFFFFF (White)

---

## 📱 How to Share Your QR Code

1. **Print it**: Print the QR code on flyers, posters, or business cards
2. **Digital sharing**: Email the QR code image or share on social media
3. **Presentation**: Include it in PowerPoint slides or PDFs
4. **Website**: Add the QR code image to your website
5. **Email signature**: Add it to your email signature

---

## ✅ Testing Your QR Code

1. **Generate the QR code** with your deployed URL
2. **Open the QR code image** on your phone
3. **Use your phone's camera** or a QR code scanner app
4. **Scan the QR code** from your computer screen
5. **Verify it opens** your website correctly

---

## 🐛 Troubleshooting

### QR Code Doesn't Work
- ✅ Make sure your website is deployed online (not localhost)
- ✅ Verify the URL is correct and starts with `https://` or `http://`
- ✅ Check that your website is accessible in a browser
- ✅ Ensure the QR code image is clear and not distorted

### Python Script Errors
- ✅ Install required library: `pip install qrcode[pil]`
- ✅ Make sure Python 3.6+ is installed
- ✅ Check that the URL is valid

### Web Interface Doesn't Work
- ✅ Make sure you have an internet connection (needs CDN for QR library)
- ✅ Try a different browser
- ✅ Check browser console for errors (F12)

---

## 🎯 Best Practices

1. **Use HTTPS URLs**: More secure and trusted by QR scanners
2. **Test before sharing**: Always test the QR code yourself first
3. **High resolution**: Use a high-quality image for printing
4. **Clear background**: Ensure good contrast for easy scanning
5. **Sufficient size**: Make sure the QR code is large enough to scan (at least 2x2 cm)

---

## 📞 Need Help?

If you have issues:
1. Check that your website is deployed and accessible
2. Verify the URL is correct
3. Test the QR code with multiple devices
4. Ensure the QR code image is clear and not pixelated

---

## 🎉 Ready to Share!

Once you have your QR code:
1. ✅ Your website is deployed online
2. ✅ QR code is generated
3. ✅ QR code is tested and working
4. ✅ Ready to share with others!

**Share your QR code and let people easily access your MC3 Summit 2025 website!** 📱🌐



