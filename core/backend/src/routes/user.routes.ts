import { Router, Request } from 'express';
import { authorize } from '../middleware/auth';
import { logger } from '../utils/logger';
import { User } from '../models/User';
import { redis } from '../config/database';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const router = Router();

// Benutzer auflisten (nur für Admins)
router.get('/', authorize('admin'), async (_req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ message: 'Interner Server-Fehler' });
  }
});

// Benutzer erstellen (nur für Admins)
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email || !role) {
      return res.status(400).json({ message: 'Alle Felder sind erforderlich' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Benutzer existiert bereits' });
    }

    const user = await User.create({ username, password, email, role });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ message: 'Interner Server-Fehler' });
  }
});

// Benutzer aktualisieren (Admin oder eigener Account)
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { username, role, email, password } = req.body;
    const requestingUser = req.user;

    if (!requestingUser) {
      return res.status(401).json({ message: 'Nicht authentifiziert' });
    }

    // Prüfe Berechtigungen
    if (requestingUser.role !== 'admin' && requestingUser.id !== id) {
      return res.status(403).json({
        message: 'Keine Berechtigung zum Aktualisieren dieses Benutzers',
      });
    }

    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (requestingUser.role === 'admin' && role) updateData.role = role;
    if (password) updateData.password = password;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    Object.assign(user, updateData);
    await user.save();

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ message: 'Interner Server-Fehler' });
  }
});

// Benutzer löschen (nur für Admins)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    await redis.del(`rt_${id}`);

    res.json({ message: `Benutzer ${id} erfolgreich gelöscht` });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ message: 'Interner Server-Fehler' });
  }
});

export default router; 