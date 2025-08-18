"use client"

import type React from "react"

interface AlertProps {
  type: "success" | "error" | "warning"
  message: string
  onClose?: () => void
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  return (
    <div className={`alert alert-${type}`}>
      {message}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            float: "right",
            background: "none",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

export default Alert
