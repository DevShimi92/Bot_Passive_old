const log4js = require('log4js');
log4js.configure('./config/log_config.json',{});
const log = log4js.getLogger('BOT - volume');

module.exports = {
	name: 'volume',
	description: 'Change le volume de la playlist actuelle',
	usage: `${prefix}volume [Niveau du volume]`,
	execute(message, args) {

		const { channel } = message.member.voice;

		const serverQueue = message.client.queue.get(message.guild.id);

		if (!serverQueue) {

			log.error(`Il n'y a pas de musique en cours !`);

			return message.channel.send(`Il n'y a pas de musique en cours !`);

		} 

		if (!channel) {

			log.error(`L'utilisateur n'est pas dans un channel !`);

			return message.channel.send(`J'ai besoin que tu sois dans un channel pour changer de volume ! `);

		} 

		if( serverQueue.voiceChannel.name !== channel.name )  {

			log.error(`L'utilisateur n'est pas dans le même channel que le bot !`);

			return message.channel.send(`J'ai besoin que tu sois dans le même channel que moi pour changer de volume ! `);

		} 

		if (!args[0]){

			log.info(`Le volume actuelle est à ${serverQueue.volume}`);

			return message.channel.send(`Le volume actuelle est à **${serverQueue.volume}**`);

		} 

		if (isNaN(args[0])) { 

			log.error(`L'argument n'est pas un chiffre !`);

			return  

		} 

		if (args[0] > 10 || args[0] < 1) { 

			log.error(`L'argument n'est pas compris entre 1 et 10 !`);

			return  

		} 

		if (args[0].length > 4 ) { 

			log.error(`L'argument est anormalment long !`);

			return  
			
		} 

		serverQueue.volume = args[0];

		serverQueue.connection.dispatcher.setVolume(args[0] / 5);

		log.info(`Je régle le volume  ${args[0]}`);

		return message.channel.send(`Je régle le volume  **${args[0]}**`);
	}
};