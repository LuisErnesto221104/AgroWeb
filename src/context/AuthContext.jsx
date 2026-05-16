import { useMemo, useReducer } from 'react'
import { AuthContext } from './authContextValue'

function authReducer(state, action) {
  switch (action.type) {
    case 'login':
      return { user: action.payload }
    case 'logout':
      return { user: null }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, { user: { name: 'Encargado AgroWeb', role: 'admin' } })

  const value = useMemo(
    () => ({
      user: state.user,
      login: () => dispatch({ type: 'login', payload: { name: 'Encargado AgroWeb', role: 'admin' } }),
      logout: () => dispatch({ type: 'logout' }),
    }),
    [state.user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
