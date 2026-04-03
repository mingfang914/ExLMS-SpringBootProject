import React, { useState, useEffect } from 'react';
import { getQuiz, startAttempt, submitAttempt } from '../../services/quizService';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Box, Typography, Paper, Button, Container, 
  RadioGroup, FormControlLabel, Radio, 
  Divider, CircularProgress, Alert, 
  Stepper, Step, StepLabel, 
  Card, CardContent, CardActions
} from '@mui/material';
import { 
  TimerOutlined as TimerIcon,
  CheckCircle as SubmitIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon
} from '@mui/icons-material';

const TakeQuiz = () => {
    const { t } = useTranslation();
    const { groupId, quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [attempt, setAttempt] = useState(null);
    const [responses, setResponses] = useState({});
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initQuiz = async () => {
            try {
                setLoading(true);
                const quizData = await getQuiz(quizId);
                setQuiz(quizData);
                
                // Automatically start an attempt
                const attemptData = await startAttempt(quizId);
                setAttempt(attemptData);
            } catch (err) {
                console.error(err);
                setError(t('quizzes.errors.load_failed'));
            } finally {
                setLoading(false);
            }
        };
        initQuiz();
    }, [quizId, t]);

    const handleSubmit = async () => {
        if (!window.confirm(t('quizzes.confirm_submit'))) return;
        
        try {
            setSubmitting(true);
            const submissionData = { 
                responses: Object.keys(responses).map(qId => ({ questionId: qId, selectedAnswerId: responses[qId] })) 
            };
            await submitAttempt(attempt.id, submissionData);
            navigate(`/groups/${groupId}/quizzes/${quizId}/result/${attempt.id}`);
        } catch (error) {
            console.error('Submission failed', error);
            setError(t('quizzes.errors.submit_failed'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 10, gap: 2 }}>
            <CircularProgress />
            <Typography color="text.secondary">{t('quizzes.starting_attempt')}</Typography>
        </Box>
    );

    if (error) return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Alert severity="error" variant="filled">{error}</Alert>
            <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>{t('common.back')}</Button>
        </Container>
    );

    const questions = quiz.questions || [];
    const currentQuestion = questions[activeQuestion];

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4, mb: 4, borderRadius: 3, borderLeft: '6px solid', borderColor: 'primary.main' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">{quiz.title}</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>{quiz.description}</Typography>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 2, textAlign: 'center', minWidth: 100 }}>
                        <TimerIcon fontSize="small" sx={{ mb: 0.5 }} />
                        <Typography variant="h6" fontWeight="bold">--:--</Typography>
                        <Typography variant="caption">{t('quizzes.remaining')}</Typography>
                    </Box>
                </Box>
                
                <Stepper activeStep={activeQuestion} alternativeLabel sx={{ mt: 4 }}>
                    {questions.map((_, index) => (
                        <Step key={index}>
                            <StepLabel></StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            <Card sx={{ borderRadius: 3, boxShadow: 6, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary', fontWeight: 'bold' }}>
                        {t('quizzes.question')} {activeQuestion + 1} / {questions.length}
                    </Typography>
                    
                    <Typography variant="h5" sx={{ mb: 4, lineHeight: 1.5 }}>
                        {currentQuestion?.content}
                    </Typography>

                    <RadioGroup 
                        value={responses[currentQuestion?.id] || ''} 
                        onChange={(e) => setResponses({...responses, [currentQuestion.id]: e.target.value})}
                    >
                        {currentQuestion?.answers?.map(ans => (
                            <Paper 
                                key={ans.id} 
                                variant="outlined" 
                                sx={{ 
                                    mb: 2, 
                                    p: 1, 
                                    transition: '0.2s',
                                    borderColor: responses[currentQuestion.id] === ans.id ? 'primary.main' : 'divider',
                                    bgcolor: responses[currentQuestion.id] === ans.id ? 'primary.50' : 'transparent',
                                    '&:hover': { bgcolor: 'grey.50' }
                                }}
                            >
                                <FormControlLabel 
                                    value={ans.id} 
                                    control={<Radio />} 
                                    label={ans.content} 
                                    sx={{ width: '100%', m: 0, px: 1 }}
                                />
                            </Paper>
                        ))}
                    </RadioGroup>
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ p: 3, justifyContent: 'space-between' }}>
                    <Button 
                        startIcon={<PrevIcon />} 
                        onClick={() => setActiveQuestion(prev => prev - 1)} 
                        disabled={activeQuestion === 0}
                    >
                        {t('common.previous')}
                    </Button>
                    
                    {activeQuestion === questions.length - 1 ? (
                        <Button 
                            variant="contained" 
                            color="success" 
                            size="large"
                            onClick={handleSubmit} 
                            disabled={submitting}
                            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SubmitIcon />}
                        >
                            {submitting ? t('common.submitting') : t('quizzes.submit_btn')}
                        </Button>
                    ) : (
                        <Button 
                            variant="contained" 
                            size="large"
                            endIcon={<NextIcon />} 
                            onClick={() => setActiveQuestion(prev => prev + 1)}
                        >
                            {t('common.next')}
                        </Button>
                    )}
                </CardActions>
            </Card>
        </Container>
    );
};

export default TakeQuiz;
