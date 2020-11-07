const Client = require('../struct/Client');
const log4js = require('log4js');
log4js.configure('./config/log_config.json',{});
const log = log4js.getLogger('BOT - skip');

module.exports = {
	name: 'skip',
	description: 'Passe la musique',
	usage: `${Client.config.prefix}skip`,
	execute(message) {
		
		const { channel } = message.member.voice;

		const serverQueue = message.client.queue.get(message.guild.id);
		
		if (!serverQueue) {

			log.info(`Il n'y a pas de musique en cours !`);

			return message.channel.send(`Il n'y a pas de musique en cours !`);

		} 
		
		if (!channel) {

			log.error(`L'utilisateur n'est pas dans un channel !`);

			return message.channel.send(`J'ai besoin que tu sois dans un channel pour passer une musique ! `);

		} 

		if( serverQueue.voiceChannel.name !== channel.name ) {

			log.error(`L'utilisateur n'est pas dans le même channel que le bot !`);

			return message.channel.send(`J'ai besoin que tu sois dans le même channel que moi pour passer une musique ! `);
			
		} 
		
		serverQueue.connection.dispatcher.end('Skip command has been used!');

		log.info(`Skip de la musique : ${serverQueue.songs[0].title} `);

		return message.channel.send(`Skip ! `);
	}
};