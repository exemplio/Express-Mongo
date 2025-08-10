import mongoose from 'mongoose';
import movieSchema from '../models/MovieModel.js';
import userSchema from '../models/ClientModel.js';
import Chat from '../models/ChatModel.js';
import Message from '../models/MessageModel.js';
import UserModel from '../models/UserModel.js';

class DataController {
    constructor() {
        this.insertUserIfNotExists = this.insertUserIfNotExists.bind(this);
    }
    async firebaseLogin(req, res) {
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
                const { idToken, email } = data;
                const user = await this.insertUserIfNotExists(idToken, email);
                return res.status(200).json(user);
            }
            return res.json(data);
        } catch (err) {
            return res.status(500).json({ error: "Internal Server Error", details: err.toString() });
        }
    };

    async insertUserIfNotExists(localId, email) {
        try {
            let user = await userSchema.findOne({ email });            
            if (!user) {
                user = new userSchema({ localId, email });
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

    async getAll(req, res) {
        try {
            const { 
            page = 1, 
            limit = 10, 
            title, 
            year, 
            genre, 
            minRating,
            sortBy = 'year',
            sortOrder = 'desc' 
            } = req.query;

            const query = {};
            
            if (title) query.title = new RegExp(title, 'i');
            if (year) query.year = year;
            if (genre) query.genres = genre;
            if (minRating) query['imdb.rating'] = { $gte: parseFloat(minRating) };

            const searchQuery = {
                $text: {
                    $search: title,
                    $caseSensitive: false,
                    $diacriticSensitive: false
                }
            };

            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const [movies, total] = await Promise.all([
            movieSchema.find(query)
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .lean(),
            movieSchema.countDocuments(query)
            ]);

            res.json({
                success: true,
                data: movies,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });

        } catch (err) {
            console.error('Error fetching movies:', err);
            res.status(500).json({ success: false, error: 'Server Error' });
        }
    }

    async addPost(req, res) {
        try {
            const product = new movieSchema(req.body);            
            const savedProduct = await product.save();            
            res.status(201).json(savedProduct);
        } catch (err) {
            return res.status(500).send(err.message);            
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
            res.status(201).json(chat);
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
            console.log(req.body);
            
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