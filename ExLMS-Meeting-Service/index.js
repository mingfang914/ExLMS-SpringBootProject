const express = require('express');
const cors = require('cors');
const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';
const LIVEKIT_HOST = process.env.LIVEKIT_URL || 'http://localhost:7800';

const svc = new RoomServiceClient(LIVEKIT_HOST, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

// Endpoint to generate Join Tokens
app.post('/getToken', async (req, res) => {
  const { roomName, identity, name, role } = req.body;

  if (!roomName || !identity) {
    return res.status(400).json({ error: 'roomName and identity are required' });
  }

  try {
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      name: name || identity,
    });

    // Grant permissions based on role
    const isInstructor = role === 'OWNER' || role === 'EDITOR' || role === 'ADMIN';
    
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: isInstructor, // Only instructors can moderate/kick
      canUpdateOwnMetadata: true
    });

    const token = await at.toJwt();
    res.json({ token });
  } catch (err) {
    console.error('Error generating token:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'up', service: 'lms-meeting-service' });
});

// API for Spring Boot: List active rooms
app.get('/rooms', async (req, res) => {
  try {
    const rooms = await svc.listRooms();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API for Spring Boot: End a meeting (Delete room)
app.delete('/rooms/:roomName', async (req, res) => {
  try {
    await svc.deleteRoom(req.params.roomName);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API for Spring Boot: Get participants in a room
app.get('/rooms/:roomName/participants', async (req, res) => {
  try {
    const participants = await svc.listParticipants(req.params.roomName);
    res.json(participants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Meeting Microservice running on port ${PORT}`);
});
