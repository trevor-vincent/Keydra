const {
  app,
  BrowserWindow,
  shell,
  globalShortcut,
  ipcMain,
} = require("electron");
const { spawn } = require("child_process");
const fs = require("fs");
const yargs = require("yargs");

function executeCommand(command) {
  const child = spawn(command, {
    shell: true,
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  app.quit();
}

function registerGlobalShortcuts(commands) {
  commands.forEach((cmd) => {
    globalShortcut.register(cmd.keybind, () => {
      executeCommand(cmd.command);
    });
  });
}

function createWindow() {
  const argv = yargs(process.argv.slice(2))
    .option("config", {
      alias: "c",
      description: "Path to the config file",
      type: "string",
      demandOption: true,
    })
    .option("title", {
      alias: "t",
      description: "Window title and header",
      type: "string",
      default: "Keydra",
    })
    .option("width", {
      alias: "wi",
      description: "Window width",
      type: "number",
      default: 600,
    })
    .option("height", {
      alias: "he",
      description: "Window height",
      type: "number",
      default: 800,
    })
    .help()
    .alias("help", "h").argv;

  const fullPath = argv.config;
  let data;
  try {
    data = fs.readFileSync(fullPath, "utf8");
  } catch (err) {
    console.error(`Failed to read configuration file at ${fullPath}`, err);
    app.quit();
    return;
  }

  const commands = data
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const parts = line.split(",").map((part) => part.trim());
      return {
        name: parts[0],
        keybind: parts[1],
        command: parts[2],
      };
    });

  const windowWidth = argv.width || 600;
  const windowHeight = argv.height || 800;

  const win = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");

  win.webContents.on("new-window", (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (url !== win.webContents.getURL()) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  win.webContents.once("did-finish-load", () => {
    win.webContents.send("initialize", { commands, title: argv.title });
  });

  win.on("ready-to-show", function () {
    win.show();
    win.focus();
  });

  // Add this to enable dragging the window
  win.webContents.on("did-finish-load", () => {
    win.webContents.executeJavaScript(`
      document.body.style.appRegion = 'drag';
    `);
  });

  registerGlobalShortcuts(commands);

  win.on("closed", () => {
    globalShortcut.unregisterAll();
  });

  const { Menu } = require("electron");
  Menu.setApplicationMenu(null);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => app.quit());

app.on("will-quit", () => globalShortcut.unregisterAll());

ipcMain.on("execute-command", (event, command) => {
  executeCommand(command);
});
