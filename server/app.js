const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const skillRoutes = require('./routes/skills');
const sessionRoutes = require('./routes/sessions');
const lessonRoutes = require('./routes/lessons');
const reviewRoutes = require('./routes/reviews');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const topicRoutes = require('./routes/topics');
const commentRoutes = require('./routes/comments');
const aiRoutes = require('./routes/ai');
const complaintRoutes = require('./routes/complaints');
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const notificationRoutes = require('./routes/notifications');

const quizRoutes = require('./routes/quizzes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);

// Store io instance for controllers
app.set('io', io);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // User comes online
  socket.on('user_online', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(`user_${userId}`); // Join private notification room
    io.emit('online_users', Array.from(onlineUsers.keys()));
    console.log(`👤 User ${userId} is online`);
  });

  // Join a chat room
  socket.on('join_chat', ({ userId, otherUserId }) => {
    const roomId = [userId, otherUserId].sort().join('_');
    socket.join(roomId);
    console.log(`💬 User ${userId} joined room ${roomId}`);
  });

  // Send message via socket
  socket.on('send_message', (message) => {
    const roomId = [message.sender_id, message.receiver_id].sort().join('_');
    socket.to(roomId).emit('receive_message', message);
    
    // Also notify the receiver if they're online
    const receiverSocket = onlineUsers.get(message.receiver_id.toString());
    if (receiverSocket) {
      io.to(receiverSocket).emit('new_message_notification', {
        sender_id: message.sender_id,
        sender_name: message.sender_name,
        body: message.body
      });
    }
  });

  // React to message via socket
  socket.on('react_message', ({ messageId, userId, otherUserId, emoji, action }) => {
    const roomId = [userId, otherUserId].sort().join('_');
    io.to(roomId).emit('message_reacted', { messageId, userId, emoji, action });
  });

  // Delete message via socket
  socket.on('delete_message', ({ messageId, userId, otherUserId }) => {
    const roomId = [userId, otherUserId].sort().join('_');
    io.to(roomId).emit('message_deleted', { messageId });
  });

  // Typing indicator
  socket.on('typing', ({ userId, otherUserId }) => {
    const roomId = [userId, otherUserId].sort().join('_');
    socket.to(roomId).emit('user_typing', userId);
  });

  socket.on('stop_typing', ({ userId, otherUserId }) => {
    const roomId = [userId, otherUserId].sort().join('_');
    socket.to(roomId).emit('user_stop_typing', userId);
  });

  // Message read via socket
  socket.on('read_messages', ({ userId, otherUserId }) => {
    const roomId = [userId, otherUserId].sort().join('_');
    socket.to(roomId).emit('messages_read', { readerId: userId });
  });

  // Disconnect
  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('online_users', Array.from(onlineUsers.keys()));
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
// Bind to 0.0.0.0 so the server is reachable on the LAN (not only localhost)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Campus Skill Exchange API running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io listening for connections`);
  console.log(`📋 API Endpoints:`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/skills`);
  console.log(`   GET  /api/sessions/my`);
  console.log(`   GET  /api/lessons`);
  console.log(`   GET  /api/users/leaderboard`);
  console.log(`   GET  /api/messages/conversations`);
  console.log(`   GET  /api/admin/stats\n`);
});
