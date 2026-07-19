# Deploying the Hydron website

1. Push this repository to GitHub with `main` as the default branch.
2. Open **Settings → Pages** in the GitHub repository.
3. Set **Source** to **GitHub Actions**.
4. Run **Deploy Hydron website** from the Actions tab, or push a website change to `main`.
5. Create a GitHub Release and attach `Hydron-Setup-0.6.0-alpha-win-x64.exe` with that exact filename.

On GitHub Pages, download buttons automatically resolve to the latest GitHub Release asset. Local previews resolve to the installer under `dist/installer`.

The deployment workflow explicitly publishes only the public website files. The preserved original in `website/original` and this deployment guide are not included in the public Pages artifact.
