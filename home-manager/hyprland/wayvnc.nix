{ inputs, lib, config, pkgs, flakePath, ... }: {
  home.packages = with pkgs; [
    wayvnc
  ];

  systemd.user.services.wayvnc = {
    Unit = {
      Description = "WayVNC server";
      # Allow it to restart infinitely
      StartLimitIntervalSec = 0;
    };

    Service = {
      ExecStart = "${pkgs.writeShellScript "wayvnc-start" ''
        if [[ $XDG_SESSION_TYPE = "wayland" ]]; then
          ${lib.getExe pkgs.wayvnc} && exit 1
        else
          exit 0
        fi
      ''}";
      Restart = "on-failure";
      RestartSec = "1m";
    };

    Install = { WantedBy = [ "graphical-session.target" ]; };
  };

  # TODO: Figure out how to improve this password situation (maybe sops-nix?)
  xdg.configFile."wayvnc/config".text = ''
    address=0.0.0.0
    port=5900
    password=CHANGEMEPLEASE
  '';

  # Open the port in the firewall
  networking.firewall.allowedTCPPorts = [ 5900 ];
}