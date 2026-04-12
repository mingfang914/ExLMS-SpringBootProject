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
import { useModal } from '../../context/ModalContext';

const AssignmentForm = () => {
  const { t } = useTranslation();
  const { groupId, id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useModal();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxScore: 100,
    submissionType: 'FILE',
    allowedFileTypes: '.pdf,.docx,.zip',
    maxFileSizeMb: 50,
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
          let data;
          if (groupId) {
            data = await assignmentService.getAssignmentById(id);
          } else {
            // Inventory mode
            data = await assignmentService.getTemplateById(id);
          }
          setFormData({
            ...data
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
    let finalValue = type === 'checkbox' ? checked : value;
    
    if (type === 'number') {
      finalValue = value === '' ? null : parseInt(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title: formData.title,
      description: formData.description,
      maxScore: formData.maxScore,
      submissionType: formData.submissionType,
      allowedFileTypes: formData.allowedFileTypes,
      maxFileSizeMb: formData.maxFileSizeMb
    };

    try {
      if (isEdit) {
        if (groupId) {
          await assignmentService.updateAssignment(id, payload);
        } else {
          await assignmentService.updateTemplate(id, payload);
        }
        await showSuccess(t('common.success'), t('common.update_success'));
      } else {
        if (groupId) {
          await assignmentService.createAssignment(groupId, payload);
        } else {
          await assignmentService.createTemplate(payload);
        }
        await showSuccess(t('common.success'), t('common.create_success'));
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
                value={formData.title || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>{t('assignment_detail.instructions')}</Typography>
              <CKEditorWrapper
                value={formData.description || ''}
                onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                placeholder={t('assignment_form.desc_placeholder')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="submissionType"
                label={t('assignments.type')}
                select
                fullWidth
                value={formData.submissionType || 'FILE'}
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
                value={formData.maxScore ?? 100}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}><Divider>{t('assignment_form.advanced_config')}</Divider></Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="allowedFileTypes"
                label={t('assignment_form.file_types_label')}
                fullWidth
                value={formData.allowedFileTypes || ''}
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
                value={formData.maxFileSizeMb ?? 50}
                onChange={handleChange}
                disabled={formData.submissionType === 'TEXT'}
              />
            </Grid>

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
