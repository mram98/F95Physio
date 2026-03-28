# F95Physio

### A High-Performance, Responsive Physiotherapy Landing Page

**F95Physio** is a modern, SEO-optimized landing page specifically designed for physiotherapy services. This project focuses on high-speed performance, clean typography, and seamless cross-platform compatibility.

---

## 🚀 Key Features & Optimizations

This project implements industry-standard best practices to ensure the site is fast, discoverable, and user-friendly.

### 1. Performance & Pre-fetching
To minimize latency, the site uses advanced resource hints:
* **DNS-Prefetch & Preconnect:** Establishes early connections to critical domains (like Google Fonts). This reduces "handshake" time before assets are even requested.
* **Standardized Encoding:** Uses `UTF-8` to ensure global character support and consistent rendering across all systems.

### 2. Mobile-First & Responsive Design
* **Viewport Control:** Configured to match device width to prevent "zoomed-out" layouts on mobile devices.
* **Browser Integration:** Includes a custom `theme-color` (`#1a73e8`) to brand the mobile browser's address bar to match the site's identity.
* **Progressive Web App (PWA) Ready:** Includes a `manifest.json`, allowing users to save the site to their home screen with a dedicated app icon.

### 3. SEO & Social Sharing (Open Graph)
Metadata is meticulously tuned for maximum visibility:
* **Rich Previews:** Uses **Open Graph (og:)** tags to ensure high-quality headlines, descriptions, and thumbnails appear when shared on LinkedIn, Twitter, or WhatsApp.
* **Canonical Links:** Defines the "official" URL to prevent SEO penalties for duplicate content.
* **Global Reach:** Implements `hreflang` tags to correctly map and serve the website in multiple languages (Arabic, Bengali, Chinese, etc.).
* **Structured Data:** Uses `ld+json` to help search engines categorize the page as a professional service/article.

### 4. Aesthetics & Typography
* **Google Sans & Roboto:** Leverages clean, modern typography for maximum readability and a professional feel.
* **Custom Favicons:** Includes support for standard shortcuts and `apple-touch-icon` for high-resolution iOS icons.

---

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Markup** | HTML5 |
| **Styling** | CSS3 (app.css) |
| **Fonts** | Google Fonts API |
| **Metadata** | Open Graph, JSON-LD |
| **Manifest** | Web App Manifest (JSON) |

---

## 📂 Project Structure

* `index.html` — Core structure, metadata, and SEO configuration.
* `app.css` — Main stylesheet containing layout rules and styling.
* `manifest.json` — Configuration for mobile "Add to Home Screen" functionality.
* `/assets` — Directory for images, logos, and icons.

---

## 🏁 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/F95Physio.git](https://github.com/your-username/F95Physio.git)
    ```
2.  **Open the project:**
    Simply open the `index.html` file in any modern web browser to view the landing page.

---

Would you like me to add a **License section** (like MIT or Apache) to this file?