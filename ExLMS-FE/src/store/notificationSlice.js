import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  notifications: [],
  unreadCount: 0,
}

// Mock initial notifications (removed)
const mockNotifications = []

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: mockNotifications,
    unreadCount: mockNotifications.filter(n => !n.read).length
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      state.unreadCount++
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount--
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => { n.read = false })
      state.unreadCount = 0
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter(n => !n.read).length
    },
  },
})

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  setNotifications
} = notificationSlice.actions

export default notificationSlice.reducer
