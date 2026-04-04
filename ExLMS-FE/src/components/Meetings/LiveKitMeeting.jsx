import React, { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  LayoutContextProvider,
  RoomAudioRenderer,
  ControlBar
} from '@livekit/components-react';
import '@livekit/components-styles';
import axios from 'axios';

import PremiumMeetingUI from './PremiumMeetingUI';

const LiveKitMeeting = ({ roomName, identity, name, role, onMeetingEnd }) => {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.post('http://localhost:4000/getToken', {
          roomName,
          identity,
          name,
          role
        });
        setToken(response.data.token);
      } catch (err) {
        console.error('Failed to fetch LiveKit token', err);
        setError('Không thể kết nối đến máy chủ cuộc họp. Vui lòng thử lại sau.');
      }
    };

    fetchToken();
  }, [roomName, identity, name, role]);

  if (error) {
    return (
      <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
        <p>{error}</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
        <p>Đang chuẩn bị kết nối cuộc họp...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl="ws://localhost:7800"
      onDisconnected={onMeetingEnd}
      data-lk-theme="default"
      style={{ height: '100%', width: '100%' }}
    >
      <PremiumMeetingUI />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
};

export default LiveKitMeeting;
