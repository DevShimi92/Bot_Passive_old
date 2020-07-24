const log4js = require('log4js');
log4js.configure('./config/log_config.json',{});
const log = log4js.getLogger('BOT - resume');

module.exports = {
	name: 'resume',
	description: 'Reprise de la musique si elle a été mise en pause',
	usage: `${prefix}resume`,
	execute(message)   {
		
		const serverQueue = message.client.queue.get(message.guild.id);

		const { channel } = message.member.voice;

		if (!serverQueue) {

			log.error(`L'utilisateur tente de reprendre la lecture d'une playlist inexistante !`);

			return message.channel.send(`Il n'y pas de musique en cours ! `);
		}
		
		if (!channel) {

			log.error(`L'utilisateur n'est pas dans un channel !`);

			return message.channel.send(`J'ai besoin que tu sois dans un channel pour reprendre la musique ! `);

		} 

		if( serverQueue.voiceChannel.name !== channel.name )  {

			log.error(`L'utilisateur n'est pas dans le même channel que le bot !`);

			return message.channel.send(`J'ai besoin que tu sois dans le même channel que moi pour reprendre la musique! `);

		} 
		
		if (serverQueue && !serverQueue.playing) {
		
			serverQueue.playing = true;
		
			serverQueue.connection.dispatcher.resume();
		
			log.info(`Reprise de la musique : ${serverQueue.songs[0].title} `);
		
			return message.channel.send(`Reprise de l'écoute`);
	
		}

		log.info(`Il n'y a pas de musique en cours !`);

		return message.channel.send(`Il n'y a pas de musique en cours !`);
		
	}
};