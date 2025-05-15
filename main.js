const {
  app,
  BrowserWindow,
  shell,
  globalShortcut,
  ipcMain,
} = require("electron");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
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

function openConfigInEditor(configPath, editor) {
  try {
    const command = `${editor} "${configPath}"`;
    console.log(`Executing: ${command}`);
    const child = spawn(command, {
      shell: true,
      detached: true,
      stdio: "inherit",
    });
    child.unref();
    app.quit();
  } catch (error) {
    console.error(`Failed to open editor: ${error}`);
  }
}

function registerGlobalShortcuts(commands) {
  commands.forEach((cmd) => {
    globalShortcut.register(cmd.keybind, () => {
      executeCommand(cmd.command);
    });
  });
}

function parseConfigFile(fileContent) {
  const lines = fileContent.split("\n");
  const config = {
    height: null,
    width: null,
    commands: [],
  };

  lines.forEach((line) => {
    line = line.trim();
    if (!line) return;

    // Parse height and width from comments
    if (line.startsWith("#")) {
      const heightMatch = line.match(/^#\s*height:\s*(\d+)/i);
      const widthMatch = line.match(/^#\s*width:\s*(\d+)/i);

      if (heightMatch) {
        config.height = parseInt(heightMatch[1]);
      } else if (widthMatch) {
        config.width = parseInt(widthMatch[1]);
      }
      return;
    }

    // Parse commands
    if (!line.startsWith("#")) {
      const parts = line.split(",").map((part) => part.trim());
      if (parts.length === 3) {
        config.commands.push({
          name: parts[0],
          keybind: parts[1],
          command: parts[2],
        });
      }
    }
  });

  return config;
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
    .option("text-editor", {
      alias: "e",
      description: "Text editor to open the config file (default: nano)",
      type: "string",
      default: "nano",
    })
    .help()
    .alias("help", "h").argv;

  const fullPath = argv.config;
  let fileContent;
  try {
    fileContent = fs.readFileSync(fullPath, "utf8");
  } catch (err) {
    console.error(`Failed to read configuration file at ${fullPath}`, err);
    app.quit();
    return;
  }

  const config = parseConfigFile(fileContent);

  // Config file values overwrite CLI args, fall back to CLI args or defaults if not in config
  const windowWidth = config.width !== null ? config.width : argv.width || 600;
  const windowHeight =
    config.height !== null ? config.height : argv.height || 800;

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
    win.webContents.send("initialize", {
      commands: config.commands,
      title: argv.title,
      configPath: fullPath,
      textEditor: argv.textEditor,
    });
  });

  win.on("ready-to-show", function () {
    win.show();
    win.focus();
  });

  win.webContents.on("did-finish-load", () => {
    win.webContents.executeJavaScript(`
      document.body.style.appRegion = 'drag';
    `);
  });

  registerGlobalShortcuts(config.commands);

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
ipcMain.on("open-config", (event, data) => {
  console.log("Received open-config request with data:", data);
  if (!data || !data.configPath) {
    console.error("Missing configPath in open-config request");
    return;
  }
  
  const editor = data.textEditor || "nano";
  console.log(`Opening config ${data.configPath} with editor ${editor}`);
  openConfigInEditor(data.configPath, editor);
});
