// import mysql from 'mysql2';

// const db = mysql.createConnection({
//     host: '127.0.0.1',
//     user: 'root',
//     password: '',
//     database: 'testing',
// });

// db.connect((err) => {
//     if (err) {
//         throw err;
//     }
//     console.log('Base de datos conectada');
// });

import { Client } from 'cassandra-driver';

// Configuración de la conexión a Cassandra
const db = new Client({
    contactPoints: ['localhost'],
    localDataCenter: 'datacenter1',
    keyspace: 'deegle'
});

// Conectar a Cassandra
db.connect()
    .then(() => {
        console.log('Conexión exitosa a Cassandra');
    })
    .catch(err => {
        console.error('Error al conectar a Cassandra:', err);
    });

export default db;