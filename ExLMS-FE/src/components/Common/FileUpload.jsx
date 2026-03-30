import React, { useState } from 'react'
import { Box, Typography, LinearProgress, IconButton, Alert } from '@mui/material'
import fileService from '../../services/fileService'

// ── SVG Icons ─────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
)
const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
    <polyline points="13 2 13 9 20 9"/>
  </svg>
)
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const FileUpload = ({ onUploadSuccess, accept = '*', label = 'Upload File' }) => {
  const [file,      setFile]      = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState(null)
  const [dragging,  setDragging]  = useState(false)

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (selected.size > 1048576) {
      setError('File must be smaller than 1MB.')
      return
    }
    setFile(selected)
    setError(null)
    setDone(false)
    setProgress(0)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      const interval = setInterval(() => {
        setProgress(p => p >= 90 ? p : p + 10)
      }, 200)

      const fileKey = await fileService.uploadFile(file)
      clearInterval(interval)
      setProgress(100)
      setDone(true)
      onUploadSuccess?.(fileKey)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setProgress(0)
    setDone(false)
    setError(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) handleFileChange({ target: { files: [dropped] } })
  }

  return (
    <Box>
      {!file ? (
        /* Drop zone */
        <Box
          component="label"
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 1,
            border: `1.5px dashed ${dragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: '10px',
            py: 2.5, px: 2,
            bgcolor: dragging ? 'rgba(99,102,241,0.06)' : 'rgba(33,38,45,0.4)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': { borderColor: 'var(--color-primary)', bgcolor: 'rgba(99,102,241,0.04)' },
          }}
        >
          <Box sx={{ color: dragging ? 'var(--color-primary)' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}>
            <UploadIcon />
          </Box>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: dragging ? 'var(--color-primary-lt)' : 'var(--color-text-sec)' }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
            Drag & drop or click to browse
          </Typography>
          <input type="file" hidden accept={accept} onChange={handleFileChange} />
        </Box>
      ) : (
        /* File preview */
        <Box
          sx={{
            p: 1.5,
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            bgcolor: 'rgba(33,38,45,0.6)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: uploading ? 1.5 : 0 }}>
            <Box
              sx={{
                width: 36, height: 36, borderRadius: '8px', flexShrink: 0,
                bgcolor: done ? 'rgba(34,197,94,0.12)' : 'rgba(99,102,241,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: done ? '#22C55E' : 'var(--color-primary-lt)',
                border: `1px solid ${done ? 'rgba(34,197,94,0.25)' : 'rgba(99,102,241,0.2)'}`,
              }}
            >
              {done ? <CheckIcon /> : <FileIcon />}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)' }} className="truncate">
                {file.name}
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                {(file.size / 1024).toFixed(0)} KB
                {done && <span style={{ color: '#86EFAC', marginLeft: 6, fontWeight: 600 }}>· Uploaded!</span>}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
              {!uploading && !done && (
                <button
                  type="button"
                  onClick={handleUpload}
                  style={{
                    background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    transition: 'opacity 0.2s',
                  }}
                >
                  Upload
                </button>
              )}
              {!uploading && (
                <IconButton
                  size="small"
                  onClick={handleRemove}
                  sx={{ color: 'var(--color-text-muted)', cursor: 'pointer', '&:hover': { color: '#FCA5A5', bgcolor: 'rgba(239,68,68,0.08)' } }}
                >
                  <XIcon />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Progress bar */}
          {uploading && (
            <LinearProgress
              variant="determinate"
              value={progress}
              className="progress-gradient"
              sx={{ height: 4, borderRadius: 99, bgcolor: 'rgba(33,38,45,0.8)' }}
            />
          )}
        </Box>
      )}

      {error && (
        <Typography sx={{ fontSize: '0.75rem', color: '#FCA5A5', mt: 0.75, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  )
}

export default FileUpload
