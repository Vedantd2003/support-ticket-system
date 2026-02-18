import { Router } from 'express';
import {
  classify,
  getStats,
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from '../controllers/ticketController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();

// LLM + stats — order matters (before /:id)
router.post('/classify', classify);
router.get('/stats', getStats);

// CRUD
router.get('/', getTickets);
router.post('/', optionalAuth, createTicket);
router.patch('/:id', optionalAuth, updateTicket);
router.delete('/:id', protect, deleteTicket);

export default router;
