{ inputs, lib, config, pkgs, ... }: {
  # https://nixos.wiki/wiki/Visual_Studio_Code
  programs.vscode = {
    package = pkgs.vscode.fhsWithPackages (ps: with ps; [
      # For rust
      rustup
      zlib
      openssl.dev
      pkg-config
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
}