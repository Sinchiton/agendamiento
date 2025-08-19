terraform {
  required_version = ">= 1.6.0"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {
  # Por defecto usa el socket local: unix:///var/run/docker.sock (Linux/Mac)
  # En Windows con Docker Desktop, suele funcionar igual. Si usas remoto:
  # host = "tcp://<ip-docker-host>:2375"
}
