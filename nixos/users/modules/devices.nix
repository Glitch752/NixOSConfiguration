{ inputs, outputs, lib, config, pkgs, ... }: {
  services.udev.packages = [ 
    pkgs.platformio-core
    pkgs.openocd
  ];
}