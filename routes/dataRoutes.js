import express from 'express';
const router = express.Router();
import dataController from '../controllers/dataController.js';

/**
 * @swagger
 * /estudiantes/{id}:
 *   get:
 *     summary: Obtiene un estudiante por ID
 *     description: Retorna un estudiante basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del estudiante
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Petición exitosa. Devuelve el estudiante especificado.
 *       404:
 *         description: No se encontró el estudiante con el ID especificado.
 *   put:
 *     summary: Actualiza un estudiante por ID
 *     description: Actualiza la información de un estudiante basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del estudiante
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Petición exitosa. Estudiante actualizado correctamente.
 *       404:
 *         description: No se encontró el estudiante con el ID especificado para actualizar.
 *   delete:
 *     summary: Borra un estudiante por ID
 *     description: Elimina un estudiante basado en su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del estudiante
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Petición exitosa. Estudiante eliminado correctamente.
 *       404:
 *         description: No se encontró el estudiante con el ID especificado para eliminar.
 */


router.get('/', dataController.consultar);

router.post('/', dataController.ingresar);

router.route("/:id")
    .get(dataController.consultarDetalle)
    .put(dataController.actualizar)
    .delete(dataController.borrar);


export default router;
