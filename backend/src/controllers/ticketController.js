import { Op, fn, col, literal } from 'sequelize';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { classifyTicket } from '../utils/gemini.js';
import { DEFAULT_CATEGORY, DEFAULT_PRIORITY, DEFAULT_STATUS } from '../config/constants.js';

// POST /api/tickets/classify
export const classify = async (req, res, next) => {
  try {
    const { description } = req.body;
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ error: 'Description must be at least 10 characters' });
    }
    const result = await classifyTicket(description.trim());
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets/stats
export const getStats = async (req, res, next) => {
  try {
    const [total, open, byPriority, byCategory, firstTicket] = await Promise.all([
      Ticket.count(),
      Ticket.count({ where: { status: 'open' } }),
      Ticket.findAll({
        attributes: ['priority', [fn('COUNT', col('id')), 'count']],
        group: ['priority'],
        raw: true,
      }),
      Ticket.findAll({
        attributes: ['category', [fn('COUNT', col('id')), 'count']],
        group: ['category'],
        raw: true,
      }),
      Ticket.findOne({ order: [['createdAt', 'ASC']], attributes: ['createdAt'] }),
    ]);

    const priority_breakdown = { low: 0, medium: 0, high: 0, critical: 0 };
    byPriority.forEach((r) => (priority_breakdown[r.priority] = parseInt(r.count)));

    const category_breakdown = { billing: 0, technical: 0, account: 0, general: 0 };
    byCategory.forEach((r) => (category_breakdown[r.category] = parseInt(r.count)));

    let avg_tickets_per_day = 0;
    if (firstTicket && total > 0) {
      const days = Math.max(
        1,
        Math.ceil((Date.now() - new Date(firstTicket.createdAt)) / (1000 * 60 * 60 * 24))
      );
      avg_tickets_per_day = Math.round((total / days) * 10) / 10;
    }

    res.json({ total_tickets: total, open_tickets: open, avg_tickets_per_day, priority_breakdown, category_breakdown });
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets
export const getTickets = async (req, res, next) => {
  try {
    const { category, priority, status, search } = req.query;
    const where = {};

    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const tickets = await Ticket.findAll({
      where,
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'email'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json(tickets);
  } catch (err) {
    next(err);
  }
};

// POST /api/tickets
export const createTicket = async (req, res, next) => {
  try {
    const { title, description, category, priority, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }

    const ticket = await Ticket.create({
      title: title.slice(0, 200),
      description,
      category: category || DEFAULT_CATEGORY,
      priority: priority || DEFAULT_PRIORITY,
      status: status || DEFAULT_STATUS,
      userId: req.user?.id || null,
    });

    const fullTicket = await Ticket.findByPk(ticket.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'email'] }],
    });

    res.status(201).json(fullTicket);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tickets/:id
export const updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const allowed = ['title', 'description', 'category', 'priority', 'status'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    await ticket.update(updates);

    const updated = await Ticket.findByPk(ticket.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'email'] }],
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tickets/:id (bonus)
export const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    await ticket.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
