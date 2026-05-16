import { useCallback, useMemo, useReducer } from 'react'
import { apiRequest } from '../services/api'
import { AuthContext } from './authContextValue'

const storedSession = JSON.parse(localStorage.getItem('agroweb-session') ?? 'null')

const initialState = {
  user: storedSession?.user ?? null,
  session: storedSession?.session ?? null,
  status: 'idle',
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'request':
      return { ...state, status: 'loading', error: null }
    case 'success':
      return { user: action.payload.user, session: action.payload.session, status: 'authenticated', error: null }
    case 'failure':
      return { ...state, status: 'failed', error: action.payload }
    case 'logout':
      return { user: null, session: null, status: 'idle', error: null }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const authenticate = useCallback(async (path, credentials) => {
    dispatch({ type: 'request' })
    try {
      const payload = await apiRequest(path, {
        method: 'POST',
        body: JSON.stringify(credentials),
      })

      localStorage.setItem('agroweb-session', JSON.stringify(payload))
      dispatch({ type: 'success', payload })
      return payload
    } catch (error) {
      dispatch({ type: 'failure', payload: error.message })
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    const sessionId = state.session?.id
    localStorage.removeItem('agroweb-session')
    dispatch({ type: 'logout' })

    if (sessionId) {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      }).catch(() => null)
    }
  }, [state.session?.id])

  const value = useMemo(
    () => ({
      user: state.user,
      session: state.session,
      status: state.status,
      error: state.error,
      login: (credentials) => authenticate('/auth/login', credentials),
      register: (credentials) => authenticate('/auth/register', credentials),
      logout,
    }),
    [authenticate, logout, state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
