import React, { createContext, useContext, useState, useCallback } from 'react'
import PremiumDialog from '../components/Common/PremiumDialog'

const ModalContext = createContext(null)

export const ModalProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: '',
    cancelText: '',
    showCancel: true,
    resolve: null
  })

  const showDialog = useCallback(({ 
    title = '', 
    message = '', 
    type = 'info', 
    confirmText = '', 
    cancelText = '',
    showCancel = true 
  }) => {
    return new Promise((resolve) => {
      setModalConfig({
        open: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        showCancel,
        resolve
      })
    })
  }, [])

  const handleClose = useCallback(() => {
    if (modalConfig.resolve) modalConfig.resolve(false)
    setModalConfig(prev => ({ ...prev, open: false }))
  }, [modalConfig])

  const handleConfirm = useCallback(() => {
    if (modalConfig.resolve) modalConfig.resolve(true)
    setModalConfig(prev => ({ ...prev, open: false }))
  }, [modalConfig])

  // Helper methods
  const showAlert = (title, message, type = 'info') => 
    showDialog({ title, message, type, showCancel: false })
  
  const showConfirm = (title, message, type = 'confirm') => 
    showDialog({ title, message, type, showCancel: true })

  const showSuccess = (title, message) =>
    showDialog({ title, message, type: 'success', showCancel: false })

  const showError = (title, message) =>
    showDialog({ title, message, type: 'error', showCancel: false })

  return (
    <ModalContext.Provider value={{ showDialog, showAlert, showConfirm, showSuccess, showError }}>
      {children}
      <PremiumDialog 
        {...modalConfig} 
        onClose={handleClose} 
        onConfirm={handleConfirm} 
      />
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
