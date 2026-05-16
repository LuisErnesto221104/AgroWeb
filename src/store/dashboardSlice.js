import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiRequest } from '../services/api'

const initialState = {
  stats: [],
  animals: [],
  tasks: [],
  costs: [],
  healthSummary: [],
  status: 'idle',
  error: null,
}

export const fetchDashboard = createAsyncThunk('dashboard/fetchDashboard', async () => {
  return apiRequest('/dashboard')
})

export const toggleTaskStatus = createAsyncThunk('dashboard/toggleTaskStatus', async (taskId) => {
  return apiRequest(`/tasks/${taskId}/toggle`, { method: 'PATCH' })
})

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.stats = action.payload.stats
        state.animals = action.payload.animals
        state.tasks = action.payload.tasks
        state.costs = action.payload.costs
        state.healthSummary = action.payload.healthSummary
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'No se pudo cargar el dashboard.'
      })
      .addCase(toggleTaskStatus.fulfilled, (state, action) => {
        const taskIndex = state.tasks.findIndex((task) => task.id === action.payload.id)
        if (taskIndex >= 0) {
          state.tasks[taskIndex] = action.payload
        }
      })
  },
})

export default dashboardSlice.reducer
