import { Router } from 'express';
const router = Router();
import loginController from '../controllers/loginController.js';

router.get('/', loginController.consultar);

router.post('/', loginController.ingresar);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID
 *     description: Retorna un usuario basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Petición exitosa. Devuelve el usuario especificado.
 *       404:
 *         description: No se encontró el usuario con el ID especificado.
 *   put:
 *     summary: Actualiza un usuario por ID
 *     description: Actualiza la información de un usuario basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Petición exitosa. Usuario actualizado correctamente.
 *       404:
 *         description: No se encontró el usuario con el ID especificado para actualizar.
 *   delete:
 *     summary: Borra un usuario por ID
 *     description: Elimina un usuario basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Petición exitosa. Usuario eliminado correctamente.
 *       404:
 *         description: No se encontró el usuario con el ID especificado para eliminar.
 */
router.route("/:id")
    .get(loginController.consultarDetalle)
    .put(loginController.actualizar)
    .delete(loginController.borrar);


export default router;
