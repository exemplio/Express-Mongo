import express from 'express';
const router = express.Router();
import dataController from '../controllers/dataController.js';

router.get('/', dataController.getAll);

/**
 * @swagger
 * /api:
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
 * /api:
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
 * /api:
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

router.route("/firebase-login")
    .post(dataController.firebaseLogin)

/**
 * @swagger
 * /api/firebase-login:
 *   put:
 *     summary: Iniciar sesion
 *     description: Inicia sesion con el email y password proporcionados.
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
 */

router.route("/create-chat")
    .post(dataController.createChat);

/**
 * @swagger
 * /api/create-chat:
 *   post:
 *     summary: Crear un chat
 *     description: Crea un nuevo chat con los miembros proporcionados.
 *     parameters:
 *       - in: body
 *         name: chat
 *         description: Datos del chat a crear.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             members:
 *               type: array
 *               items:
 *                 type: string
 *             name:
 *               type: string
 *             isGroup:
 *               type: boolean
 *     responses:
 *       200:
 *         description: Petición exitosa. Data actualizada correctamente.
 *       404:
 *         description: No se encontró la data con el ID especificado para actualizar.
 */

router.route("/send-message")
    .post(dataController.sendMessage);

/**
 * @swagger
 * /api/send-message:
 *   post:
 *     summary: Enviar un mensaje
 *     description: Envía un nuevo mensaje en el chat especificado.
 *     parameters:
 *       - in: body
 *         name: message
 *         description: Datos del mensaje a enviar.
 *         required: true
 *         schema:
 *          type: object
 *          properties:
 *            chat:
 *              type: string
 *            sender:
 *              type: string
 *            content:
 *             type: string
 *            readBy:
 *             type: array
 *            createdAt:
 *              type: string
 *              format: date-time
 *     responses:
 *       200:
 *         description: Petición exitosa. Mensaje enviado correctamente.
 *       404:
 *         description: No se pudo enviar el mensaje.
 */





export default router;
