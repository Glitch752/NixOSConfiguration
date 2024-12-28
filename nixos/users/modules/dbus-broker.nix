{ inputs, outputs, lib, config, pkgs, ... }: {
  environment.systemPackages = with pkgs; [
    dbus-broker # Alternative message broker implementation
  ];
  systemd.packages = [ pkgs.dbus-broker ];
}