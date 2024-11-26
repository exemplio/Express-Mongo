import db from '../database/conexion.mjs';

class LoginController {

    async verifyTable(req,res){
        try {
            return new Promise((resolve, reject) => {
                db.query("SHOW TABLES", function (error, results, fields) {
                if (error) throw error;      
                    const tables = results.map(result => result.Tables_in_testing);
                    if (tables.includes('users')) {
                        resolve(200);
                    } else {
                        resolve(202);
                    }
                });
            });
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }

    consultar(req, res) {
        try {
            db.query(`SELECT * FROM users`,
                (err, rows) => {
                    if (err) {
                        return res.status(400).send(err);
                    }
                    return res.status(200).json(rows);
                });
        } catch (err) {
            return res.status(500).send(err.message);
        }
    }

    consultarDetalle(req, res) {
        const { id } = req.params;
        try {
            db.query(`SELECT * FROM users WHERE id = ?`, [id],
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

    ingresar= (req, res) => {
        try {
            const { dni, nombre, apellido, email } = req.body;
            if (!dni || !nombre || !apellido || !email) {
                return res.status(400).json({ error: 'Todos los campos son requeridos.' });
            }
            this.verifyTable(req,res).then((response)=>{
                if (response==200) {
                    db.query(`INSERT INTO users
                                (id, dni, nombre, apellido, email)
                                VALUES(NULL, ?, ?, ?, ?);`,
                        [dni, nombre, apellido, email], (err, rows) => {
                            if (err) {
                                return res.status(400).send(err);                        
                            }
                            if (rows.insertId)
                                return res.status(201).json(rows);                        
                    });
                }else{
                    const createTableQuery = ` CREATE TABLE users (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      dni INT NOT NULL,
                      nombre VARCHAR(50) NOT NULL,
                      apellido VARCHAR(50) NOT NULL,
                      email VARCHAR(50) NOT NULL)`;
                    db.query(createTableQuery, (error, results, fields) => {
                        if (error) {
                            return res.status(200).send({err:"Error al crear tabla de usuarios"});
                        } else {
                            return res.status(200).send({success:"Tabla de estudiantes creada con éxito"});
                        }
                      });
                }
            })
        } catch (err) {
            return res.status(500).send(err.message);            
        }
    }

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