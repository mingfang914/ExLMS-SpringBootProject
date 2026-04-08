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
  Globe, Layout, Trash2, Edit3, CheckCircle
} from 'lucide-react';
import collabService from '../../services/collabService';
import CollabEditor from '../../components/Collab/CollabEditor';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const GroupCollab = () => {
  const { groupId } = useParams();
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
    endAt: ''
  });

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
  }, [groupId]);

  const handleCreate = async () => {
    try {
      await collabService.createCollab(groupId, formData);
      setOpenDialog(false);
      setFormData({ title: '', description: '', startAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"), endAt: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {activeCollab ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
                variant="outlined" 
                startIcon={<ArrowLeft size={18} />} 
                onClick={() => setActiveCollab(null)}
            >
              Quay lại danh sách
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
                    p: 3, 
                    borderRadius: 4, 
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                    }
                  }}
                  onClick={() => setActiveCollab(c)}
                >
                  <Box className="card-status-indicator" sx={{ bgcolor: getStatusColor(c.status) + '.main' }} />
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" fontWeight="bold">{c.title}</Typography>
                        <Chip size="small" label={c.status} color={getStatusColor(c.status)} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" className="text-truncate-2">
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

      {/* Create Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo phiên Collaboration mới</DialogTitle>
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
              InputLabelProps={{ shrink: true }}
              value={formData.startAt}
              onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
            />
            <TextField
              label="Thời gian kết thúc (Tùy chọn)"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.endAt}
              onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!formData.title}>Tạo</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GroupCollab;
