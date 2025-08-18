import type React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout/Layout"
import Dashboard from "./pages/Dashboard"
import NewAppointment from "./pages/NewAppointment"
import Appointments from "./pages/Appointments"
import NewPatient from "./pages/NewPatient"
import NewDoctor from "./pages/NewDoctor"
import "./styles/global.css"

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/appointments/new" element={<NewAppointment />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/patients/new" element={<NewPatient />} />
          <Route path="/doctors/new" element={<NewDoctor />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
