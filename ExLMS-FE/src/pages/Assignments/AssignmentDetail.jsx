import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Divider, Alert,
  Chip, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Tooltip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Timeline as DueIcon,
  EmojiEvents as TrophyIcon,
  Edit as GradeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Description as DescriptionIcon,
  FilePresent as FileIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import assignmentService from '../../services/assignmentService';
import groupService from '../../services/groupService';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import CKEditorWrapper from '../../components/Common/CKEditorWrapper';
import { useTranslation } from 'react-i18next';

const AssignmentDetail = () => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'vi' ? vi : enUS;
  const { groupId, id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Submission state
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState(null); // ID of submission being edited

  // Grading state
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ score: 0, feedback: '', status: 'GRADED' });
  const [grading, setGrading] = useState(false);
  
  // Confirm Dialog state
  const [confirmCancel, setConfirmCancel] = useState(null); // ID of submission to cancel

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [asgnData, groupData] = await Promise.all([
          assignmentService.getAssignmentById(id),
          groupService.getGroupById(groupId)
        ]);

        setAssignment(asgnData);

        // Check role
        const currentUserRole = groupData?.currentUserRole;
        const instructorRoles = ['OWNER', 'EDITOR'];
        const isInstr = instructorRoles.includes(currentUserRole);
        setIsInstructor(isInstr);

        if (isInstr) {
          const subs = await assignmentService.getAllSubmissions(id);
          setSubmissions(subs);
        } else {
          const mySubs = await assignmentService.getMySubmissions(id);
          setMySubmissions(mySubs);
        }
      } catch (err) {
        setError(t('assignments.errors.load_failed') || 'Could not load assignment details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, groupId, user?.id, t]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmission = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('request', new Blob([JSON.stringify({
        submissionType: assignment.submissionType === 'MIXED' ? (selectedFile ? 'FILE' : 'TEXT') : assignment.submissionType,
        textContent: submissionText
      })], { type: 'application/json' }));

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      if (editingSubmission) {
        await assignmentService.updateSubmission(editingSubmission, formData);
        alert(t('assignment_detail.messages.update_success'));
      } else {
        await assignmentService.submitAssignment(id, formData);
        alert(t('assignment_detail.messages.submit_success'));
      }

      // Refresh my submissions
      const mySubs = await assignmentService.getMySubmissions(id);
      setMySubmissions(mySubs);
      setSubmissionText('');
      setSelectedFile(null);
      setEditingSubmission(null);
    } catch (err) {
      alert(err.response?.data?.message || t('assignment_detail.errors.submit_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubmission = async () => {
    if (!confirmCancel) return;
    try {
      await assignmentService.deleteSubmission(confirmCancel);
      const mySubs = await assignmentService.getMySubmissions(id);
      setMySubmissions(mySubs);
      alert(t('assignment_detail.messages.cancel_success'));
    } catch (err) {
      alert(err.response?.data?.message || t('assignment_detail.errors.cancel_failed'));
    } finally {
      setConfirmCancel(null);
    }
  };

  const startEditSubmission = (sub) => {
    setEditingSubmission(sub.id);
    setSubmissionText(sub.textContent || '');
    // Note: We can't really "edit" a file easily by showing it in the input, 
    // but the student can upload a new one to replace it.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGrade = async () => {
    setGrading(true);
    try {
      await assignmentService.gradeSubmission(gradingSubmission.id, gradeData);
      // Refresh submissions
      const subs = await assignmentService.getAllSubmissions(id);
      setSubmissions(subs);
      setGradingSubmission(null);
      alert(t('assignment_detail.messages.grade_success'));
    } catch (err) {
      alert(t('assignment_detail.errors.grade_failed'));
    } finally {
      setGrading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await assignmentService.exportGrades(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Grades_${assignment.title}.xlsx`;
      a.click();
    } catch (err) {
      alert(t('assignment_detail.errors.export_failed'));
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  if (!assignment) return <Alert severity="warning" sx={{ m: 4 }}>{t('assignments.errors.not_found')}</Alert>;

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4}>
        {/* Left Side: Assignment Info */}
        <Grid item xs={12} md={isInstructor ? 12 : 8}>
          <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>{assignment.title}</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Chip
                    icon={<DueIcon />}
                    label={`${t('assignments.due')}: ${format(new Date(assignment.dueAt), 'HH:mm dd/MM/yyyy', { locale: currentLocale })}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    icon={<TrophyIcon />}
                    label={`${t('assignments.max_score')}: ${assignment.maxScore}`}
                    color="secondary"
                  />
                  {assignment.allowLate && (
                    <Chip label={`${t('assignment_detail.allow_late')} (${t('assignment_detail.penalty')} ${assignment.latePenaltyPercent}%)`} color="warning" size="small" />
                  )}
                </Box>
              </Box>
              {isInstructor && (
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>
                  {t('assignment_detail.export_excel')}
                </Button>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" gutterBottom>{t('assignment_detail.instructions')}</Typography>
            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}
              dangerouslySetInnerHTML={{ __html: assignment.description }}
            />
          </Paper>

          {/* Instructor View: List of Submissions */}
          {isInstructor && (
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>{t('assignment_detail.submission_list')}</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('assignment_detail.student')}</TableCell>
                      <TableCell>{t('assignment_detail.submitted_at')}</TableCell>
                      <TableCell>{t('assignment_detail.attempt')}</TableCell>
                      <TableCell>{t('assignment_detail.status')}</TableCell>
                      <TableCell>{t('assignment_detail.score')}</TableCell>
                      <TableCell>{t('common.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submissions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{sub.studentName}</Typography>
                          <Typography variant="caption" color="textSecondary">{sub.studentEmail}</Typography>
                        </TableCell>
                        <TableCell>
                          {format(new Date(sub.submittedAt), 'HH:mm dd/MM/yyyy')}
                          {sub.isLate && <Chip label={t('assignment_detail.late')} color="error" size="small" sx={{ ml: 1 }} />}
                        </TableCell>
                        <TableCell>{t('assignment_detail.attempt_no', { count: sub.attemptNumber })}</TableCell>
                        <TableCell>
                          <Chip
                            label={sub.gradeStatus === 'GRADED' ? t('assignment_detail.graded') : t('assignment_detail.awaiting_grade')}
                            color={sub.gradeStatus === 'GRADED' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {sub.score !== null && sub.score !== undefined ? `${sub.score}/${assignment.maxScore}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Tooltip title={t('assignment_detail.actions.grade')}>
                            <IconButton color="primary" onClick={() => {
                              setGradingSubmission(sub);
                              setGradeData({
                                score: sub.score || 0,
                                feedback: sub.feedback || '',
                                status: 'GRADED'
                              });
                            }}>
                              <GradeIcon />
                            </IconButton>
                          </Tooltip>
                          {sub.fileUrl && (
                            <Tooltip title={t('assignment_detail.actions.download_file')}>
                              <IconButton color="secondary" component="a" href={sub.fileUrl} download>
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Grid>

        {/* Right Side: Student Submission Form & History */}
        {!isInstructor && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>{t('assignment_detail.your_submission')}</Typography>
              <Divider sx={{ mb: 2 }} />

              <Box component="form" onSubmit={handleSubmission}>
                {(assignment.submissionType === 'TEXT' || assignment.submissionType === 'MIXED') && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>{t('assignment_detail.text_content')}</Typography>
                    <CKEditorWrapper
                      value={submissionText}
                      onChange={setSubmissionText}
                      placeholder={t('assignment_detail.enter_answer')}
                      minHeight="200px"
                    />
                  </Box>
                )}

                {(assignment.submissionType === 'FILE' || assignment.submissionType === 'MIXED') && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>{t('assignment_detail.attachments')} ({assignment.allowedFileTypes})</Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<UploadIcon />}
                      sx={{ py: 2, borderStyle: 'dashed' }}
                    >
                      {selectedFile ? selectedFile.name : t('assignment_detail.choose_file')}
                      <input type="file" hidden onChange={handleFileChange} accept={assignment.allowedFileTypes} />
                    </Button>
                    {selectedFile && (
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        {t('assignment_detail.file_size')}: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    )}
                  </Box>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={submitting || (assignment.submissionType === 'FILE' && !selectedFile && !editingSubmission)}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                >
                  {submitting ? t('assignment_detail.submitting') : (editingSubmission ? t('assignment_detail.update_btn') : t('assignment_detail.submit_btn'))}
                </Button>
                {editingSubmission && (
                  <Button 
                    fullWidth 
                    sx={{ mt: 1 }} 
                    onClick={() => {
                      setEditingSubmission(null);
                      setSubmissionText('');
                      setSelectedFile(null);
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                )}
              </Box>
            </Paper>

            <Typography variant="h6" fontWeight="bold" gutterBottom>{t('assignment_detail.submission_history')}</Typography>
            {mySubmissions.map((sub, idx) => (
              <Paper key={sub.id} sx={{ p: 2, borderRadius: 2, mb: 2, borderLeft: '4px solid', borderColor: sub.gradeStatus === 'GRADED' ? 'success.main' : 'warning.main' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">{t('assignment_detail.attempt_no', { count: sub.attemptNumber })}</Typography>
                  <Typography variant="caption" color="textSecondary">{format(new Date(sub.submittedAt), 'HH:mm dd/MM/yyyy', { locale: currentLocale })}</Typography>
                </Box>
                {sub.isLate && <Chip label={t('assignment_detail.late')} color="error" size="small" sx={{ mb: 1 }} />}
                {sub.gradeStatus === 'GRADED' ? (
                  <Box sx={{ mt: 1, p: 1, bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 1 }}>
                    <Typography variant="subtitle2">{t('assignment_detail.score')}: {sub.score}/{assignment.maxScore}</Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>{t('assignment_detail.feedback')}: {sub.feedback}</Typography>
                  </Box>
                ) : (
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="textSecondary italic">{t('assignment_detail.awaiting_grade')}</Typography>
                      <Box>
                        <Button size="small" onClick={() => startEditSubmission(sub)}>{t('common.edit')}</Button>
                        <Button size="small" color="error" onClick={() => setConfirmCancel(sub.id)}>{t('common.delete')}</Button>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                    {sub.textContent && (
                      <Box 
                        sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: sub.fileUrl ? 1 : 0 }} 
                        dangerouslySetInnerHTML={{ __html: sub.textContent }} 
                      />
                    )}
                    {sub.fileUrl && (
                      <Button 
                        startIcon={<FileIcon />} 
                        size="small" 
                        component="a" 
                        href={sub.fileUrl} 
                        download={sub.fileName}
                        target="_blank"
                      >
                        {sub.fileName}
                      </Button>
                    )}
                  </Box>
              </Paper>
            ))}
          </Grid>
        )}
      </Grid>

      {/* Grading Dialog */}
      <Dialog open={!!gradingSubmission} onClose={() => setGradingSubmission(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>{t('assignment_detail.grading_title')}</DialogTitle>
        <DialogContent dividers>
          {gradingSubmission && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">{gradingSubmission.studentName}</Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>{t('assignment_detail.attempt_no', { count: gradingSubmission.attemptNumber })} | {gradingSubmission.isLate ? t('assignment_detail.late').toUpperCase() : t('assignment_detail.on_time')}</Typography>

              <Box sx={{ my: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>{t('assignment_detail.student_submission')}:</Typography>
                {gradingSubmission.textContent && (
                  <Box 
                    sx={{ mb: 2, color: 'text.primary' }} 
                    dangerouslySetInnerHTML={{ __html: gradingSubmission.textContent }} 
                  />
                )}
                {gradingSubmission.fileName && (
                  <Button 
                    startIcon={<FileIcon />} 
                    color="primary" 
                    component="a" 
                    href={gradingSubmission.fileUrl} 
                    download={gradingSubmission.fileName}
                    target="_blank"
                  >
                    {gradingSubmission.fileName}
                  </Button>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label={t('assignment_detail.score_label')}
                    type="number"
                    fullWidth
                    value={gradeData.score}
                    onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                    InputProps={{ endAdornment: <Typography variant="body2">/{assignment.maxScore}</Typography> }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('assignment_detail.feedback_label')}
                    fullWidth
                    multiline
                    rows={4}
                    value={gradeData.feedback}
                    onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setGradingSubmission(null)}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleGrade}
            disabled={grading}
            startIcon={grading && <CircularProgress size={20} />}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Deletion Dialog */}
      <Dialog open={!!confirmCancel} onClose={() => setConfirmCancel(null)}>
        <DialogTitle>{t('assignment_detail.cancel_dialog_title')}</DialogTitle>
        <DialogContent>
          <Typography>{t('assignment_detail.cancel_confirm_message')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCancel(null)}>{t('common.close')}</Button>
          <Button variant="contained" color="error" onClick={handleCancelSubmission}>{t('common.confirm')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignmentDetail;
