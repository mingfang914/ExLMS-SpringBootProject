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
      let finalSubmissionType = assignment.submissionType;
      
      if (assignment.submissionType === 'MIXED') {
        const hasText = submissionText && submissionText.trim() !== '';
        const hasNewFile = !!selectedFile;
        const hasExistingFile = editingSubmission && mySubmissions.find(s => s.id === editingSubmission)?.fileUrl;
        
        if (hasText && (hasNewFile || hasExistingFile)) {
          finalSubmissionType = 'MIXED';
        } else if (hasNewFile || hasExistingFile) {
          finalSubmissionType = 'FILE';
        } else {
          finalSubmissionType = 'TEXT';
        }
      }

      const formData = new FormData();
      formData.append('request', new Blob([JSON.stringify({
        submissionType: finalSubmissionType,
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
    // Validate score
    if (gradeData.score < 0 || gradeData.score > assignment.maxScore) {
      alert(t('assignment_detail.errors.invalid_score', { max: assignment.maxScore }));
      return;
    }

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
                            <>
                              <Tooltip title={t('assignment_detail.actions.preview_file')}>
                                <IconButton color="info" onClick={() => window.open(sub.fileUrl, '_blank')}>
                                  <DescriptionIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('assignment_detail.actions.download_file')}>
                                <IconButton color="secondary" component="a" href={sub.fileUrl} download>
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                            </>
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
              <form onSubmit={handleSubmission}>
                {(assignment.submissionType === 'TEXT' || assignment.submissionType === 'MIXED') && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{t('assignment_detail.text_submission')}</Typography>
                    <CKEditorWrapper 
                      data={submissionText} 
                      onChange={(data) => setSubmissionText(data)} 
                      placeholder={t('assignment_detail.text_placeholder')}
                    />
                  </Box>
                )}
                {(assignment.submissionType === 'FILE' || assignment.submissionType === 'MIXED') && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{t('assignment_detail.file_submission')}</Typography>
                    <input
                      type="file"
                      id="assignment-file"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <label htmlFor="assignment-file">
                      <Button
                        variant="outlined"
                        component="span"
                        fullWidth
                        startIcon={<UploadIcon />}
                        sx={{ py: 1.5, borderRadius: 2 }}
                      >
                        {selectedFile ? selectedFile.name : t('assignment_detail.choose_file')}
                      </Button>
                    </label>
                    {assignment.allowedFileTypes && (
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                        {t('assignment_detail.allowed_types')}: {assignment.allowedFileTypes}
                      </Typography>
                    )}
                  </Box>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submitting || (!submissionText && !selectedFile)}
                  sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                >
                  {submitting ? <CircularProgress size={24} /> : (editingSubmission ? t('common.save_changes') : t('assignment_detail.submit_btn'))}
                </Button>
                {editingSubmission && (
                  <Button
                    fullWidth
                    onClick={() => {
                      setEditingSubmission(null);
                      setSubmissionText('');
                      setSelectedFile(null);
                    }}
                    sx={{ mt: 1 }}
                  >
                    {t('common.cancel')}
                  </Button>
                )}
              </form>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>{t('assignment_detail.submission_history')}</Typography>
              {mySubmissions.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>{t('assignment_detail.no_submissions')}</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {mySubmissions.map((sub) => (
                    <Paper key={sub.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {t('assignment_detail.attempt_no', { count: sub.attemptNumber })}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {format(new Date(sub.submittedAt), 'HH:mm dd/MM/yyyy')}
                          </Typography>
                        </Box>
                        <Chip
                          label={sub.gradeStatus === 'GRADED' ? t('assignment_detail.graded') : t('assignment_detail.awaiting_grade')}
                          color={sub.gradeStatus === 'GRADED' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                      
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        {sub.fileUrl && (
                          <Button size="small" startIcon={<FileIcon />} component="a" href={sub.fileUrl} target="_blank">
                            {sub.fileName || t('assignment_detail.view_file')}
                          </Button>
                        )}
                        {sub.gradeStatus !== 'GRADED' && !submitting && (
                          <Box sx={{ ml: 'auto' }}>
                            <Tooltip title={t('common.edit')}>
                              <IconButton size="small" color="primary" onClick={() => startEditSubmission(sub)}>
                                <GradeIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('assignment_detail.actions.cancel_submission')}>
                              <IconButton size="small" color="error" onClick={() => setConfirmCancel(sub.id)}>
                                <ErrorIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </Box>
                      
                      {sub.gradeStatus === 'GRADED' && (
                        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: 1.5, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                            {t('assignment_detail.score')}: {sub.score}/{assignment.maxScore}
                          </Typography>
                          {sub.feedback && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              <strong>{t('assignment_detail.feedback')}:</strong> {sub.feedback}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Grading Dialog */}
      <Dialog open={Boolean(gradingSubmission)} onClose={() => setGradingSubmission(null)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {t('assignment_detail.dialog.grade_title')} - {gradingSubmission?.studentName}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Submission Preview */}
            <Grid item xs={12} md={7}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{t('assignment_detail.submission_content')}</Typography>
              
              {gradingSubmission?.textContent && (
                <Paper variant="outlined" sx={{ p: 2, mb: 3, maxHeight: 400, overflowY: 'auto', bgcolor: 'background.default' }}>
                  <div className="ck-content" dangerouslySetInnerHTML={{ __html: gradingSubmission.textContent }} />
                </Paper>
              )}

              {gradingSubmission?.fileUrl && (
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{t('assignment_detail.file_submission')}</Typography>
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2 }}>
                    <FileIcon color="primary" sx={{ fontSize: 32 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="bold">{gradingSubmission.fileName}</Typography>
                      <Typography variant="caption" color="textSecondary">{gradingSubmission.fileSize ? `${(gradingSubmission.fileSize / 1024).toFixed(1)} KB` : ''}</Typography>
                    </Box>
                    <Button variant="outlined" size="small" component="a" href={gradingSubmission.fileUrl} target="_blank">
                      {t('assignment_detail.actions.preview_file')}
                    </Button>
                    <Button variant="contained" size="small" component="a" href={gradingSubmission.fileUrl} download>
                      {t('assignment_detail.actions.download_file')}
                    </Button>
                  </Paper>
                  
                  {/* Embedded Preview for common file types (PDF, Images) */}
                  {gradingSubmission.fileName?.toLowerCase().match(/\.(pdf|jpg|jpeg|png|gif)$/) && (
                    <Box sx={{ mt: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                      {gradingSubmission.fileName.toLowerCase().endsWith('.pdf') ? (
                        <iframe src={`${gradingSubmission.fileUrl}#toolbar=0`} width="100%" height="500px" title="PDF Preview" />
                      ) : (
                        <img src={gradingSubmission.fileUrl} alt="Preview" style={{ width: '100%', display: 'block' }} />
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </Grid>

            {/* Grading Form */}
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label={t('assignment_detail.score')}
                  type="number"
                  fullWidth
                  inputProps={{ min: 0, max: assignment.maxScore }}
                  value={gradeData.score}
                  onChange={(e) => setGradeData({ ...gradeData, score: parseInt(e.target.value) || 0 })}
                  helperText={`${t('assignment_detail.max_possible')}: ${assignment.maxScore}`}
                />
                <TextField
                  label={t('assignment_detail.feedback')}
                  multiline
                  rows={6}
                  fullWidth
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  placeholder={t('assignment_detail.feedback_placeholder')}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setGradingSubmission(null)}>{t('common.cancel')}</Button>
          <Button 
            variant="contained" 
            onClick={handleGrade} 
            disabled={grading}
            sx={{ px: 4, borderRadius: 2, fontWeight: 'bold' }}
          >
            {grading ? <CircularProgress size={24} /> : t('assignment_detail.actions.submit_grade')}
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
