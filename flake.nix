{
  description = "NixOS configuration";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.11";
    nix-colors.url = "github:misterio77/nix-colors";
    # home-manager, used for managing user configuration
    home-manager = {
      url = "github:nix-community/home-manager/release-24.11";
      # The `follows` keyword in inputs is used for inheritance.
      # Here, `inputs.nixpkgs` of home-manager is kept consistent with
      # the `inputs.nixpkgs` of the current flake,
      # to avoid problems caused by different versions of nixpkgs.
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  
  outputs = { self, nixpkgs, home-manager, ... } @ inputs: let
    inherit (self) outputs;
  in {
    # NixOS configuration entrypoint
    # Available through 'nixos-rebuild --flake .#your-hostname'
    nixosConfigurations = {
      brody-nixos = nixpkgs.lib.nixosSystem {
        specialArgs = {inherit inputs;};
        modules = [
	  ./nixos/configuration.nix

	  # Make home-manager as a module of nixos so that home-manager configuration
	  # will be deployed automatically when executing `nixos-rebuild switch`
          home-manager.nixosModules.home-manager {
            home-manager.useGlobalPkgs = true;
            home-manager.useUserPackages = true;
	    home-manager.users.brody = import ./home-manager/home.nix;
            home-manager.extraSpecialArgs = {inherit inputs outputs;};
	  }
	];
      };
    };
  };
}
