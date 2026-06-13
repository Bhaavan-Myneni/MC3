#!/usr/bin/env python3
"""
QR Code Generator for MC3 Summit 2025 Website
Generates a QR code image that links to your deployed website
"""

import qrcode
from qrcode.image.styledmod import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colorfills import SolidFillColorMask
import sys
import os

def generate_qr_code(url, output_file='mc3-summit-2025-qrcode.png', size=10, border=4):
    """
    Generate a QR code for the given URL
    
    Args:
        url: The website URL to encode
        output_file: Name of the output image file
        size: Size of each module (box) in the QR code
        border: Border size (thickness) around the QR code
    """
    # Validate URL
    if not url.startswith(('http://', 'https://')):
        print("❌ Error: URL must start with http:// or https://")
        return False
    
    try:
        # Create QR code instance
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=size,
            border=border,
        )
        
        # Add data
        qr.add_data(url)
        qr.make(fit=True)
        
        # Create image with custom styling (Monroe County colors)
        img = qr.make_image(
            fill_color="#003366",  # Monroe County Navy
            back_color="#FFFFFF"   # White background
        )
        
        # Save image
        img.save(output_file)
        print(f"✅ QR code generated successfully!")
        print(f"📁 File saved as: {output_file}")
        print(f"🌐 URL encoded: {url}")
        print(f"\n💡 Tip: Print or share this QR code image.")
        print(f"   When scanned, it will open: {url}")
        return True
        
    except Exception as e:
        print(f"❌ Error generating QR code: {e}")
        return False

def main():
    print("=" * 60)
    print("📱 MC3 Summit 2025 - QR Code Generator")
    print("=" * 60)
    print()
    
    # Get URL from user
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = input("Enter your website URL: ").strip()
    
    if not url:
        print("❌ Error: URL is required")
        print("\nUsage:")
        print("  python generate_qr_code.py https://your-website.netlify.app")
        print("\nOr run without arguments to enter URL interactively")
        return
    
    # Generate QR code
    output_file = 'mc3-summit-2025-qrcode.png'
    success = generate_qr_code(url, output_file)
    
    if success:
        # Get absolute path
        abs_path = os.path.abspath(output_file)
        print(f"\n📂 Full path: {abs_path}")
        print(f"\n🎉 Ready to share! Open the image file to see your QR code.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        print("\n💡 Make sure you have the 'qrcode' library installed:")
        print("   pip install qrcode[pil]")



