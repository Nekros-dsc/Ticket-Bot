const client = require('../../index');
const { ActionRowBuilder, ButtonBuilder, ChannelType, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonStyle } = require('discord.js');

module.exports = {
    name: "ticketCreate"
};

client.on("interactionCreate", async (interaction) => {

    if (interaction.isButton()) {
        if (interaction.customId.startsWith(`ticket-setup-${interaction.guild.id}`)) {
            const id = interaction.customId.split('-')[3]

            const modal = new ModalBuilder()
                .setCustomId(`modal-${interaction.guild.id}-${id}`)
                .setTitle(`${interaction.guild.name}'s Ticket`);

            const ticketreason = new TextInputBuilder()
                .setCustomId(`ticket-reason`)
                .setLabel("Reason")
                .setPlaceholder("Provide the reason of creating ticket")
                .setStyle(TextInputStyle.Short)
                .setMinLength(10)
                .setMaxLength(1000);

            const firstActionRow = new ActionRowBuilder().addComponents(ticketreason);

            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);
        }

        if (interaction.customId.startsWith(`close-ticket`)) {
            await interaction.deferUpdate()
            const id = interaction.customId.split('-')[2];

            const user = interaction.guild.members.cache.get(`${id}`);
            const channel = interaction.guild.channels.cache.get(`${interaction.channel.id}`)

            if (!channel.permissionsFor(interaction.user.id).has("ManageChannels")) {
                return interaction.followUp({
                    content: `You are not allowed to close ticket`,
                    ephemeral: true
                })
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("close-ticket")
                        .setLabel("🔒 Close")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                )

            interaction.editReply({
                components: [row]
            })
            
            await channel.setName(`close-${user.user.discriminator}`)
            channel.permissionOverwrites.edit(user, {
                ViewChannel: false
            }).then(() => {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('-')
                            .setLabel("🔒 Closed")
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    )
                const embed = new EmbedBuilder()
                    .setTitle(`Closed Ticket`)
                    .setDescription(`Le ticket a été close avec succès !`)
                    .setColor("#2f3136")
                    .setTimestamp()
                return interaction.channel.send({
                    embeds: [embed],
                    components: [row]
                });
            }).catch(error => {
                console.error(error);
            });
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith(`modal-${interaction.guild.id}`)) {
            const id = interaction.customId.split('-')[2]

            const reason = interaction.fields.getTextInputValue('ticket-reason');

            const category = interaction.guild.channels.cache.get(`${id}`)

            await interaction.guild.channels.create({
                parent: category.id,
                name: `ticket-${interaction.user.discriminator}`,
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: ['SendMessages', 'ViewChannel'],
                    },
                    {
                        id: interaction.guild.roles.everyone,
                        deny: ['ViewChannel'],
                    },
                    {
                        id: client.user.id,
                        allow: ['ManageChannels']
                    }
                ],
                type: ChannelType.GuildText,
            }).then(async c => {
                interaction.reply({
                    content: `Le ticket a été créé, passez à <#${c.id}>`,
                    ephemeral: true
                });

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`close-ticket-${interaction.user.id}`)
                            .setLabel("🔒 Close")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const embed = new EmbedBuilder()
                    .setTitle(`Attendez la réponse`)
                    .setAuthor({ name: `${interaction.user.username}'s Ticket`, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`Merci d'avoir créé votre ticket, patientez jusqu'à ce que le personnel récupère votre ticket.`)
                    .setTimestamp()
                    .addFields(
                        { name: "Reason", value: `${reason}` }
                    )
                    .setColor("#2f3136")

                c.send({
                    content: `${interaction.user}`,
                    components: [row],
                    embeds: [embed]
                })
            })
        }
    }
})