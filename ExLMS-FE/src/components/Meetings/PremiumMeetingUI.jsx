import React, { useMemo } from 'react';
import {
  useTracks,
  useParticipants,
  TrackRefContext,
  VideoTrack,
  useParticipantInfo,
  useRoomContext,
  useLocalParticipant,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Box, Typography, IconButton, Avatar, Tooltip, Badge } from '@mui/material';
import {
  Mic, MicOff, Videocam, VideocamOff, ScreenShare, StopScreenShare,
  CallEnd, MoreVert, GridView, Person, PanTool
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ParticipantTile = ({ trackRef }) => {
  const { identity, name, isSpeaking } = useParticipantInfo({ participant: trackRef.participant });
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        border: isSpeaking ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: isSpeaking ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      <VideoTrack trackRef={trackRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      
      {/* Overlay Info */}
      <Box sx={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        padding: '4px 12px',
        borderRadius: '8px',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
          {name || identity}
        </Typography>
        {isSpeaking && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6366f1', animation: 'pulse 1s infinite' }} />}
      </Box>

      {/* Mic Status */}
      {!trackRef.participant.isMicrophoneEnabled && (
        <Box sx={{ position: 'absolute', top: 12, right: 12, p: 0.5, borderRadius: '50%', bgcolor: 'rgba(239, 68, 68, 0.8)', color: 'white' }}>
          <MicOff sx={{ fontSize: 16 }} />
        </Box>
      )}
    </motion.div>
  );
};

const CustomControlBar = () => {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();

  const toggleMic = () => localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
  const toggleCam = () => localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled);
  const toggleScreen = () => localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled);

  return (
    <Box sx={{
      position: 'absolute',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      padding: '12px 24px',
      borderRadius: '24px',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.1)',
      zIndex: 10
    }}>
      <Tooltip title={localParticipant.isMicrophoneEnabled ? "Tắt Mic" : "Bật Mic"}>
        <IconButton 
          onClick={toggleMic}
          sx={{ 
            bgcolor: localParticipant.isMicrophoneEnabled ? 'rgba(255,255,255,0.1)' : '#ef4444',
            color: 'white',
            '&:hover': { bgcolor: localParticipant.isMicrophoneEnabled ? 'rgba(255,255,255,0.2)' : '#dc2626' }
          }}
        >
          {localParticipant.isMicrophoneEnabled ? <Mic /> : <MicOff />}
        </IconButton>
      </Tooltip>

      <Tooltip title={localParticipant.isCameraEnabled ? "Tắt Camera" : "Bật Camera"}>
        <IconButton 
          onClick={toggleCam}
          sx={{ 
            bgcolor: localParticipant.isCameraEnabled ? 'rgba(255,255,255,0.1)' : '#ef4444',
            color: 'white',
            '&:hover': { bgcolor: localParticipant.isCameraEnabled ? 'rgba(255,255,255,0.2)' : '#dc2626' }
          }}
        >
          {localParticipant.isCameraEnabled ? <Videocam /> : <VideocamOff />}
        </IconButton>
      </Tooltip>

      <Tooltip title="Chia sẻ màn hình">
        <IconButton 
          onClick={toggleScreen}
          sx={{ 
            bgcolor: localParticipant.isScreenShareEnabled ? '#6366f1' : 'rgba(255,255,255,0.1)',
            color: 'white',
            '&:hover': { bgcolor: localParticipant.isScreenShareEnabled ? '#4f46e5' : 'rgba(255,255,255,0.2)' }
          }}
        >
          {localParticipant.isScreenShareEnabled ? <StopScreenShare /> : <ScreenShare />}
        </IconButton>
      </Tooltip>

      <Box sx={{ width: 1, height: 24, bgcolor: 'rgba(255,255,255,0.1)', mx: 1 }} />

      <Tooltip title="Rời khỏi phòng">
        <IconButton 
          onClick={() => room.disconnect()}
          sx={{ 
            bgcolor: '#ef4444',
            color: 'white',
            '&:hover': { bgcolor: '#dc2626' }
          }}
        >
          <CallEnd />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const GridContainer = ({ tracks, screenShareTrack }) => {
  if (screenShareTrack) {
    return (
      <Box sx={{ display: 'flex', width: '100%', height: '100%', gap: 2 }}>
        {/* Large Screen Share */}
        <Box sx={{ flexGrow: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <VideoTrack trackRef={screenShareTrack} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </Box>
        {/* Small Sidebar for Participants */}
        <Box sx={{ width: 240, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {tracks.map(t => (
            <Box key={t.participant.sid} sx={{ height: 160, flexShrink: 0 }}>
              <ParticipantTile trackRef={t} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // Gallery View
  const gridTemplate = useMemo(() => {
    const count = tracks.length;
    if (count <= 1) return '1fr';
    if (count <= 2) return '1fr 1fr';
    if (count <= 4) return '1fr 1fr';
    return 'repeat(auto-fit, minmax(300px, 1fr))';
  }, [tracks.length]);

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: gridTemplate,
      gridTemplateRows: tracks.length > 2 ? '1fr 1fr' : '1fr',
      gap: 2, 
      width: '100%', 
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <AnimatePresence>
        {tracks.map(t => (
          <ParticipantTile key={t.participant.sid} trackRef={t} />
        ))}
      </AnimatePresence>
    </Box>
  );
};

const PremiumMeetingUI = () => {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ], { onlySubscribed: false });

  // Separate screen shares from camera tracks
  const screenShareTrack = tracks.find(t => t.source === Track.Source.ScreenShare);
  const cameraTracks = tracks.filter(t => t.source === Track.Source.Camera);

  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%', 
      bgcolor: '#0f172a', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, padding: 2, display: 'flex' }}>
         <GridContainer tracks={cameraTracks} screenShareTrack={screenShareTrack} />
      </Box>

      {/* Controls */}
      <CustomControlBar />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}} />
    </Box>
  );
};

export default PremiumMeetingUI;
