{ inputs, lib, config, pkgs, ... }: {
  home.packages = with pkgs; [
    osu-lazer-bin
  ];
}