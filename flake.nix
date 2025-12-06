{
  description = "cross-docs development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            python3
            uv
            bun
          ];

          shellHook = ''
            echo "cross-docs development environment"
            echo "Python: $(python3 --version)"
            echo "uv: $(uv --version)"
            echo "Bun: $(bun --version)"
          '';
        };
      }
    );
}
