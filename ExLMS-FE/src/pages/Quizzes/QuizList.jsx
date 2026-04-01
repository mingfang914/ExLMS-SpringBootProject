import React, { useState, useEffect } from 'react';
import { getQuizzesByGroup } from '../../services/quizService';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Chip, 
  CircularProgress, Alert 
} from '@mui/material';
import { 
  QuizOutlined as QuizIcon,
  Add as AddIcon,
  TimerOutlined as TimerIcon,
  CheckCircleOutlined as PassingIcon
} from '@mui/icons-material';

const QuizList = () => {
    const { t } = useTranslation();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { groupId } = useParams();

    useEffect(() => {
        const fetchQuizzes = async () => {
            if (groupId) {
                try {
                    setLoading(true);
                    const data = await getQuizzesByGroup(groupId);
                    setQuizzes(data);
                } catch (err) {
                    console.error(err);
                    setError(t('quizzes.errors.load_failed'));
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchQuizzes();
    }, [groupId, t]);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <QuizIcon color="primary" /> {t('quizzes.list_title')}
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    component={Link} 
                    to={`/groups/${groupId}/quizzes/create`}
                >
                    {t('quizzes.create_btn')}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t('quizzes.table.title')}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t('quizzes.table.time_limit')}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t('quizzes.table.passing_score')}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t('quizzes.table.status')}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('quizzes.table.actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {quizzes.map(quiz => (
                            <TableRow key={quiz.id} hover>
                                <td className="px-6 py-4">
                                    <Typography variant="body1" fontWeight="600">{quiz.title}</Typography>
                                </td>
                                <td className="px-6 py-4">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TimerIcon fontSize="small" color="action" />
                                        {quiz.timeLimitSec ? `${Math.floor(quiz.timeLimitSec / 60)} ${t('common.minutes')}` : t('quizzes.no_limit')}
                                    </Box>
                                </td>
                                <td className="px-6 py-4">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PassingIcon fontSize="small" color="primary" />
                                        {quiz.passingScore}%
                                    </Box>
                                </td>
                                <td className="px-6 py-4">
                                    <Chip 
                                        label={quiz.status === 'PUBLISHED' ? t('quizzes.status.active') : quiz.status} 
                                        color={quiz.status === 'PUBLISHED' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </td>
                                <td className="px-6 py-4" align="right">
                                    <Button 
                                        size="small" 
                                        variant="outlined"
                                        component={Link} 
                                        to={`/groups/${groupId}/quizzes/${quiz.id}`}
                                    >
                                        {t('quizzes.take_quiz')}
                                    </Button>
                                </td>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {quizzes.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                        {t('quizzes.no_quizzes')}
                    </Box>
                )}
            </TableContainer>
        </Box>
    );
};

export default QuizList;
