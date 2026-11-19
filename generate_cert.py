"""
Run this file ONCE to generate SSL certificate.
This makes the website run on HTTPS so camera works.

HOW TO RUN:
  1. pip install pyopenssl
  2. python generate_cert.py
  3. Then run: python app.py
"""

from OpenSSL import crypto
import os

def generate_ssl_cert():
    print("Generating SSL certificate...")

    # Create key
    key = crypto.PKey()
    key.generate_key(crypto.TYPE_RSA, 2048)

    # Create certificate
    cert = crypto.X509()
    cert.get_subject().C  = "IN"
    cert.get_subject().ST = "Tamil Nadu"
    cert.get_subject().L  = "Coimbatore"
    cert.get_subject().O  = "InterviewAI"
    cert.get_subject().CN = "localhost"
    cert.set_serial_number(1000)
    cert.gmtime_adj_notBefore(0)
    cert.gmtime_adj_notAfter(365 * 24 * 60 * 60)  # 1 year
    cert.set_issuer(cert.get_subject())
    cert.set_pubkey(key)
    cert.sign(key, 'sha256')

    # Save files
    with open("cert.pem", "wb") as f:
        f.write(crypto.dump_certificate(crypto.FILETYPE_PEM, cert))

    with open("key.pem", "wb") as f:
        f.write(crypto.dump_privatekey(crypto.FILETYPE_PEM, key))

    print("✅ SSL certificate created: cert.pem and key.pem")
    print("✅ Now run: python app.py")
    print("✅ Open browser at: https://localhost:5000")

if __name__ == "__main__":
    generate_ssl_cert()