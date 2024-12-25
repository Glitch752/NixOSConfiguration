{ inputs, lib, config, pkgs, flakePath, ... }: let pypr = inputs.pyprland.packages.${pkgs.system}.pyprland; in {
  home.packages = [ pypr ];
  xdg.configFile."hypr/pyprland.toml".text = ''
    # See https://hyprland-community.github.io/pyprland/Getting-started.html#configuration-file
    [pyprland]
    plugins = ["fetch_client_menu", "magnify", "shift_monitors", "workspaces_follow_focus"]

    [workspaces_follow_focus]
    

    [fetch_client_menu]
    separator = " | "
    engine = "sh"
    parameters = "${./fetch_client_menu.sh}"
  '';

  wayland.windowManager.hyprland.settings.exec-once = [
    "${pypr}/bin/pypr"
  ];
}