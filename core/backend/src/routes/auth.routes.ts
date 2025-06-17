import { Router } from 'express';
import { generateToken, blacklistToken } from '../middleware/auth';
import { redis } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // TODO: Implementiere tatsächliche Benutzerauthentifizierung
    // Dies ist nur ein Beispiel
    if (username === 'admin' && password === 'admin') {
      const user = {
        id: '1',
        role: 'admin',
      };

      const token = generateToken(user);
      const refreshToken = generateToken({ ...user, type: 'refresh' });

      // Speichere Refresh-Token
      await redis.set(`rt_${user.id}`, refreshToken, 'EX', 60 * 60 * 24 * 7); // 7 Tage

      res.json({
        token,
        refreshToken,
        user: {
          id: user.id,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Interner Server-Fehler' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // TODO: Implementiere Refresh-Token-Validierung
    // Dies ist nur ein Beispiel
    const user = {
      id: '1',
      role: 'admin',
    };

    const storedToken = await redis.get(`rt_${user.id}`);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({ message: 'Ungültiger Refresh-Token' });
    }

    const newToken = generateToken(user);
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