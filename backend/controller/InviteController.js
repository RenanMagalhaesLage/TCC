const express = require("express");
const router = express.Router();
/*-------------------------------
            Models
---------------------------------*/
const User = require("../database/User");
const Property = require("../database/Property");
const UserProperty = require("../database/UserProperty");
const Gleba = require("../database/Gleba");
const Safra = require("../database/Safra");
const Invite = require("../database/Invite");
const Custo = require("../database/Custo");
const SafraGleba = require("../database/SafraGleba");
const StorageItem = require("../database/StorageItem");

/* Rota para --> BUSCA DE INVITES */
router.get('/searchInvites/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
    
        const invites = await Invite.findAll({
            where: { reciverId: user.id },
        });

        if (!invites) {
            return res.status(404).json({ error: 'Nenhum convite encontrado' });
        }

        const invitesWithDetails = await Promise.all(
            invites.map(async (invite) => {
    
                const property = await Property.findOne({
                    where: { id: invite.propertyId }
                });
    
                const sender = await User.findByPk(invite.senderId);
    
                return {
                    invite,
                    property,
                    sender
                };
            })
        );
    
        return res.status(200).json(invitesWithDetails);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar convites do usuário' });
    }
});

/* Rota para --> CADASTRO DE INVITES */
router.post('/createInvite', async (req, res) => {
    try {
        const { reciverEmail, propertyId, senderEmail } = req.body;
        const sender = await User.findOne({ where: { email: senderEmail } });
        const reciver = await User.findOne({ where: { email: reciverEmail } });

        if (!reciver) {
            return res.status(400).json({ error: 'Destinatário não encontrado.' });
        }

        const verifyInvite = await Invite.findOne({
            where: {
                propertyId: propertyId,  
                reciverId: reciver.id     
            }
        })

        if(verifyInvite){
            return res.status(200).json('Destinatário já possui esse convite.');
        }

        const newInvite = await Invite.create({
            senderId: sender.id,
            reciverId: reciver.id,
            propertyId: propertyId
        });

        return res.status(201).json({ 
            invite: newInvite
        });
    } catch (error) {
        console.error('Erro ao salvar invite:', error);
        return res.status(500).json({ error: 'Erro ao salvar o invite.' });
    }
});

/* Rota para --> ACEITAR OU RECUSAR INVITE */
router.post('/acceptInvite/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { answer } = req.body;

        if (answer) {
            const invite = await Invite.findByPk(id);
            if (!invite) {
                return res.status(404).json({ error: 'Convite não encontrado' });
            }

            await UserProperty.create({
                access: "guest",
                userId: invite.reciverId,
                propertyId: invite.propertyId,
            });

            await Invite.destroy({
                where: { id: id }
            });

            return res.status(200).json({ message: 'Convite aceito e propriedade adicionada.' });

        } else {
            const deletedInvite = await Invite.destroy({
                where: { id: id }
            });

            if (deletedInvite === 0) {
                return res.status(404).json({ error: 'Convite não encontrado para remoção.' });
            }

            return res.status(200).json({ message: 'Convite recusado e removido.' });
        }

    } catch (error) {
        console.error('Erro ao salvar invite:', error);
        return res.status(500).json({ error: 'Erro ao salvar o invite.' });
    }
});


module.exports = router;