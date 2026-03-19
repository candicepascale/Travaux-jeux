const { app, BrowserWindow } = require("electron");
const path = require("path");

app.commandLine.appendSwitch("no-sandbox");

function creerFenetre() {
  const fenetre = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 650,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });


  fenetre.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  creerFenetre();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      creerFenetre();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
