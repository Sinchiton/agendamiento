output "gateway_url" {
  value = "http://localhost:${var.nginx_host_port}"
}

output "rabbit_ui" {
  value = "http://localhost:${var.rabbit_ui_port}"
}
