const { ipcRenderer, shell } = require("electron");

let configPath = "";
let textEditor = "nano";

ipcRenderer.on("initialize", (event, { commands, title, configPath: cfgPath, textEditor: editor }) => {
  document.getElementById("title-link").textContent = title;
  configPath = cfgPath;
  textEditor = editor || "nano";
  
  // Add click event to title to open config file
  const titleElement = document.getElementById("title");
  const titleLink = document.getElementById("title-link");
  titleElement.style.cursor = "pointer";
  titleElement.title = "Click to edit config file";
  
  // Make title more obviously clickable
  titleElement.style.textDecoration = "underline";
  
  // Add console logging for debugging
  console.log("Setting up title click handler with:", { configPath, textEditor });
  
  titleLink.addEventListener("click", (event) => {
    event.preventDefault();
    console.log("Title clicked! Sending open-config with:", { configPath, textEditor });
    ipcRenderer.send("open-config", { configPath, textEditor });
  });
  
  // Title is already clickable to edit config file
  
  const container = document.getElementById("commandsContainer");
  container.innerHTML = "";

  commands.forEach((cmd) => {
    const div = document.createElement("div");
    div.className = "command-row";

    const commandLink = document.createElement("a");
    commandLink.href = "#";
    commandLink.className = "command-name";
    commandLink.textContent = cmd.name;

    const keybindSpan = document.createElement("span");
    keybindSpan.className = "command-keybind";
    keybindSpan.textContent = cmd.keybind;

    div.appendChild(commandLink);
    div.appendChild(keybindSpan);
    container.appendChild(div);

    commandLink.addEventListener("click", (event) => {
      event.preventDefault();
      // If command name matches the config filename, open it in the editor
      if (cmd.name === configPath.split('/').pop()) {
        ipcRenderer.send("open-config", { configPath, textEditor });
      } else {
        ipcRenderer.send("execute-command", cmd.command);
      }
    });
  });

  // Ensure the window is draggable
  document.body.style.appRegion = "drag";
  document.querySelectorAll("a, input, button").forEach((el) => {
    el.style.appRegion = "no-drag";
  });
});
