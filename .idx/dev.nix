{ pkgs, ... }: {
  channel = "stable-24.05";

  # Instala los paquetes especificados.
  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
  ];

  # Define las variables de entorno.
  env = {};

  # Configura la vista previa de IDX.
  idx = {
    previews = [
      {
        # El comando para iniciar el servidor de vista previa.
        command = [ "npm" "run" "dev" ];
        # El puerto en el que tomara el servidor de vista previa.
        port = 3001;
      }
    ];
  };
}
