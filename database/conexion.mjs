import mysql from 'mysql2';

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'testing',
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Base de datos conectada');
});

export default db;