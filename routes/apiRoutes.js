import express from 'express';
const router = express.Router();
import dataController from '../controllers/apiController.js';

router.get('/get-clients', dataController.getClients);

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

router.route("/:id")
    .put(dataController.updateClient)
    .delete(dataController.deleteClient);

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

router.route("/login/register")
    .post(dataController.register)

/**
 * @swagger
 * /api/register:
 *   put:
 *     summary: Registro
 *     description: Registra un nuevo usuario con el email y password proporcionados.
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

router.route("/login/passwordGrant")
    .post(dataController.login)

/**
 * @swagger
 * /api/login:
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

router.route("/list-chats")
    .post(dataController.listChats);

/**
 * @swagger
 * /api/list-chats:
 *   post:
 *     summary: Listar chats
 *     description: Obtiene la lista de chats del usuario especificado.
 *     parameters:
 *       - in: body
 *         name: userId
 *         description: ID del usuario para obtener sus chats.
 *         required: true
 *         schema:
 *          type: object
 *          properties:
 *            userId:
 *              type: string
 *            createdAt:
 *              type: string
 *              format: date-time
 *     responses:
 *       200:
 *         description: Petición exitosa. Mensaje enviado correctamente.
 *       404:
 *         description: No se pudo enviar el mensaje.
 */

router.route("/get-messages")
    .get(dataController.getMessages);

/**
 * @swagger
 * /api/get-messages:
 *   get:
 *     summary: Obtener mensajes
 *     description: Obtiene los mensajes de un chat específico.
 *     parameters:
 *       - in: body
 *         name: chat
 *         description: ID del chat para obtener sus mensajes.
 *         required: true
 *         schema:
 *          type: object
 *          properties:
 *            userId:
 *              type: string
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
