import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { generateToken, blacklistToken } from '../middleware/auth';
import { redis } from '../config/database';
import { logger } from '../utils/logger';
import { User } from '../models/User';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateToken({ id: user.id, role: user.role, type: 'refresh' });

    await redis.set(`rt_${user.id}`, refreshToken, 'EX', 60 * 60 * 24 * 7);

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Interner Server-Fehler' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh-Token fehlt' });
    }

    let payload: any;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key');
    } catch {
      return res.status(401).json({ message: 'Ungültiger Refresh-Token' });
    }

    if (payload.type !== 'refresh') {
      return res.status(401).json({ message: 'Ungültiger Refresh-Token' });
    }

    const storedToken = await redis.get(`rt_${payload.id}`);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({ message: 'Ungültiger Refresh-Token' });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'Benutzer nicht gefunden' });
    }

    const newToken = generateToken({ id: user.id, role: user.role });
    res.json({ token: newToken });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({ message: 'Interner Server-Fehler' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await blacklistToken(token);
    }
    res.json({ message: 'Erfolgreich ausgeloggt' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ message: 'Interner Server-Fehler' });
  }
});

export default router; 