import type React from "react"
import { Link, useLocation } from "react-router-dom"

const Navigation: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path ? "nav-link active" : "nav-link"
  }

  return (
    <nav className="nav">
      <div className="container">
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/" className={isActive("/")}>
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/appointments/new" className={isActive("/appointments/new")}>
              Agendar Cita
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/appointments" className={isActive("/appointments")}>
              Consultar Citas
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/patients/new" className={isActive("/patients/new")}>
              Agregar Paciente
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/doctors/new" className={isActive("/doctors/new")}>
              Agregar Médico
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/doctors/schedules" className={isActive("/doctors/schedules")}>
              Horarios Médicos
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
