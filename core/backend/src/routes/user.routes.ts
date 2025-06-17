import { Router } from 'express';
import { authorize } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Benutzer auflisten (nur für Admins)
router.get('/', authorize('admin'), async (req, res) => {
  try {
    // TODO: Implementiere Benutzerabfrage aus der Datenbank
    const users = [
      { id: '1', username: 'admin', role: 'admin' },
      { id: '2', username: 'user', role: 'user' },
    ];
    res.json(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ message: 'Interner Server-Fehler' });
  }
});

// Benutzer erstellen (nur für Admins)
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // TODO: Implementiere Benutzervalidierung und -erstellung
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Alle Felder sind erforderlich' });
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      role,
    };

    res.status(201).json(newUser);
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ message: 'Interner Server-Fehler' });
  }
});

// Benutzer aktualisieren (Admin oder eigener Account)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, role } = req.body;
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

    // TODO: Implementiere Benutzeraktualisierung
    const updatedUser = {
      id,
      username,
      role: requestingUser.role === 'admin' ? role : 'user',
    };

    res.json(updatedUser);
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ message: 'Interner Server-Fehler' });
  }
});

// Benutzer löschen (nur für Admins)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Implementiere Benutzerlöschung
    res.json({ message: `Benutzer ${id} erfolgreich gelöscht` });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ message: 'Interner Server-Fehler' });
  }
});

export default router; 