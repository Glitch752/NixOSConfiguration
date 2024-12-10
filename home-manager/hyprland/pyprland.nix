{ inputs, lib, config, pkgs, flakePath, ... }: {
  home.packages = with pkgs; [
    inputs.pyprland.packages.${pkgs.system}.pyprland
  ];
}