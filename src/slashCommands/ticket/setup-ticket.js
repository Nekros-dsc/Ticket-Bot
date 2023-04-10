const { Client, CommandInteraction, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, AttachmentBuilder, ApplicationCommandOptionType, ChannelType } = require('discord.js');
const config = require("../../config/config.json");
const owners = config.OWNER;

module.exports = {
    name: 'setup-ticket',
    description: "Configurer un ticket sur votre serveur",
    clientPermissions: ["Administrator"],
    options: [
        {
            name: "channel",
            description: "fournir un canal pour configurer le ticket",
            type: ApplicationCommandOptionType.Channel,
            required: true
        },
        {
            name: "category",
            description: "fournir la catégorie où le ticket créé sera affiché",
            type: ApplicationCommandOptionType.Channel,
            required: true
        }
    ],
    /** 
     * @param {Client} client 
     * @param {CommandInteraction} interaction
     * @param {String[]} args 
     */
    run: async (client, interaction, args) => {
        if(!owners.includes(interaction.user.id)) return interaction.reply({content: `Vous n'êtes pas Owner bot`, ephemeral: true});
        const data = interaction.options.getChannel("channel");
        const data2 = interaction.options.getChannel("category")

        const channel = interaction.guild.channels.cache.get(`${data.id}`);
        const category = interaction.guild.channels.cache.get(`${data2.id}`)

        if (!channel.viewable) {
            return interaction.reply({
                content: "Le canal fourni n'est pas visible pour moi",
                ephemeral: true
            })
        }

        if (category.type !== ChannelType.GuildCategory) {
            return interaction.reply({
                content: "La catégorie que vous avez fournie n'est pas valide",
                ephemeral: true
            })
        }

        if (!category.viewable) {
            return interaction.reply({
                content: "La catégorie fournie ne m'est pas visible",
                ephemeral: true
            })
        }

        if (!category.permissionsFor(client.user.id).has("ManageChannels")) {
            return interaction.reply({
                content: "il manque au bot les autorisations de gestion des canaux pour créer un canal de tickets",
                ephemeral: true
            })
        }

        
         const embed = new EmbedBuilder()
             .setTitle("Ticket Support")
             .setDescription("Pour créer un ticket cliquer sur le bouton")
             .setColor("#2f3136")

        
        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`ticket-setup-${interaction.guild.id}-${category.id}`)
                    .setLabel('Créer un ticket')
                    .setStyle(ButtonStyle.Secondary),
            );

        await interaction.reply({
            content: `Le ticket a été configuré pour ${channel} avec succès            .`,
            ephemeral: true
        })

        channel.send({
             embeds: [embed],
            components: [button],
            
        })
    }
}