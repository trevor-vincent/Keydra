# Keydra

Inspired by emacs-hydra, Keydra addresses the challenge of remembering numerous linux shell functions by allowing users to create menus of keybinds, referred to as "keydras." This approach makes it possible to manage more commands than traditional keybind systems would feasibly allow.

## Features

- **Infinite Keybindings**: Organize and trigger an unlimited number of commands via custom keybindings.
- **Descriptive Command Names and Help Text**: Enhance command recall with helpful descriptions right in the interface.
- **Keybinds are set through human-readable text files**: Easily configure keybinds and command menus using simple text files.
- **Dynamic Window Attributes**: Customize the window title and colors dynamically via the command line for each session.
- **Quick Config Editing**: Click on the title to open your config file in your preferred text editor.

## Installation

Keydra requires Node.js and npm to run. Follow these steps to install:

```bash
# Clone the repository
git clone https://github.com/MindKingAI/keydra.git

# Navigate to the directory
cd keydra

# Install dependencies
npm install

# Run the application with a config file
npm start -- --config=path/to/your/config.ini
```

You can also create a global link to run Keydra from anywhere:

```bash
# Create a global link
npm link

# Now you can run Keydra from anywhere
keydra --config=path/to/your/config.ini
```

## Config File Format

Create a configuration file (.ini) with the following format:

```
# height: 600
# width: 400
Command Name, Keybind, shell_command_to_execute
```

For example:
```
Open Google Chrome, Ctrl+O, google-chrome-stable
Open Emacs, F2, emacsclient -c -a emacs
```

## Usage

Run Keydra with your configuration file:

```bash
keydra --config=your_config.ini --title="Your Title"
```

Command line options:
- `--config` or `-c`: Path to your configuration file (required)
- `--title` or `-t`: Window title (default: "Keydra")
- `--width` or `-wi`: Window width (default: 600)
- `--height` or `-he`: Window height (default: 800)
- `--text-editor` or `-e`: Text editor to open the config file (default: "nano")

## Examples

Let's say you want to autoconnect to some bluetooth devices, but you don't want to type the bluetoothctl commands in a shell with the MAC address.

Write this bluetooth.ini:

```
BlueTooth Pair With Echo, F1, source ~/.bashrc; bluetooth_pair_with_echo_device
BlueTooth Pair With Buds, F2, source ~/.bashrc; bluetooth_pair_with_buds
```

This binds F1 and F2 to the functions in your .bashrc that pair with your buds and echo, they wrap the bluetoothctl command so that you don't have to remember it. The Keydra would be ran as follows:

```bash
keydra --config bluetooth.ini --title "Bluetooth Devices"
```

This launches the menu. Now pressing F1 or F2 will pair the bluetooth device and close the menu.

## Using with the i3 window manager

If you are using the i3 window manager, you can add keybindings in your i3 config to launch different Keydra menus:

```
# Launch bluetooth keydra
bindsym $mod+b exec keydra --config ~/.config/keydra/bluetooth.ini --title "Bluetooth"

# Launch applications keydra
bindsym $mod+a exec keydra --config ~/.config/keydra/apps.ini --title "Applications"
```

## Customizing Through Config Comments

You can customize window dimensions by adding commented lines at the top of your config file:

```
# height: 400
# width: 300
Command1, F1, command1_to_run
Command2, F2, command2_to_run
```

## Using with the i3 window manager
If you are using the i3 window manager, in the i3 config please add the lines

for_window [class="keydra"] floating enable
to make sure the window floats.
