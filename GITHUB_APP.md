# VibeDev as a website + GitHub App

## Product

VibeDev is a **website** users open in the browser, connected to **GitHub** so they can:

1. Import a project  
2. Fix / clean it  
3. Push + deploy (Pages / Render)  

It is **not** “build from an idea.”

## Register the GitHub App

1. https://github.com/settings/apps/new  
2. Permissions: **Contents** R/W, **Metadata** R, **Pages** R/W  
3. Callback: your hosted site URL  
4. Install on your account (or allow any account)  
5. Copy **Client ID** into the site (see `public/github-app.html`)  

## OAuth App alternative

https://github.com/settings/developers → New OAuth App  
Same Client ID storage on the website.

## Website files

| Path | Role |
|------|------|
| `public/index.html` | Marketing / product site |
| `public/github-app.html` | Setup wizard for App / OAuth |
| `public/app.html` | Fix & Ship application |

## Host

```bash
npx --yes serve public -p 4000
```

Or push `public/` to GitHub Pages / any static host.

## Security

- Never paste tokens into chat  
- Client secrets belong only on a private server  
- Browser may store Client ID + user token in `localStorage` for demo flows only  
