import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, Container, Typography, Paper, Grid,
  Button, Chip, Divider, IconButton, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Stack
} from '@mui/material';
import {
  ArrowLeft, Plus, Calendar, Clock, Lock,
  Globe, Layout, Trash2, Edit3, CheckCircle, MoreVertical
} from 'lucide-react';
import collabService from '../../services/collabService';
import CollabEditor from '../../components/Collab/CollabEditor';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const GroupCollab = ({ groupId: propGroupId }) => {
  const { groupId: paramsGroupId, collabId } = useParams();
  const groupId = propGroupId || paramsGroupId;
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [collabs, setCollabs] = useState([]);
  const [activeCollab, setActiveCollab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endAt: '',
    status: 'DRAFT'
  });
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await collabService.getGroupCollabs(groupId);
      setCollabs(data);
    } catch (err) {
      console.error('Error fetching collabs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup STOMP for realtime status updates
    const sock = new SockJS('/api/ws');
    const client = new Client({
      webSocketFactory: () => sock,
      onConnect: () => {
        client.subscribe('/topic/resource-status', (msg) => {
          const payload = JSON.parse(msg.body);
          if (payload.type === 'STATUS_CHANGED' && payload.data.type === 'COLLAB') {
            setCollabs(current => current.map(c =>
              c.id === payload.data.id ? { ...c, status: payload.data.status } : c
            ));
            setActiveCollab(current => {
              if (current && current.id === payload.data.id) {
                return { ...current, status: payload.data.status };
              }
              return current;
            });
          }
        });
      }
    });
    client.activate();

    return () => client.deactivate();
  }, [groupId]);

  // Handle URL changes
  useEffect(() => {
    if (collabId && collabs.length > 0) {
      const active = collabs.find(c => c.id === collabId);
      if (active) setActiveCollab(active);
    } else if (!collabId) {
      setActiveCollab(null);
    }
  }, [collabId, collabs]);

  const handleCreateOrUpdate = async () => {
    try {
      if (editingId) {
        await collabService.updateCollab(editingId, formData);
      } else {
        await collabService.createCollab(groupId, formData);
      }
      setOpenDialog(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endAt: '',
      status: 'DRAFT'
    });
    setEditingId(null);
  };

  const handleEdit = (collab, e) => {
    e.stopPropagation();
    setEditingId(collab.id);
    setFormData({
      title: collab.title,
      description: collab.description,
      startAt: format(new Date(collab.startAt), "yyyy-MM-dd'T'HH:mm"),
      endAt: collab.endAt ? format(new Date(collab.endAt), "yyyy-MM-dd'T'HH:mm") : '',
      status: collab.status
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa phiên làm việc này?')) {
      try {
        await collabService.deleteCollab(id);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Không thể xóa phiên làm việc');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'PUBLISHED': return 'success';
      case 'CLOSED': return 'error';
      default: return 'default';
    }
  };

  if (loading && !activeCollab) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {activeCollab ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={18} />}
              onClick={() => navigate(`/groups/${groupId}?tab=5`)}
            >
              Quay lại nhóm
            </Button>
            <Box>
              <Typography variant="h4">{activeCollab.title}</Typography>
              <Typography variant="body2" color="text.secondary">{activeCollab.description}</Typography>
            </Box>
            <Chip
              label={activeCollab.status}
              color={getStatusColor(activeCollab.status)}
              variant="outlined"
              sx={{ ml: 'auto' }}
            />
          </Box>

          <Box sx={{ height: 'calc(100vh - 250px)' }}>
            <CollabEditor
              collabId={activeCollab.id}
              user={user}
              providerUrl={import.meta.env.VITE_COLLAB_SERVICE_URL || 'ws://localhost:1234'}
              isReadOnly={activeCollab.status === 'CLOSED'}
            />
          </Box>
        </motion.div>
      ) : (
        <>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">Collaboration Spaces</Typography>
              <Typography variant="body1" color="text.secondary">Cùng nhau soạn thảo và chia sẻ ý tưởng thời gian thực</Typography>
            </Box>
            {user.role !== 'STUDENT' && (
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={() => setOpenDialog(true)}
              >
                Tạo phiên Collab mới
              </Button>
            )}
          </Box>

          <Grid container spacing={3}>
            {collabs.map((c) => (
              <Grid item xs={12} md={6} lg={4} key={c.id}>
                <Paper
                  elevation={0}
                  className="premium-card"
                  sx={{
                    p: 0,
                    borderRadius: 4,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.05)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      borderColor: 'primary.main'
                    }
                  }}
                  onClick={() => navigate(`/groups/${groupId}/collabs/${c.id}`)}
                >
                  <Box className="card-status-indicator" sx={{ bgcolor: getStatusColor(c.status) + '.main' }} />
                  <Box sx={{
                    height: 120,
                    backgroundImage: `url(${c.coverImageUrl || '/api/files/download/Assets/CollabDefaultCover.png'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }} />
                  <Stack spacing={2} sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" fontWeight="bold">{c.title}</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        <Chip size="small" label={c.status} color={getStatusColor(c.status)} />
                        {user.role !== 'STUDENT' && (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {c.status !== 'CLOSED' && (
                              <IconButton size="small" onClick={(e) => handleEdit(c, e)} sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
                                <Edit3 size={14} />
                              </IconButton>
                            )}
                            <IconButton size="small" onClick={(e) => handleDelete(c.id, e)} sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                              <Trash2 size={14} />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" className="text-truncate-2" sx={{ minHeight: 40 }}>
                      {c.description || 'Không có mô tả'}
                    </Typography>

                    <Divider />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <Calendar size={16} />
                      <Typography variant="caption">
                        Bắt đầu: {format(new Date(c.startAt), 'dd/MM/yyyy HH:mm')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <Clock size={16} />
                      <Typography variant="caption">
                        {c.endAt ? `Kết thúc: ${format(new Date(c.endAt), 'dd/MM/yyyy HH:mm')}` : 'Không hạn thời gian'}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
            {collabs.length === 0 && (
              <Box sx={{ textAlign: 'center', width: '100%', py: 10 }}>
                <Layout size={60} strokeWidth={1} style={{ opacity: 0.3, marginBottom: 16 }} />
                <Typography color="text.secondary">Chưa có phiên làm việc nhóm nào được tạo</Typography>
              </Box>
            )}
          </Grid>
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Chỉnh sửa phiên làm việc' : 'Tạo phiên Collaboration mới'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Tiêu đề"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              label="Thời gian bắt đầu"
              type="datetime-local"
              fullWidth
              disabled={!!editingId}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: format(new Date(), "yyyy-MM-dd'T'HH:mm")
              }}
              value={formData.startAt}
              onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
            />
            <TextField
              label="Thời gian kết thúc (Tùy chọn)"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: formData.startAt || format(new Date(), "yyyy-MM-dd'T'HH:mm")
              }}
              value={formData.endAt}
              onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
            />

            <TextField
              select
              label="Trạng thái"
              fullWidth
              SelectProps={{ native: true }}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setOpenDialog(false); resetForm(); }}>Hủy</Button>
          <Button variant="contained" onClick={handleCreateOrUpdate} disabled={!formData.title}>
            {editingId ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupCollab;
