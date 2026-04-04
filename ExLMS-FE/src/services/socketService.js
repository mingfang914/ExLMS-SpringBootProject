import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import store from '../store'
import { addNotification } from '../store/notificationSlice'

let stompClient = null;

export const initSocket = () => {
  if (stompClient) return stompClient;

  const token = localStorage.getItem('token');
  if (!token) return null;

  const socketUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/ws` : 'http://localhost:8081/api/ws';

  stompClient = new Client({
    webSocketFactory: () => new SockJS(socketUrl),
    connectHeaders: {
      Authorization: `Bearer ${token}`
    },
    reconnectDelay: 5000,
    onConnect: (frame) => {
      console.log('Connected to Stomp: ' + frame);
      
      stompClient.subscribe('/user/queue/notifications', (message) => {
         if (message.body) {
            try {
                const notification = JSON.parse(message.body);
                store.dispatch(addNotification(notification));
            } catch(e) {
                console.error("Error parsing notification msg", e)
            }
         }
      });
      
      stompClient.subscribe('/user/queue/calendar', (message) => {
         console.log('Calendar UPDATE', message.body);
      });
    },
    onStompError: (error) => {
      console.error('STOMP Error:', error);
    }
  });

  stompClient.activate();
  return stompClient;
}

export const disconnectSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
}

export const getSocket = () => stompClient;
