const { ipcRenderer, shell } = require("electron");

ipcRenderer.on("initialize", (event, { commands, title }) => {
  document.getElementById("title").textContent = title;
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
      ipcRenderer.send("execute-command", cmd.command);
    });
  });

  // Ensure the window is draggable
  document.body.style.appRegion = "drag";
  document.querySelectorAll("a, input, button").forEach((el) => {
    el.style.appRegion = "no-drag";
  });
});
