# Sithumsa Enterprise — GitHub Pages Static Demo (No Database Required)

This is a **standalone, database-free static demo** copy of Sithumsa Enterprise designed for free hosting on **GitHub Pages**. All showroom inventory, POS invoices, leasing quotes, trade-in requests, customer reviews, expenses, and audit logs persist locally inside your browser (`localStorage`), with client-side PDF, CSV, and ZIP backup downloads.

> **Note:** Your live full-stack Node.js + SQLite application in `sithumsa` is completely separate and untouched.

## What Works in This Static Demo
- Luxury showroom storefront (**PT Serif** + **Urbanist** typography, logo, hero, instant finder, search/filters, wishlist shortlist, side-by-side compare)
- Leasing Studio calculator + WhatsApp quote + **Download Quote PDF**
- Vehicle Specification modal + **Spec Sheet PDF**
- VIP Test Drive booking modal & Trade-In / Exchange form (with image upload stored in browser)
- Full **Owner & POS Demo** (`#/admin`) with 1-click demo entry: Inventory CRUD, POS Billing & Printable/Downloadable PDF Invoices, Installment Ledger, Profit Reports & CSV Export, Leads CRM, 2FA QR Setup preview, Audit Trail, and **Reset Demo Data** button

---

## Push & Host on GitHub Pages (Copy & Paste)

1. **Create a new empty repository on GitHub** (e.g., `sithumsa-demo`).
2. **Initialize and push this folder to `main`**:
   ```bash
   cd /home/sithum404/Desktop/sithumsa-gh-pages
   git init -b main
   git add .
   git commit -m "Deploy Sithumsa Enterprise static demo"
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO>.git
   git push -u origin main
   ```
3. **Enable GitHub Pages**:
   - Open your GitHub repository -> **Settings** -> **Pages**
   - Under **Build and deployment** -> **Source**, select **GitHub Actions**
   - Wait ~1 minute for the **Deploy Sithumsa Demo to GitHub Pages** workflow to finish, then open your live URL: `https://<YOUR-USERNAME>.github.io/<YOUR-REPO>/`
