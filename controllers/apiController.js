import UserSchema from '../models/UserModel.js';
import ChatSchema from '../models/ChatModel.js';
import MessageSchema from '../models/MessageModel.js';
import ClientSchema from '../models/ClientModel.js';
import { validate as isUuid } from 'uuid';
import { v4 as uuidv4  } from 'uuid';

class DataController {
    constructor() {
        // this.login = this.login.bind(this);
    }
    async register(req, res) {
        const { email, password, roleType, userName } = req.body;
        const url = process.env.FIREBASE_REGISTER_URL;
        const payload = {
            email,
            password
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
                let user = await UserSchema.findOne({ email });            
                if (!user) {
                    user = new UserSchema({ userId : uuidv4(), email, roleType, userName });
                    user = await user.save();
                }else{
                    return { status: 200, message: "User already exists" };
                }
                let client = await ClientSchema.findOne({ email });
                if (!client && roleType === 'regular') {
                    client = new ClientSchema({ userId: user.userId, email, userName });
                    client = await client.save();
                    return res.status(200).json(client);
                }else{
                    return { status: 200, message: "Client already exists" };
                }
            }
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: err.toString() });
        }
    };
    async login(req, res) {
        const { email, password } = req.body;
        const url = process.env.FIREBASE_AUTH_URL;
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
                            userName: existingClient.userName,
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

    async getClients(req, res) {
        try {
        const {
            page = '1',
            limit = '10',
            q,
            userName,
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

        if (userName) query.userName = new RegExp(userName, 'i');
        if (displayName) query.displayName = new RegExp(displayName, 'i');
        if (email) query.email = new RegExp(email, 'i');

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

        if (q) {
            const regex = new RegExp(q, 'i');
            query.$or = [
            { userName: regex },
            { displayName: regex },
            { email: regex },
            ];
        }

        // Sorting
        const allowedSort = new Set(['createdAt', 'userName', 'email', 'displayName']);
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

    async updateClient(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const options = { new: true, runValidators: true };
            const updatedDoc = await ClientSchema.findByIdAndUpdate(
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

    async deleteClient(req, res) {
        try {            
            const { id } = req.params;            
            if (!isUuid.isValid(id)) {
                return res.status(400).json({ error: 'Invalid ID format' });
            }
            const deletedClient = await ClientSchema.findByIdAndDelete(id);

            if (!deletedClient) {
                return res.status(404).json({ error: 'Client not found' });
            }

            res.json({ 
                success: true,
                message: 'Client deleted successfully',
                data: deletedClient
            });
            
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }

    async createChat (req, res) {
        try {
            const { members, name, isGroup, lastMessage } = req.body;
            const chat = new ChatSchema({ members, name, isGroup, lastMessage, chatId: uuidv4() });
            await chat.save();
            res.status(200).json(chat);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async listChats(req, res) {
        try {
            const chats = await ChatSchema.find({ members: req.params.userId }).populate('members', 'userName displayName');
            res.json(chats);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async sendMessage(req, res) {
        try {
            const { chat, sender, content, receiver, lastMessage } = req.body;
            console.log(`Sending message to chat ${chat} from user ${sender}: ${content}`);
            const message = new MessageSchema({ 
                chat: chat, sender: sender, content: content, receiver: receiver, lastMessage: lastMessage
            });
            await message.save();
            await ChatSchema.findByIdAndUpdate(chat, { lastMessage: message._id });
            res.status(201).json(message);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async getMessages(req, res) {
        try {
            const { chat } = req.query;

            if (!chat || !isUuid.isValid(String(chat))) {
                return res.status(400).json({ error: 'Invalid or missing chat' });
            }

            const raw = await MessageSchema.find({ chat: chat })
            .populate('sender', 'userName displayName -_id')
            .lean()
            .exec();

            const messages = raw.map(({ _id, __v, ...rest }) => rest);

            res.json(messages);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}


export default new DataController();