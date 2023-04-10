const { EmbedBuilder, Client, CommandInteraction } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Pong',
    // ownerOnly: true, -> Optional
    /**
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    run: async (client, interaction, args) => {
        const embed = new EmbedBuilder()
            .setDescription(`🏓 ${client.ws.ping}ms!`)
            .setColor('Green')
        interaction.reply({
            embeds: [embed]
        })
    }
}