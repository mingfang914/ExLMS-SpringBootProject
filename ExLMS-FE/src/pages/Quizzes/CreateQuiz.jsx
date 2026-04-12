import React, { useState } from 'react';
import { createQuiz } from '../../services/quizService';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import { 
  Box, Typography, TextField, Button, Paper, Grid, 
  MenuItem, Divider, CircularProgress, Alert,
  Container, IconButton
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';

const CreateQuiz = () => {
    const { t } = useTranslation();
    const { showSuccess, showError } = useModal();
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        timeLimitSec: 3600,
        passingScore: 50,
        questions: []
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            await createQuiz(groupId, formData);
            await showSuccess(t('common.success'), t('quizzes.messages.create_success') || 'Quiz created successfully');
            navigate(`/groups/${groupId}?tab=quizzes`);
        } catch (err) {
            console.error('Failed to create quiz:', err);
            setError(err.response?.data?.message || t('quizzes.errors.save_failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button 
                startIcon={<BackIcon />} 
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
            >
                {t('common.back')}
            </Button>

            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {t('quizzes.create_title')}
                </Typography>
                <Divider sx={{ my: 2 }} />

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                label={t('quizzes.form.title')}
                                fullWidth
                                required
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label={t('quizzes.form.description')}
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label={t('quizzes.form.time_limit') + ' (' + t('common.minutes') + ')'}
                                type="number"
                                fullWidth
                                value={formData.timeLimitSec / 60}
                                onChange={e => setFormData({...formData, timeLimitSec: parseInt(e.target.value) * 60})}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label={t('quizzes.form.passing_score') + ' (%)'}
                                type="number"
                                inputProps={{ min: 0, max: 100 }}
                                fullWidth
                                value={formData.passingScore}
                                onChange={e => setFormData({...formData, passingScore: parseInt(e.target.value)})}
                            />
                        </Grid>

                        <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button onClick={() => navigate(-1)} disabled={loading}>
                                {t('common.cancel')}
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                disabled={loading}
                            >
                                {loading ? t('common.saving') : t('common.create')}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default CreateQuiz;
