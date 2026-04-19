# AXIOM Studio v2.0 - Technical Team Handover

This document outlines the deployment strategy for the AXIOM Studio node.

## 📦 Deployment Options

### 1. The Fastest Method: Docker (Recommended for Team)
If your team has Docker installed, they can launch the entire stack in one command. This ensures the environment is identical for everyone.

```bash
# Navigate to the project folder
cd AXIOM_Studio_Complete

# Build and start the container
docker-compose up --build -d
```
The app will be live at `http://localhost:8080`.

### 2. GitHub Deployment (Vercel/Netlify for Frontend Only)
Since this app has a Python backend, typical static hosting like Vercel/Netlify won't work for the full app without conversion to Serverless Functions. 
**Recommended Strategy:**
*   **Frontend:** Host the `dist` folder on Vercel/Netlify.
*   **Backend:** Host `main.py` on **Render**, **Railway**, or **DigitalOcean App Platform**.
*   **Easier:** Use a **VPS (DigitalOcean/Linode)** and run the Docker container.

### 3. Desktop Wrapper (Advanced)
To turn this into a standard `.exe`:
*   Use **PyInstaller** for the backend: `pip install pyinstaller && pyinstaller --onefile main.py`
*   Use **Electron** to wrap the frontend and bundle the backend inside it.

---

## 🛠 Project Structure for GitHub
When you upload to GitHub, ensure the following are present:
*   `Dockerfile` & `docker-compose.yml` (Added)
*   `.env.example` (Generic template for keys)
*   `requirements.txt` (Python deps)
*   `dist/` (Built frontend assets)
*   `main.py` (The entry point)

> [!IMPORTANT]
> **Security:** Never commit your real `.env` file to a public GitHub repository. Use `.env.example` and add environmental variables in your hosting provider's dashboard.
