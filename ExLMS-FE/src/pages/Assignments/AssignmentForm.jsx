import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, Grid, 
  MenuItem, Switch, FormControlLabel, Divider, CircularProgress, Alert,
  Container
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import assignmentService from '../../services/assignmentService';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import CKEditorWrapper from '../../components/Common/CKEditorWrapper';
import { useTranslation } from 'react-i18next';

const AssignmentForm = () => {
  const { t } = useTranslation();
  const { groupId, id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxScore: 100,
    assignedAt: new Date().toISOString().slice(0, 16),
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    submissionType: 'FILE',
    allowedFileTypes: '.pdf,.docx,.zip',
    maxFileSizeMb: 50,
    allowLate: false,
    latePenaltyPercent: 0,
    status: 'PUBLISHED'
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      const fetchAssignment = async () => {
        try {
          setFetching(true);
          const data = await assignmentService.getAssignmentById(id);
          setFormData({
            ...data,
            assignedAt: new Date(data.assignedAt).toISOString().slice(0, 16),
            dueAt: new Date(data.dueAt).toISOString().slice(0, 16),
          });
        } catch (err) {
          setError(t('assignment_form.errors.load_failed'));
        } finally {
          setFetching(false);
        }
      };
      fetchAssignment();
    }
  }, [id, isEdit, t]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (new Date(formData.dueAt) <= new Date(formData.assignedAt)) {
      setError(t('assignment_form.errors.invalid_dates'));
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        if (groupId) {
          await assignmentService.updateAssignment(id, formData);
        } else {
          await assignmentService.updateTemplate(id, formData);
        }
        alert(t('common.update_success'));
      } else {
        if (groupId) {
          await assignmentService.createAssignment(groupId, formData);
        } else {
          await assignmentService.createTemplate(formData);
        }
        alert(t('common.create_success'));
      }
      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.message || t('assignment_form.errors.save_failed'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button 
        startIcon={<BackIcon />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        {t('common.back')}
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {isEdit ? t('assignment_form.title_edit') : t('assignment_form.title_new')}
        </Typography>
        <Divider sx={{ my: 2 }} />

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label={t('assignment_form.title_label')}
                fullWidth
                required
                value={formData.title}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>{t('assignment_detail.instructions')}</Typography>
              <CKEditorWrapper
                value={formData.description}
                onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                placeholder={t('assignment_form.desc_placeholder')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="assignedAt"
                label={t('assignment_form.assigned_at_label')}
                type="datetime-local"
                fullWidth
                required
                value={formData.assignedAt}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dueAt"
                label={t('assignments.due')}
                type="datetime-local"
                fullWidth
                required
                value={formData.dueAt}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="submissionType"
                label={t('assignments.type')}
                select
                fullWidth
                value={formData.submissionType}
                onChange={handleChange}
              >
                <MenuItem value="FILE">{t('assignments.type_file')}</MenuItem>
                <MenuItem value="TEXT">{t('assignments.type_text')}</MenuItem>
                <MenuItem value="MIXED">{t('assignment_detail.both') || 'Both'}</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="maxScore"
                label={t('assignments.max_score')}
                type="number"
                fullWidth
                value={formData.maxScore}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}><Divider>{t('assignment_form.advanced_config')}</Divider></Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="allowedFileTypes"
                label={t('assignment_form.file_types_label')}
                fullWidth
                value={formData.allowedFileTypes}
                onChange={handleChange}
                disabled={formData.submissionType === 'TEXT'}
                helperText={`${t('assignment_form.example')}: .pdf,.docx,.zip`}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="maxFileSizeMb"
                label={t('assignment_form.max_file_size_label')}
                type="number"
                fullWidth
                value={formData.maxFileSizeMb}
                onChange={handleChange}
                disabled={formData.submissionType === 'TEXT'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch 
                    name="allowLate" 
                    checked={formData.allowLate} 
                    onChange={handleChange} 
                  />
                }
                label={t('assignment_detail.allow_late')}
              />
            </Grid>
            {formData.allowLate && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="latePenaltyPercent"
                  label={t('assignment_form.penalty_label')}
                  type="number"
                  fullWidth
                  value={formData.latePenaltyPercent}
                  onChange={handleChange}
                  InputProps={{ endAdornment: <Typography variant="body2">%</Typography> }}
                />
              </Grid>
            )}

            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => navigate(-1)}>{t('common.cancel')}</Button>
              <Button 
                type="submit" 
                variant="contained" 
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? t('assignment_form.saving') : (isEdit ? t('common.edit') : t('common.create'))}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default AssignmentForm;
