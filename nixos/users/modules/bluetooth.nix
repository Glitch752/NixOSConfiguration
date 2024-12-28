{ inputs, outputs, lib, config, pkgs, ... }: {
  hardware.bluetooth.enable = true; # Enables support for Bluetooth
  hardware.bluetooth.powerOnBoot = true;

  environment.systemPackages = with pkgs; [
    bluez # Bluetooth
  ];
}