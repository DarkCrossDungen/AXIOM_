import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "AXIOM Studio Complete",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Check if we're in dev mode or prod mode
  // In prod, load the local dist/index.html
  // But wait, the user's HTML requires a server? NO, Vite dist can run on file:// if base is relative.
  // Wait, Vite defaults to absolute paths `/assets/...`. We MUST set base to `./` for file:// to work!
  
  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  
  // Optional: open dev tools
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
