{ inputs, lib, config, pkgs, ... }: {
  # https://nixos.wiki/wiki/Visual_Studio_Code
  programs.vscode = {
    package = pkgs.vscode.fhsWithPackages (ps: with ps; [
      # For rust
      rustup
      zlib
      clang
      gcc
      openssl.dev
      pkg-config
      
      libGL
      libxkbcommon
      wayland
    ]);

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

  # Override the vscode desktop entry to not include %F because it breaks when using FHS code
  xdg.desktopEntries.code = {
    categories = [ "Utility" "TextEditor" "Development" "IDE" ];
    comment = "Code Editing. Redefined.";
    exec = "code --enable-features=UseOzonePlatform,WaylandWindowDecorations --ozone-platform-hint=auto";
    genericName = "Text Editor";
    icon = "vscode";
    name = "Visual Studio Code";
    startupNotify = true;
    settings = {
      Keywords = "vscode";
      StartupWMClass = "Code";
      Version = "1.4";
    };
    type = "Application";

    actions = {
      "new-empty-window" = {
        name = "New Empty Window";
        exec = "code --new-window --enable-features=UseOzonePlatform,WaylandWindowDecorations --ozone-platform-hint=auto";
        icon = "vscode";
      };
    };
  };
}