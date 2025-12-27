############################
# Red compartida
############################
resource "docker_network" "mynet" {
  name = "mynet"
}

############################
# Imágenes (build local)
############################
resource "docker_image" "img_mcs_medicos" {
  name         = "mcs_medicos:${var.tag}"
  keep_locally = true
  build {
    context = "${path.module}/../BACKEND/mcs_medicos"
  }
}

resource "docker_image" "img_mcs_pacientes" {
  name         = "mcs_pacientes:${var.tag}"
  keep_locally = true
  build {
    context = "${path.module}/../BACKEND/mcs_pacientes"
  }
}

resource "docker_image" "img_mcs_notifs" {
  name         = "mcs_notificaciones:${var.tag}"
  keep_locally = true
  build {
    context = "${path.module}/../BACKEND/mcs_notificaciones"
  }
}

resource "docker_image" "img_mcs_agenda" {
  name         = "mcs_agendamiento:${var.tag}"
  keep_locally = true
  build {
    context = "${path.module}/../BACKEND/mcs_agendamiento"
  }
}

resource "docker_image" "img_frontend" {
  name         = "frontend:${var.tag}"
  keep_locally = true
  build {
    context = "${path.module}/../frontend"
  }
}

############################
# MySQL
############################
resource "docker_image" "img_mysql" {
  name = "mysql:8.4"
}

resource "docker_container" "mysql" {
  name    = "mysql"
  image   = docker_image.img_mysql.name
  restart = "unless-stopped"

  env = [
    "MYSQL_ROOT_PASSWORD=${var.mysql_root_password}"
  ]

  ports {
    internal = 3306
    external = var.mysql_port
  }

  healthcheck {
    test     = ["CMD-SHELL", "mysqladmin ping -p${var.mysql_root_password} | grep 'mysqld is alive'"]
    interval = "5s"
    timeout  = "3s"
    retries  = 40
  }

  mounts {
    target    = "/docker-entrypoint-initdb.d"
    source    = "${abspath(path.module)}/../mysql-init"
    type      = "bind"
    read_only = false
  }

  networks_advanced {
    name    = docker_network.mynet.name
    aliases = ["mysql"]
  }
}

############################
# RabbitMQ
############################
resource "docker_image" "img_rabbit" {
  name = "rabbitmq:3.13-management"
}

resource "docker_container" "rabbit" {
  name    = "rabbit"
  image   = docker_image.img_rabbit.name
  restart = "unless-stopped"

  ports {
    internal = 5672
    external = var.rabbit_amqp_port
  }
  ports {
    internal = 15672
    external = var.rabbit_ui_port
  }

  healthcheck {
    test     = ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
    interval = "5s"
    timeout  = "5s"
    retries  = 40
  }

  networks_advanced {
    name    = docker_network.mynet.name
    aliases = ["rabbit"]
  }
}

############################
# mcs_medicos
############################
resource "docker_container" "mcs_medicos" {
  name    = "mcs_medicos"
  image   = docker_image.img_mcs_medicos.name
  restart = "unless-stopped"

  env = [
    "PORT=${var.port_medicos}",
    "DB_HOST=mysql",
    "DB_NAME=medicosdb",
    "DB_USER=root",
    "DB_PASSWORD=${var.mysql_root_password}",
  ]

  ports {
    internal = var.port_medicos
    external = var.port_medicos
  }

  depends_on = [
    docker_container.mysql
  ]

  networks_advanced {
    name    = docker_network.mynet.name
    aliases = ["mcs-medicos"]
  }
}

############################
# mcs_pacientes
############################
resource "docker_container" "mcs_pacientes" {
  name    = "mcs_pacientes"
  image   = docker_image.img_mcs_pacientes.name
  restart = "unless-stopped"

  env = [
    "PORT=${var.port_pacientes}",
    "DB_HOST=mysql",
    "DB_NAME=pacientesdb",
    "DB_USER=root",
    "DB_PASSWORD=${var.mysql_root_password}",
  ]

  ports {
    internal = var.port_pacientes
    external = var.port_pacientes
  }

  depends_on = [
    docker_container.mysql
  ]

  networks_advanced {
    name    = docker_network.mynet.name
    aliases = ["mcs-pacientes"]
  }
}

############################
# mcs_notificaciones
############################
resource "docker_container" "mcs_notificaciones" {
  name    = "mcs_notificaciones"
  image   = docker_image.img_mcs_notifs.name
  restart = "unless-stopped"

  env = [
    "PORT=${var.port_notifs}",
    "DB_HOST=mysql",
    "DB_NAME=notifsdb",
    "DB_USER=root",
    "DB_PASSWORD=${var.mysql_root_password}",
    "RABBIT_HOST=rabbit",
    "RABBIT_EXCHANGE=citas.exchange",
    "RABBIT_ROUTING_CITA=cita.confirmada",
    "RABBIT_QUEUE_CITA=notifs.cita.confirmada.q"
  ]

  ports {
    internal = var.port_notifs
    external = var.port_notifs
  }

  depends_on = [
    docker_container.mysql,
    docker_container.rabbit
  ]

  networks_advanced {
    name    = docker_network.mynet.name
    aliases = ["mcs-notificaciones"]
  }
}

############################
# mcs_agendamiento
############################
resource "docker_container" "mcs_agendamiento" {
  name    = "mcs_agendamiento"
  image   = docker_image.img_mcs_agenda.name
  restart = "unless-stopped"

  env = [
    "PORT=${var.port_agenda}",
    "DB_HOST=mysql",
    "DB_NAME=agendadb",
    "DB_USER=root",
    "DB_PASSWORD=${var.mysql_root_password}",
    "MEDICOS_URL=http://mcs-medicos:${var.port_medicos}",
    "PACIENTES_URL=http://mcs-pacientes:${var.port_pacientes}",
    "RABBIT_HOST=rabbit",
    "RABBIT_EXCHANGE=citas.exchange",
    "RABBIT_ROUTING_CITA=cita.confirmada"
  ]

  ports {
    internal = var.port_agenda
    external = var.port_agenda
  }

  depends_on = [
    docker_container.mysql,
    docker_container.rabbit,
    docker_container.mcs_medicos,
    docker_container.mcs_pacientes
  ]

  networks_advanced {
    name    = docker_network.mynet.name
    aliases = ["mcs-agendamiento"]
  }
}

############################
# API Gateway (nginx)
############################
resource "docker_image" "img_nginx" {
  name = "nginx:alpine"
}

resource "docker_container" "api_gateway" {
  name    = "api_gateway"
  image   = docker_image.img_nginx.name
  restart = "unless-stopped"

  ports {
    internal = 80
    external = var.nginx_host_port
  }

  # Monta tu nginx.conf
  mounts {
    type      = "bind"
    target    = "/etc/nginx/conf.d/default.conf"
    source    = "${abspath(path.module)}/../gateway/nginx.conf"
    read_only = true
  }

  depends_on = [
    docker_container.mcs_agendamiento,
    docker_container.mcs_medicos,
    docker_container.mcs_pacientes,
    docker_container.mcs_notificaciones
  ]

  networks_advanced {
    name = docker_network.mynet.name
  }
}

############################
# Frontend (modo dev con Vite)
############################
resource "docker_container" "frontend" {
  name    = "frontend"
  image   = docker_image.img_frontend.name
  restart = "unless-stopped"

  # Si tu Dockerfile ya ejecuta "npm run dev -- --host 0.0.0.0 --port 5173",
  # no necesitas command. Si NO, define:
  # command = ["npm","run","dev","--","--host","0.0.0.0","--port","5173"]

  ports {
    internal = 5173
    external = 5173
  }

  # Bind al código para hot reload
  mounts {
    type      = "bind"
    target    = "/app"
    source    = "${abspath(path.module)}/../frontend"
    read_only = false
  }

  # Evita conflicto de node_modules
  # (equivalente a volumen anónimo en compose)
  mounts {
    type      = "volume"
    target    = "/app/node_modules"
    read_only = false
  }

  depends_on = [
    docker_container.api_gateway
  ]

  networks_advanced {
    name    = docker_network.mynet.name
    aliases = ["frontend"]
  }
}
