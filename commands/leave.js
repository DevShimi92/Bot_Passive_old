const log4js = require('log4js');
log4js.configure('./config/log_config.json',{});
const log = log4js.getLogger('BOT - leave');


module.exports = {
	name: 'leave',
	description: 'Fait partir le bot',
	usage: `${prefix}leave`,
	execute(message) {

		const { channel } = message.member.voice;

		const serverQueue = message.client.queue.get(message.guild.id);

		if (serverQueue) {

			serverQueue.songs = [];

			serverQueue.connection.dispatcher.end('Stop command has been used!');

		} 

		message.client.queue.delete(message.guild.id);

		channel.leave();

		log.info('Le bot est parti du channel');

	},
};