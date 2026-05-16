import { useEffect } from 'react'
import { fetchDashboard } from '../store/dashboardSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export function useDashboard() {
  const dispatch = useAppDispatch()
  const dashboard = useAppSelector((state) => state.dashboard)

  useEffect(() => {
    if (dashboard.status === 'idle') {
      void dispatch(fetchDashboard())
    }
  }, [dashboard.status, dispatch])

  return dashboard
}
