const log4js = require('log4js');
log4js.configure('./config/log_config.json',{});
const log = log4js.getLogger('BOT - pause');

module.exports = {
	name: 'pause',
	description: 'Met en pause la musique',
	usage: `${prefix}pause`,
	execute(message)  {

		const serverQueue = message.client.queue.get(message.guild.id);

		const { channel } = message.member.voice;

		if (!serverQueue) {

			log.error(`L'utilisateur tente de mettre en pause la lecture d'une playlist inexistante !`);
			
			return message.channel.send(`Il n'y pas de musique en cours ! `);
		}

		if (!channel) {

			log.error(`L'utilisateur n'est pas dans un channel !`);

			return message.channel.send(`J'ai besoin que tu sois dans un channel pour mettre en pause la musique ! `);
		} 

		if( serverQueue.voiceChannel.name !== channel.name )  {

			log.error(`L'utilisateur n'est pas dans le même channel que le bot !`);

			return message.channel.send(`J'ai besoin que tu sois dans le même channel que moi pour mettre en pause la musique ! `);
		} 

		if (serverQueue && serverQueue.playing) {

			serverQueue.playing = false;

			serverQueue.connection.dispatcher.pause();

			log.info(`Mise en pause de la musique : ${serverQueue.songs[0].title} `);

			return message.channel.send('Mise en pause de la musique');
			
		}

		log.info(`Il n'y a pas de musique en cours !`);

		return message.channel.send(`Il n'y a pas de musique en cours !`);
		
	}
};