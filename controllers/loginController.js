import db from '../database/conexion.mjs';

class LoginController {

    async verifyTable(req, res) {
        try {
            return new Promise((resolve, reject) => {
                const query = "SELECT table_name FROM system_schema.tables WHERE keyspace_name = 'deegle';";
                
                db.execute(query, [], { prepare: true })
                    .then(result => {
                        const tables = result.rows.map(row => row.table_name);
                        if (tables.includes('estudiantes')) {
                            resolve(200); // Tabla 'estudiantes' encontrada
                        } else {
                            resolve(202); // Tabla 'estudiantes' no encontrada
                        }
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }

    consultar = async (req, res) => {
        try {
            const query = "SELECT * FROM estudiantes;";
            
            db.execute(query, [], { prepare: true })
                .then(result => {
                    return res.status(200).json(result.rows);
                })
                .catch(error => {
                    return res.status(400).send(error);
                });
        } catch (err) {
            return res.status(500).send(err.message);
        }
    };

    consultarDetalle(req, res) {
        const { id } = req.params;
        try {
            db.query(`SELECT * FROM estudiantes WHERE id = ?`, [id],
                (err, rows) => {
                    if (err) {
                        return res.status(400).send(err);
                    }
                    return res.status(200).json(rows[0]);
                });
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }

    ingresar = async (req, res) => {
        try {
            const { dni, nombre, apellido, email } = req.body;
            
            if (!dni || !nombre || !apellido || !email) {
                return res.status(400).json({ error: 'Todos los campos son requeridos.' });
            }
    
            this.verifyTable(req, res).then((response) => {
                if (response === 200) {
                    const insertQuery = "INSERT INTO estudiantes (id, dni, nombre, apellido, email) VALUES (uuid(), ?, ?, ?, ?);";
                    
                    db.execute(insertQuery, [dni, nombre, apellido, email], { prepare: true })
                        .then(result => {
                            return res.status(201).json(result);
                        })
                        .catch(error => {
                            return res.status(400).send(error);
                        });
                } else {
                    const createTableQuery = `CREATE TABLE IF NOT EXISTS estudiantes (
                        id UUID PRIMARY KEY,
                        dni INT,
                        nombre TEXT,
                        apellido TEXT,
                        email TEXT
                    );`;
    
                    db.execute(createTableQuery, [], { prepare: true })
                        .then(result => {
                            return res.status(200).send({ success: "Tabla de estudiantes creada con éxito" });
                        })
                        .catch(error => {
                            return res.status(500).send({ error: "Error al crear tabla de estudiantes", details: error });
                        });
                }
            });
        } catch (err) {
            return res.status(500).send(err.message);
        }
    };

    actualizar(req, res) {
        const { id } = req.params;
        try {
            const { dni, nombre, apellido, email } = req.body;
            db.query(`UPDATE estudiantes
            SET dni = ?, nombre = ?, apellido = ?, email = ?
            WHERE id = ?;`,
                [dni, nombre, apellido, email, id], (err, rows) => {
                    if (err) {
                        return res.status(400).send(err);
                    }
                    if (rows.affectedRows == 1)
                        return res.status(200).json({ respuesta: 'Registro actualizado con éxito' });
                })
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }

    borrar(req, res) {
        const { id } = req.params;
        try {
            db.query(`DELETE FROM estudiantes WHERE id = ?;`,
                [id], (err, rows) => {
                    if (err) {
                        return res.status(400).send(err);
                    }
                    if (rows.affectedRows == 1)
                        return res.status(200).json({ respuesta: 'Registro eliminado con éxito' });
                })
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }
}

export default new LoginController();