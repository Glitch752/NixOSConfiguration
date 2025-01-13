{ inputs, lib, config, pkgs, ... }: {
  programs.firefox.enable = true;

  # Install Brave
  programs.chromium = {
    enable = true;
    package = pkgs.brave;
    commandLineArgs = [
      # --disable-gpu-compositing fixes some flickering on Nvidia at the cost of a slight performance hit.
      "--disable-gpu-compositing"

      "--ozone-platform-hint=auto"
      "--enable-features=UseOzonePlatform"
      "--ozone-platform=wayland"
      # make it use GTK_IM_MODULE if it runs with Gtk4, so fcitx5 can work with it.
      # (only supported by chromium/chrome at this time, not electron)
      "--gtk-version=4"
      # make it use text-input-v1, which works for kwin 5.27 and weston
      "--enable-wayland-ime"
    ];
  };
}