import React, { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification, setNotifications } from '../../store/notificationSlice';
import notificationService from '../../services/notificationService';
import { Box, Typography, Avatar, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

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
            debug: (str) => {
                // console.log('STOMP Notification:', str);
            },
            onConnect: (frame) => {
                // console.log('STOMP Connected for Notifications');
                // canonical /user/queue/notifications will be mapped by Spring to session-specific queue
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
        // Tự động đóng toast sau 5 giây
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
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 9999,
                        minWidth: 320,
                        maxWidth: 400,
                        bgcolor: 'var(--color-surface)',
                        borderRadius: '12px',
                        border: '1px solid var(--color-border)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        p: 2,
                        display: 'flex',
                        gap: 2,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0, left: 0, right: 0, height: '3px',
                            background: 'linear-gradient(90deg, #6366F1, #22D3EE)'
                        }
                    }}
                    onClick={() => setActiveToast(null)}
                >
                    <Avatar
                        sx={{
                            width: 40, height: 40,
                            bgcolor: 'rgba(99,102,241,0.15)',
                            color: 'var(--color-primary-lt)',
                            borderRadius: '10px'
                        }}
                    >
                        <BellIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)', mb: 0.5 }}>
                            {activeToast.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8125rem', color: 'var(--color-text-sec)', lineHeight: 1.4 }}>
                            {activeToast.body}
                        </Typography>
                    </Box>
                    <IconButton size="small" sx={{ alignSelf: 'flex-start', ml: 1, opacity: 0.6 }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            )}
        </AnimatePresence>
    );
};

const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
);

const CloseIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

import SockJS from 'sockjs-client';
export default SocketManager;
