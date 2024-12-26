{ inputs, lib, config, pkgs, ... }: {
  # https://nixos.wiki/wiki/Visual_Studio_Code
  programs.vscode = {
    package =
      (pkgs.vscode.override
        {
          # https://wiki.archlinux.org/title/Wayland#Electron
          commandLineArgs = [
            "--ozone-platform-hint=auto"
            "--enable-features=UseOzonePlatform"
            "--ozone-platform=wayland"
            # make it use GTK_IM_MODULE if it runs with Gtk4, so fcitx5 can work with it.
            # (only supported by chromium/chrome at this time, not electron)
            "--gtk-version=4"
            # make it use text-input-v1, which works for kwin 5.27 and weston
            "--enable-wayland-ime"
          ];
        });

    enable = true;

    # keybinds.json
    keybindings = [
      {
        key = "shift shift";
        command = "workbench.action.showCommands";
      }
      {
        key = "ctrl+tab";
        command = "workbench.action.nextEditorInGroup";
      }
      {
        key = "ctrl+shift+tab";
        command = "workbench.action.previousEditorInGroup";
      }
      {
        key = "ctrl+t";
        command = "workbench.action.files.newUntitledFile";
      }
    ];
  };
}