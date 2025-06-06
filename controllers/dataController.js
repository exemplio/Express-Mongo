import movieSchema from '../models/MovieModel.js';

class DataController {

    async consultar(req, res) {
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
            movieSchema.find(searchQuery)
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

    consultarDetalle(req, res) {
        const { id } = req.params;
        try {
            
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }

    ingresar= (req, res) => {
        try {
            
        } catch (err) {
            return res.status(500).send(err.message);            
        }
    }

    actualizar(req, res) {
        const { id } = req.params;
        try {
            
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }

    borrar(req, res) {
        const { id } = req.params;
        try {
            
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }
}

export default new DataController();