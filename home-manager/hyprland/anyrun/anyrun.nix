{ inputs, lib, config, pkgs, ... }: {
  nix.settings = {
    builders-use-substitutes = true;
    extra-substituters = [
      "https://anyrun.cachix.org"
    ];

    extra-trusted-public-keys = [
      "anyrun.cachix.org-1:pqBobmOjI7nKlsUMV25u9QHa9btJK65/C8vnO3p346s="
    ];
  };

  imports = [
    inputs.anyrun.homeManagerModules.default
  ];


  # TODO: Fix; anyrun panics currently lol
  programs.anyrun = {
    enable = true;
    config = {
      x = { fraction = 0; };
      y = { fraction = 0; };
      width = { fraction = 0.5; };
      hideIcons = false;
      ignoreExclusiveZones = false;
      layer = "overlay";
      hidePluginInfo = false;
      closeOnClick = false;
      showResultsImmediately = true;
      maxEntries = null;

      plugins = [
        # An array of all the plugins you want, which either can be paths to the .so files, or their packages
        inputs.anyrun.packages.${pkgs.system}.applications
        inputs.anyrun.packages.${pkgs.system}.dictionary
        inputs.anyrun.packages.${pkgs.system}.symbols
        inputs.anyrun.packages.${pkgs.system}.shell
        inputs.anyrun.packages.${pkgs.system}.rink
        inputs.anyrun.packages.${pkgs.system}.websearch
        inputs.anyrun.packages.${pkgs.system}.kidex
      ];
    };

    # Compile ./anyrun.scss to css with sassc and include it in the extraCss field
    extraCss = builtins.readFile (
      pkgs.stdenv.mkDerivation {
        name = "anyrun-css";
        src = ./styles;
        phases = [ "buildPhase" ];
        buildInputs = [ pkgs.sassc ];
        buildPhase = ''
          echo "Compiling anyrun.scss to css"
          echo $out
          ls -la
          sassc ./anyrun.css $out
        '';
      }
    );

    extraConfigFiles."applications.ron".text = ''
      Config(
        // Also show the Desktop Actions defined in the desktop files, e.g. "New Window" from LibreWolf
        desktop_actions: true,
        max_entries: 5, 
        // The terminal used for running terminal based desktop entries, if left as `None` a static list of terminals is used
        // to determine what terminal to use.
        terminal: Some("alacritty"),
      )
    '';
    extraConfigFiles."kidex.ron".text = ''
      Config(
        max_entries: 3,
      )
    '';
    extraConfigFiles."dictionary.ron".text = ''
      Config(
        prefix: ":def",
        max_entries: 5,
      )
    '';
    extraConfigFiles."shell.ron".text = ''
      Config(
        prefix: ":sh",
        // Override the shell used to launch the command
        shell: None,
      )
    '';
    extraConfigFiles."symbols.ron".text = ''
      Config(
        // The prefix that the search needs to begin with to yield symbol results
        prefix: "",
        // Custom user defined symbols to be included along the unicode symbols
        symbols: {
          // "name": "text to be copied"
          "shrug": "¯\\_(ツ)_/¯",
        },
        max_entries: 3,
      )
    '';
    extraConfigFiles."translate.ron".text = ''
      Config(
        prefix: ":",
        language_delimiter: ">",
        max_entries: 3,
      )
    '';
    extraConfigFiles."websearch.ron".text = ''
      Config(
        prefix: "?",
        // Options: Google, Ecosia, Bing, DuckDuckGo, Custom
        //
        // Custom engines can be defined as such:
        // Custom(
        //   name: "Searx",
        //   url: "searx.be/?q={}",
        // )
        //
        // NOTE: `{}` is replaced by the search query and `https://` is automatically added in front.
        engines: [DuckDuckGo] 
      )
    '';
  };
}