import movieSchema from '../models/MovieModel.js';
import mongoose from 'mongoose';

class DataController {

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

    addPost= async (req, res) => {
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
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(el => el.message);
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors
            });
            }
            
            // Handle CastError (invalid ID format)
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
}

export default new DataController();