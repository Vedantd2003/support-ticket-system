import request from 'supertest';
import express from 'express';
import Sequelize from 'sequelize';
import bodyParser from 'body-parser';
import { createTicket, getTickets, updateTicket, deleteTicket, getStats, classify } from '../controllers/ticketController.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { connectDB } from '../config/database.js';
import sequelize from '../config/database.js';

// Mock Auth Middleware
const mockAuth = (req, res, next) => {
    req.user = { id: 1, role: 'user' };
    next();
};

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
    req.user = { id: 1 }; // Simulate logged in user
    next();
});

// Setup routes for testing
app.post('/api/tickets', createTicket);
app.get('/api/tickets', getTickets);
app.patch('/api/tickets/:id', updateTicket);
app.delete('/api/tickets/:id', deleteTicket);
app.get('/api/tickets/stats', getStats);
app.post('/api/tickets/classify', classify);

// Mock Sequelize
jest.mock('../models/Ticket.js');
jest.mock('../models/User.js');
jest.mock('../utils/gemini.js');

describe('Ticket Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new ticket', async () => {
        const ticketData = {
            title: 'Test Ticket',
            description: 'Test Description',
            category: 'general',
            priority: 'medium',
            status: 'open'
        };

        Ticket.create.mockResolvedValue({
            id: 1,
            ...ticketData,
            userId: 1
        });

        Ticket.findByPk.mockResolvedValue({
            id: 1,
            ...ticketData,
            userId: 1,
            author: { id: 1, username: 'testuser', email: 'test@example.com' }
        });

        const res = await request(app)
            .post('/api/tickets')
            .send(ticketData);

        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toEqual('Test Ticket');
    });

    it('should get all tickets', async () => {
        Ticket.findAll.mockResolvedValue([
            { id: 1, title: 'Ticket 1' },
            { id: 2, title: 'Ticket 2' }
        ]);

        const res = await request(app).get('/api/tickets');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toEqual(2);
    });
});
