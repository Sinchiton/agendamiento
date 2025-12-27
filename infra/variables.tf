variable "mysql_root_password" {
  type    = string
  default = "root"
}

variable "nginx_host_port" {
  type    = number
  default = 8080
}

variable "mysql_port" {
  type    = number
  default = 3306
}

variable "rabbit_amqp_port" {
  type    = number
  default = 5672
}

variable "rabbit_ui_port" {
  type    = number
  default = 15672
}

variable "port_agenda" {
  type    = number
  default = 8081
}

variable "port_medicos" {
  type    = number
  default = 8082
}

variable "port_pacientes" {
  type    = number
  default = 8083
}

variable "port_notifs" {
  type    = number
  default = 8084
}

variable "tag" {
  type    = string
  default = "local"
}
