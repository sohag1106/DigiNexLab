// Tiny toast system: push messages from anywhere via useToast().
import { createContext, useContext, useCallback, useState } from 'react'

const ToastCtx = createContext(() => {})

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])

  const push = useCallback((message, type = 'info', ttl = 4200) => {
    const id = Math.random().toString(36).slice(2)
    setItems((li) => [...li, { id, message, type }])
    setTimeout(() => setItems((li) => li.filter((t) => t.id !== id)), ttl)
  }, [])

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}
