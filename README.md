# Colin's Graphics Portfolio

Live site: https://cjprice2.github.io/graphics-portfolio/

This repository contains a collection of interactive computer graphics exercises and projects created for CS559 – Computer Graphics at UW-Madison. Everything runs directly in the browser using standard web technologies (HTML, CSS and JavaScript).

## Contents

| Folder | Description |
|--------|-------------|
| `index.html` | Landing page with cards linking to every workbook and project. |
| `WB2` – `WB10` | Individual workbooks demonstrating 2D Canvas work, Bézier curves, 3D scenes, WebGL shaders and more. |
| `P1` | Spline-based train simulation where the track can be edited in real time. |
| `P2` | Full 3D recreation of Luigi Circuit from Mario Kart Wii with drivable karts and custom shaders. |
| `styles.css` | Shared styling across the portfolio. |
| `favicon.ico` | Site icon. |

## Running Locally

First, obtain the files (clone or download):

```bash
git clone https://github.com/your-username/graphics-portfolio.git
cd graphics-portfolio
```

After cloning, choose **one** of the options below:

1. **Open directly (no server needed)**

   ```bash
   open index.html
   ```

2. **Run a simple local server**

   ```bash
   python -m http.server 8080  # then browse to http://localhost:8080
   ```

3. **Use VS Code Live Server**

   1. Install the "Live Server" extension.
   2. Right-click `index.html` → "Open with Live Server".

## Browser Support

Desktop versions of Chrome, Firefox, Edge and Safari are recommended. Mobile browsers may not fully support all interactions or WebGL content.

## License

All original code is released under the MIT License. Third-party models, textures and characters remain property of their respective owners and are used here for educational purposes only. 