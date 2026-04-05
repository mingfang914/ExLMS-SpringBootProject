import React, { useState, useEffect, useRef } from 'react';
import { getQuiz, startAttempt, submitAttempt } from '../../services/quizService';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Box, Typography, Paper, Button, Container, 
  RadioGroup, FormControlLabel, Radio, Checkbox, TextField,
  Divider, CircularProgress, Alert, 
  Stepper, Step, StepLabel, 
  Card, CardContent, CardActions, Chip, alpha
} from '@mui/material';
import { 
  TimerOutlined as TimerIcon,
  CheckCircle as SubmitIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon
} from '@mui/icons-material';

const TakeQuiz = () => {
    const { t } = useTranslation();
    const { groupId, courseId, quizId } = useParams();
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState(null);
    const [attempt, setAttempt] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState({});
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    // Track if we already triggered auto-submit to avoid duplicate calls
    const autoSubmitTriggered = useRef(false);

    useEffect(() => {
        const initQuiz = async () => {
            try {
                setLoading(true);
                const quizData = await getQuiz(quizId);
                setQuiz(quizData);
                
                // Handle Shuffling if configured
                let qList = [...(quizData.questions || [])];
                if (quizData.shuffleQuestions) {
                    qList = qList.sort(() => Math.random() - 0.5);
                }
                setQuestions(qList);
                
                // Parse Time Limit
                if (quizData.timeLimitSec) {
                    setTimeLeft(quizData.timeLimitSec);
                }

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

    // Timer Effect
    useEffect(() => {
        if (timeLeft === null || submitting) return;
        
        if (timeLeft <= 0) {
            if (!autoSubmitTriggered.current) {
                autoSubmitTriggered.current = true;
                handleAutoSubmit();
            }
            return;
        }
        
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, submitting]);

    const formatTime = (seconds) => {
        if (seconds === null) return '--:--';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAutoSubmit = async () => {
        alert("Hết thời gian! Bài làm của bạn sẽ được tự động nộp.");
        await executeSubmit();
    };

    const handleSubmit = async () => {
        const unanswered = questions.length - Object.keys(responses).length;
        const msg = unanswered > 0 
            ? `Bạn còn ${unanswered} câu chưa làm. Bạn có chắc chắn muốn nộp bài?` 
            : t('quizzes.player.confirm_desc', { count: questions.length, total: questions.length });

        if (!window.confirm(msg)) return;
        await executeSubmit();
    };

    const executeSubmit = async () => {
        try {
            setSubmitting(true);
            const formattedAnswers = Object.keys(responses).map(qId => {
                const qObj = questions.find(q => q.id === qId);
                if (qObj.questionType === 'MULTIPLE_CHOICE') {
                    return { questionId: qId, selectedAnswerIds: responses[qId] || [] };
                } else if (qObj.questionType === 'FILL_BLANK' || qObj.questionType === 'SHORT_ANSWER') {
                    return { questionId: qId, textResponse: responses[qId] };
                } else {
                    return { questionId: qId, selectedAnswerId: responses[qId] };
                }
            });
            
            const submissionData = { answers: formattedAnswers };
            
            await submitAttempt(attempt.id, submissionData);
            
            const basePath = courseId ? `/groups/${groupId}/courses/${courseId}` : `/groups/${groupId}`;
            navigate(`${basePath}/quiz/attempts/${attempt.id}/result`);
        } catch (error) {
            console.error('Submission failed', error);
            setError(t('quizzes.errors.submit_failed'));
            setSubmitting(false);
        }
    };

    const handleMultiToggle = (qId, aId) => {
        setResponses(prev => {
            const current = [...(prev[qId] || [])];
            const idx = current.indexOf(aId);
            if (idx >= 0) {
                current.splice(idx, 1);
            } else {
                current.push(aId);
            }
            return { ...prev, [qId]: current };
        });
    };

    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: 3 }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" color="text.secondary" fontWeight={600}>{t('quizzes.player.starting', 'Đang thiết lập bài thi...')}</Typography>
        </Box>
    );

    if (error) return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Alert severity="error" variant="filled" sx={{ p: 3, borderRadius: 3, fontSize: '1.1rem' }}>{error}</Alert>
            <Button variant="contained" sx={{ mt: 3, borderRadius: 2 }} onClick={() => navigate(-1)}>Quay lại</Button>
        </Container>
    );

    const currentQuestion = questions[activeQuestion];
    const isAnswered = (qId) => {
        const r = responses[qId];
        if (!r) return false;
        if (Array.isArray(r)) return r.length > 0;
        return typeof r === 'string' && r.trim().length > 0;
    };
    
    // Determine timer color styling based on time left
    const isHurry = timeLeft !== null && timeLeft <= 60;

    return (
        <Container maxWidth="md" sx={{ py: { xs: 2, md: 5 } }}>
            {/* Header Status Bar */}
            <Paper className="premium-glass" sx={{ 
                p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, 
                display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2
            }}>
                <Box>
                    <Chip label="Kiểm tra trực tuyến" color="primary" size="small" sx={{ mb: 1.5, fontWeight: 800, letterSpacing: 1 }} />
                    <Typography variant="h4" fontWeight="800" sx={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                        {quiz.title}
                    </Typography>
                </Box>
                <Box sx={{ 
                    p: 2, px: 3,
                    bgcolor: isHurry ? alpha('#EF4444', 0.1) : alpha('#6366F1', 0.1), 
                    color: isHurry ? '#EF4444' : '#6366F1', 
                    borderRadius: 3, textAlign: 'center', minWidth: 140,
                    border: '1px solid', borderColor: isHurry ? alpha('#EF4444', 0.3) : alpha('#6366F1', 0.3),
                    animation: isHurry ? 'pulse-ring 1.5s infinite' : 'none'
                }}>
                    <TimerIcon sx={{ mb: 0.5, fontSize: 32 }} />
                    <Typography variant="h4" fontWeight="900" sx={{ fontFamily: 'monospace', letterSpacing: -1 }}>
                        {formatTime(timeLeft)}
                    </Typography>
                </Box>
            </Paper>

            {/* Pagination Stepper */}
            <Box sx={{ mb: 4, px: 2, overflowX: 'auto', pb: 2 }}>
                <Stepper activeStep={activeQuestion} alternativeLabel nonLinear>
                    {questions.map((q, index) => {
                        const answered = isAnswered(q.id);
                        return (
                            <Step key={q.id} completed={answered}>
                                <StepLabel 
                                    onClick={() => setActiveQuestion(index)}
                                    StepIconProps={{ sx: { cursor: 'pointer' } }}
                                    sx={{ 
                                        cursor: 'pointer',
                                        '& .MuiStepLabel-label': { mt: 0.5, fontSize: '0.75rem', fontWeight: activeQuestion === index ? 800 : 500 }
                                    }}
                                >
                                    {index + 1}
                                </StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
            </Box>

            {/* Question Card */}
            <Card className="premium-glass" sx={{ 
                borderRadius: 4, 
                minHeight: 450, display: 'flex', flexDirection: 'column' 
            }}>
                <CardContent sx={{ flexGrow: 1, p: { xs: 3, md: 5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Chip 
                            label={`Câu hỏi ${activeQuestion + 1} / ${questions.length}`} 
                            variant="outlined" color="primary" 
                            sx={{ fontWeight: 800, borderRadius: 2 }} 
                        />
                        <Chip label={`${currentQuestion?.points || 1} điểm`} size="small" />
                    </Box>
                    
                    <Typography variant="h5" sx={{ mb: 4, lineHeight: 1.6, fontWeight: 700, color: 'var(--color-text)' }}>
                        {currentQuestion?.content}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                        {/* SINGLE CHOICE & TRUE/FALSE */}
                        {(currentQuestion.questionType === 'SINGLE_CHOICE' || currentQuestion.questionType === 'TRUE_FALSE') && (
                            <RadioGroup 
                                value={responses[currentQuestion.id] || ''} 
                                onChange={(e) => setResponses({...responses, [currentQuestion.id]: e.target.value})}
                            >
                                {currentQuestion.answers?.map(ans => (
                                    <Box 
                                        key={ans.id} 
                                        className={`answer-tile ${responses[currentQuestion.id] === ans.id ? 'selected' : ''}`}
                                        sx={{ mb: 2, p: 1.5, px: 2, borderRadius: 3 }}
                                        onClick={() => setResponses({...responses, [currentQuestion.id]: ans.id})}
                                    >
                                        <FormControlLabel 
                                            value={ans.id} 
                                            control={<Radio color="primary" />} 
                                            label={<Typography sx={{ fontWeight: responses[currentQuestion.id] === ans.id ? 700 : 500, fontSize: '1.05rem', color: responses[currentQuestion.id] === ans.id ? 'var(--color-primary)' : 'var(--color-text)' }}>{ans.content}</Typography>} 
                                            sx={{ width: '100%', m: 0 }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </Box>
                                ))}
                            </RadioGroup>
                        )}

                        {/* MULTIPLE CHOICE */}
                        {currentQuestion.questionType === 'MULTIPLE_CHOICE' && (
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 2 }}>
                                    Lưu ý: Có thể chọn NHIỀU đáp án
                                </Typography>
                                {currentQuestion.answers?.map(ans => {
                                    const isSelected = (responses[currentQuestion.id] || []).includes(ans.id);
                                    return (
                                        <Box 
                                            key={ans.id} 
                                            className={`answer-tile ${isSelected ? 'selected-success' : ''}`}
                                            sx={{ mb: 2, p: 1.5, px: 2, borderRadius: 3 }}
                                            onClick={() => handleMultiToggle(currentQuestion.id, ans.id)}
                                        >
                                            <FormControlLabel 
                                                control={<Checkbox checked={isSelected} color="success" />} 
                                                label={<Typography sx={{ fontWeight: isSelected ? 700 : 500, fontSize: '1.05rem', color: isSelected ? 'var(--color-success)' : 'var(--color-text)' }}>{ans.content}</Typography>} 
                                                sx={{ width: '100%', m: 0 }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}

                        {/* FILL BLANK & SHORT ANSWER */}
                        {(currentQuestion.questionType === 'FILL_BLANK' || currentQuestion.questionType === 'SHORT_ANSWER') && (
                            <TextField
                                fullWidth
                                multiline={currentQuestion.questionType === 'SHORT_ANSWER'}
                                rows={currentQuestion.questionType === 'SHORT_ANSWER' ? 4 : 1}
                                variant="outlined"
                                placeholder="Nhập câu trả lời của bạn..."
                                value={responses[currentQuestion.id] || ''}
                                onChange={(e) => setResponses({...responses, [currentQuestion.id]: e.target.value})}
                                sx={{ 
                                    mt: 1, 
                                    '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: alpha('#FFF', 0.02) }
                                }}
                            />
                        )}
                    </Box>
                </CardContent>
                
                <Divider sx={{ borderColor: 'var(--color-border)' }} />
                
                <CardActions sx={{ p: { xs: 3, md: 4 }, justifyContent: 'space-between', bgcolor: 'var(--color-surface-2)' }}>
                    <Button 
                        startIcon={<PrevIcon />} 
                        onClick={() => setActiveQuestion(prev => prev - 1)} 
                        disabled={activeQuestion === 0}
                        sx={{ fontWeight: 700, borderRadius: 2, px: 3, py: 1.5 }}
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
                            sx={{ fontWeight: 800, borderRadius: 2, px: 5, py: 1.5, boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)' }}
                        >
                            {submitting ? t('quizzes.player.submitting', 'Đang nộp...') : t('quizzes.player.finish_btn', 'Hoàn tất & Nộp')}
                        </Button>
                    ) : (
                        <Button 
                            variant="contained" 
                            size="large"
                            endIcon={<NextIcon />} 
                            onClick={() => setActiveQuestion(prev => prev + 1)}
                            sx={{ fontWeight: 800, borderRadius: 2, px: 4, py: 1.5, background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
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
