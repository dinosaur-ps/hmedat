# הזדמנות אחרונה · Hazmanut Aharona

A responsive Hebrew product showcase for **hazmanut-aharona.co.il**.

## Features
- Hebrew interface with right-to-left layout
- Responsive product grid and editorial landing page
- Instant product search and category filters
- Accessible product detail dialogs with keyboard support
- Clear demonstration product and price labels

## Preview locally
Serve this directory using any static web server, for example:

```sh
python3 -m http.server 8080
```

Open http://localhost:8080.

## Update products
Edit the `products` array in `app.js`. Each product has a name, category, price in shekels, Unsplash image ID, short tag, and description. Categories are `home`, `everyday`, and `accessories`.

Edit page text in `index.html` and appearance in `style.css`. Photography loads from Unsplash and the Heebo font from Google Fonts.

The current products and prices are demonstration content. Replace them with verified product information before launching. No checkout, payment handling, or order collection is enabled.

## Publish with GitHub Pages
1. Open this repository's **Settings → Pages**.
2. Choose **Deploy from a branch**.
3. Select **main** and **/ (root)**, then save.
4. Wait for the Pages deployment to finish. GitHub will display the website URL.

## Connect hazmanut-aharona.co.il
After Pages is working, enter `hazmanut-aharona.co.il` under **Settings → Pages → Custom domain**, then follow GitHub's DNS instructions at your domain provider and enable HTTPS when available.

Domain ownership and DNS access are required. The domain has not been connected by this project. Avoid changing DNS until the hosting configuration is ready.
