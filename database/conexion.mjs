import { Client } from 'cassandra-driver';

// Configuración de la conexión a Cassandra
const db = new Client({
    contactPoints: ['localhost'],
    localDataCenter: 'datacenter1',
    keyspace: 'testing'
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