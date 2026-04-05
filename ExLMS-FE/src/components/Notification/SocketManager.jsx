import React, { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification, setNotifications } from '../../store/notificationSlice';
import notificationService from '../../services/notificationService';
import { Box, Typography, Avatar, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SockJS from 'sockjs-client';
import { 
  Notifications as BellIcon, 
  Close as CloseIcon 
} from '@mui/icons-material';

const SocketManager = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const stompClientRef = useRef(null);
    const [activeToast, setActiveToast] = useState(null);

    // 1. Fetch initial notifications
    useEffect(() => {
        if (isAuthenticated) {
            notificationService.getNotifications()
                .then(data => dispatch(setNotifications(data)))
                .catch(err => console.error("Error fetching notifications:", err));
        }
    }, [isAuthenticated, dispatch]);

    // 2. Connect to WebSocket
    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
            return;
        }

        const token = localStorage.getItem('token');
        const client = new Client({
            webSocketFactory: () => new SockJS('/api/ws'),
            connectHeaders: {
                'Authorization': `Bearer ${token}`
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: (frame) => {
                // Canonical user destination (automatically mapped to Principal.getName())
                client.subscribe('/user/queue/notifications', (message) => {
                    const notification = JSON.parse(message.body);
                    dispatch(addNotification(notification));
                    showToast(notification);
                });
            },
            onStompError: (frame) => {
                console.error('STOMP Error:', frame.headers['message']);
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [isAuthenticated, user?.id, dispatch]);

    const showToast = (notif) => {
        setActiveToast(notif);
        setTimeout(() => {
            setActiveToast(null);
        }, 5000);
    };

    return (
        <AnimatePresence>
            {activeToast && (
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 50, x: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                    sx={{
                        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                        minWidth: 320, maxWidth: 400, bgcolor: 'rgba(23, 23, 23, 0.95)',
                        backdropFilter: 'blur(10px)', borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)', p: 2,
                        display: 'flex', gap: 2, cursor: 'pointer', overflow: 'hidden',
                        '&::before': {
                            content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                            background: 'linear-gradient(90deg, #6366F1, #22D3EE)'
                        }
                    }}
                    onClick={() => setActiveToast(null)}
                >
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(99,102,241,0.15)', color: '#818CF8' }}>
                        <BellIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>
                            {activeToast.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
                            {activeToast.body}
                        </Typography>
                    </Box>
                    <IconButton size="small" sx={{ alignSelf: 'flex-start', color: 'rgba(255,255,255,0.4)' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}
        </AnimatePresence>
    );
};

export default SocketManager;
