import express from 'express';
const router = express.Router();
import dataController from '../controllers/dataController.js';

router.get('/', dataController.getAll);

/**
 * @swagger
 * /api/data:
 *   get:
 *     summary: Obtiene la data
 *     description: Retorna toda la data.
 *     responses:
 *       200:
 *         description: Petición exitosa. Devuelve la data especificado.
 *       404:
 *         description: No se encontró la data.
 */

router.post('/', dataController.addPost);

/**
 * @swagger
 * /api/data:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with the provided data.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de la data
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Petición exitosa. Data agregada.
 *       404:
 *         description: No se pudo ingresar la dara.
 */

router.route("/:id")
    .put(dataController.update)
    .delete(dataController.delete);

/**
 * @swagger
 * /api/data:
 *   put:
 *     summary: Actualiza data por ID
 *     description: Actualiza la data basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de la data
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Petición exitosa. Data actualizada correctamente.
 *       404:
 *         description: No se encontró la data con el ID especificado para actualizar.
 *   delete:
 *     summary: Borra data por ID
 *     description: Elimina data basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de la data
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Petición exitosa. Data eliminada correctamente.
 *       404:
 *         description: No se encontró la data con el ID especificado para eliminar.
 */



export default router;
