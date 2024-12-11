{ inputs, lib, config, pkgs, ... }: {
  wayland.windowManager.hyprland.settings = {
    monitor = [
      # Position (0, 0), fractional scaling of 1.25x
      # "DP-1, 2560x1440@179.88, 0x0, 1.25"
      # Fractional scaling causes flickering and other weird issues.
      # I could debug it, but I'm fine with 1x scaling for now.
      "DP-1, 2560x1440@179.88, 0x0, 1"
      "HDMI-A-2, 1600x900@60, 2560x270, 1"
      "HDMI-A-1, 1920x1080@119.98, -1920x180, 1"
    ];

    input = {
      kb_layout = "us";
      kb_variant = "";
      kb_model = "";
      kb_options = "";
      kb_rules = "";

      follow_mouse = 1;

      # [-1.0, 1.0]; 0 is default.
      sensitivity = -0.6;
    };
  };

  programs.hyprlock.settings.background = [
    # Path=screenshot is broken on Nvidia hardware. We manually take a screenshot with grim for each monitor instead.
    # {
    #   monitor = "DP-1";
    #   path = "/tmp/dp-1-lock.png";
    #   blur_passes = 3;
    #   blur_size = 2;
    # }
    # {
    #   monitor = "HDMI-A-2";
    #   path = "/tmp/hdmi-a-2-lock.png";
    #   blur_passes = 3;
    #   blur_size = 2;
    # }
    # {
    #   monitor = "HDMI-A-1";
    #   path = "/tmp/hdmi-a-1-lock.png";
    #   blur_passes = 3;
    #   blur_size = 2;
    # }

    # Non-monitor-specific backgrounds load much faster;
    # maybe there's a way to decompress and lower the quality of the images first before opening hyprlock though?
    {
      path = "/tmp/dp-1-lock.png";
      blur_passes = 3;
      blur_size = 2;
    }
  ];
}