{
  description = "NixOS configuration";

  inputs = {
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixos-unstable";

    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.11";
    nix-colors.url = "github:misterio77/nix-colors";

    # Home-manager, used for managing user configuration
    home-manager = {
      url = "github:nix-community/home-manager/release-24.11";
      # The `follows` keyword in inputs is used for inheritance.
      # Here, `inputs.nixpkgs` of home-manager is kept consistent with
      # the `inputs.nixpkgs` of the current flake,
      # to avoid problems caused by different versions of nixpkgs.
      inputs.nixpkgs.follows = "nixpkgs";
    };

    hyprland.url = "github:hyprwm/Hyprland";

    nixpkgs-wayland.url = "github:nix-community/nixpkgs-wayland";
    nixpkgs-wayland.inputs.nixpkgs.follows = "nixpkgs";
  };
  
  outputs = { self, nixpkgs, nixpkgs-unstable, home-manager, hyprland, ... } @ inputs: let
    inherit (self) outputs;
  in {
    # NixOS configuration entrypoint
    # Available through 'nixos-rebuild --flake .#your-hostname'
    nixosConfigurations = {
      brody-nixos = nixpkgs.lib.nixosSystem {
        specialArgs = {inherit inputs;};

        # All system configurations
        modules = [
          ./nixos/configuration.nix

          # Make home-manager as a module of nixos so that home-manager configuration
          # will be deployed automatically when executing `nixos-rebuild switch`
          home-manager.nixosModules.home-manager {
            home-manager.useGlobalPkgs = true;
            home-manager.useUserPackages = true;
            home-manager.users.brody = import ./home-manager/home.nix;
            home-manager.extraSpecialArgs = {inherit inputs outputs;};
            home-manager.backupFileExtension = "backup";
          }
        ];

      };
    };

    # We could put home-manager configuration entrypoints here as well,
    # but I put them in nixosConfigurations instead so I don't have to
    # remember to run `home-manager switch` after `nixos-rebuild switch`.
  };
}
