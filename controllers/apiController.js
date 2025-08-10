import mongoose from 'mongoose';
import movieSchema from '../models/MovieModel.js';
import userSchema from '../models/UserModel.js';
import Chat from '../models/ChatModel.js';
import Message from '../models/MessageModel.js';
import ClientSchema from '../models/ClientModel.js';

class DataController {
    constructor() {
        this.login = this.login.bind(this);
        this.insertUserIfNotExists = this.insertUserIfNotExists.bind(this);
    }
    async login(req, res) {
        const { email, password } = req.body;
        const url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCNGkGWhHJU8vSBEY37RYnDxTTQAC4sk-k";
        const payload = {
            email,
            password,
            returnSecureToken: true
        };
        try {
            const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) {
                return res.status(400).json(data);
            }
            if (response.status == 200) {
                let query = { email: data?.email };
                await ClientSchema.find(query).then(async (existingClient) => {
                    if (existingClient.length > 0) {
                        existingClient = existingClient[0];
                        const client = ClientSchema({
                            username: existingClient.username,
                            userId: existingClient.userId,
                            displayName: existingClient.displayName,
                            email: existingClient.email,
                            avatar: existingClient.avatar
                        });
                        return res.status(200).json(client);
                    } else {
                        return res.status(202).json({ message: "Client not found" });
                    }
                });
            }
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: err.toString() });
        }
    };

    async insertUserIfNotExists(userId, email) {
        try {
            let user = await userSchema.findOne({ email });            
            if (!user) {
                user = new userSchema({ userId, email });
                user = await user.save();
            }else{
                return { status: 200, message: "User already exists" };
            }
            return user;
        } catch (error) {
            console.error('Error inserting user:', error);
            throw error;
        }
    }

    async getClients(req, res) {
        try {
        const {
            page = '1',
            limit = '10',
            q,
            username,
            displayName,
            email,
            createdAfter,
            createdBefore,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

        const query = {};

        // Field-specific filters (case-insensitive)
        if (username) query.username = new RegExp(username, 'i');
        if (displayName) query.displayName = new RegExp(displayName, 'i');
        if (email) query.email = new RegExp(email, 'i');

        // CreatedAt range filters
        if (createdAfter || createdBefore) {
            const range = {};
            if (createdAfter) {
            const d = new Date(createdAfter);
            if (!Number.isNaN(d.getTime())) range.$gte = d;
            }
            if (createdBefore) {
            const d = new Date(createdBefore);
            if (!Number.isNaN(d.getTime())) range.$lte = d;
            }
            if (Object.keys(range).length) query.createdAt = range;
        }

        // Generic search across multiple fields
        if (q) {
            const regex = new RegExp(q, 'i');
            query.$or = [
            { username: regex },
            { displayName: regex },
            { email: regex },
            ];
        }

        // Sorting
        const allowedSort = new Set(['createdAt', 'username', 'email', 'displayName']);
        const sortKey = allowedSort.has(sortBy) ? sortBy : 'createdAt';
        const sortDir = sortOrder === 'asc' ? 1 : -1;
        const sortOptions = { [sortKey]: sortDir };

        const [clients, total] = await Promise.all([
            ClientSchema.find(query)
            .sort(sortOptions)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean(),
            ClientSchema.countDocuments(query),
        ]);

        res.json({
            success: true,
            data: clients,
            pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
            },
        });
        } catch (err) {
            console.error('Error fetching clients:', err);
            res.status(500).json({ success: false, error: 'Server Error' });
        }
    }

    async createClient(req, res) {
        try {
            const { username, email, displayName, avatar, userId } = req.body || {};
            if (!username || !email) {
                return res.status(400).json({ success: false, message: 'username and email are required' });
            }
            const client = new ClientSchema({
                username: String(username).trim(),
                userId: String(userId).trim().toLowerCase(),
                email: String(email).trim().toLowerCase(),
                displayName: displayName ? String(displayName).trim() : undefined,
                avatar: avatar ? String(avatar).trim() : undefined,
            });

            const saved = await client.save();
            return res.status(201).json({ success: true, data: saved });
        } catch (err) {
            if (err && err.code === 11000) {
                const field = Object.keys(err.keyValue || {})[0] || 'field';
                return res.status(409).json({ success: false, message: `Duplicate ${field}: already exists` });
            }
            if (err && err.name === 'ValidationError') {
            const errors = Object.fromEntries(
                Object.entries(err.errors).map(([k, v]) => [k, v.message])
            );
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
            }

            console.error('Error creating client:', err);
            return res.status(500).json({ success: false, message: 'Server Error' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const options = { new: true, runValidators: true };            
            const updatedDoc = await movieSchema.findByIdAndUpdate(
            id,
            updateData,
            options
            );

            if (!updatedDoc) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Document not found' 
                });
            }

            res.json({
                success: true,
                message: 'Document updated successfully',
                data: updatedDoc
            });

        } catch (error) {
            console.error('Update error:', error);            
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(el => el.message);
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors
                });
            }
            if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
            }

            res.status(500).json({
            success: false,
            error: 'Server error during update'
            });
        }
    }

    async delete(req, res) {
        try {            
            const { id } = req.params;            
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'Invalid ID format' });
            }
            const deletedMovie = await movieSchema.findByIdAndDelete(id);
            
            if (!deletedMovie) {
                return res.status(404).json({ error: 'Movie not found' });
            }

            res.json({ 
                success: true,
                message: 'Movie deleted successfully',
                data: deletedMovie
            });
            
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }

    async createChat (req, res) {
        try {
            const { members, name, isGroup } = req.body;
            const chat = new Chat({ members, name, isGroup });
            await chat.save();
            res.status(200).json(chat);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async listChats(req, res) {
        try {
            const chats = await Chat.find({ members: req.params.userId }).populate('members', 'username displayName');
            res.json(chats);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async sendMessage(req, res) {
        try {
            const { chatId, senderId, content } = req.body;            
            console.log(`Sending message to chat ${chatId} from user ${senderId}: ${content}`);
            const message = new Message({ chat: chatId, sender: senderId, content });
            await message.save();
            await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });
            res.status(201).json(message);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async getMessages(req, res) {
        try {
            const messages = await Message.find({ chat: req.params.chatId })
                .populate('sender', 'username displayName');
            res.json(messages);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}


export default new DataController();