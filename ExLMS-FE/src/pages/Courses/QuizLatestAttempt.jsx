import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Alert } from '@mui/material'
import * as quizService from '../../services/quizService'

const QuizLatestAttempt = () => {
  const { groupId, courseId, quizId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const attempts = await quizService.getMyAttempts(quizId)
        if (attempts && attempts.length > 0) {
          // Sort by submittedAt descending
          const latest = attempts.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0]
          navigate(`/groups/${groupId}/courses/${courseId}/quiz/attempts/${latest.id}/result`)
        } else {
          setError('Bạn chưa thực hiện bài kiểm tra này.')
          setLoading(false)
        }
      } catch (err) {
        setError('Không thể tải lịch sử làm bài.')
        setLoading(false)
      }
    }
    fetchLatest()
  }, [quizId, groupId, courseId, navigate])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
  if (error) return <Box sx={{ p: 4 }}><Alert severity="info">{error}</Alert></Box>

  return null
}

export default QuizLatestAttempt
