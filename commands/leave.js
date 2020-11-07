const Client = require('../struct/Client');
const log4js = require('log4js');
log4js.configure('./config/log_config.json',{});
const log = log4js.getLogger('BOT - leave');


module.exports = {
	name: 'leave',
	description: 'Fait partir le bot',
	usage: `${Client.config.prefix}leave`,
	execute(message) {

		const serverQueue = message.client.queue.get(message.guild.id);

		const { channel } = message.member.voice;

		const channelBot = message.guild.voice.channel;

		if (serverQueue) {

			serverQueue.songs = [];

			serverQueue.connection.dispatcher.end('Leave command has been used!');

		} 

		message.client.queue.delete(message.guild.id);

		if (!channel) {

				log.info(`L'utilisateur n'était pas dans le channel du bot lors de l'utilisation de la commande`);
				channelBot.leave();

			} 
		else if (channel != null && channel != channelBot) {

				log.info(`L'utilisateur n'était pas dans le même channel que celui du bot lors de l'utilisation de la commande`);
				channelBot.leave();

			}
		else {

				channel.leave();

			}

		
		message.channel.send(`Bye ~ `);
		log.info('Le bot est parti du channel');

	},
};