const log4js = require('log4js');
log4js.configure('./config/log_config.json',{});
const log = log4js.getLogger('BOT - queue');

module.exports = {
	name: 'queue',
	description: 'Affiche la playlist actuelle du bot',
	usage: `${prefix}queue`,
	execute(message)    {
		
		const serverQueue = message.client.queue.get(message.guild.id);
		
		if (!serverQueue) {
			log.info(`Il n'y a pas de musique en cours !`);
			return message.channel.send(`Il n'y a pas de musique en cours !`);
		} 
		
		log.info(`\nPlayliste actuellle : ${serverQueue.songs.map(song => `- ${song.title}`).join('\n')}`);

		log.info(`En cours ${serverQueue.songs[0].title}`);

		return message.channel.send(`
__**Playlist actuelle :**__
${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}
__**En cours:**__  **${serverQueue.songs[0].title}**
				`);

	}
	
};