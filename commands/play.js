const nconf = require("nconf");
const fs = require("fs");

const log4js = require('log4js');
log4js.configure('./config/log_config.json',{});
const log = log4js.getLogger('BOT - play');


module.exports = {
	name: 'play',
	description: '',
	usage: `${prefix}play [args]`,
	async execute(message, args) {

		const randomFolder  = nconf.get('randomFolder');

		const { channel } = message.member.voice;
		
		const serverQueue = message.client.queue.get(message.guild.id);

		const song = {
			title: '',
			path: ''
		};

		const queueConstruct = {
			textChannel: message.channel,
			voiceChannel: channel,
			connection: null,
			songs: [],
			volume: 1,
			playing: true
		};
		
		const play = async song => {
			const queue = message.client.queue.get(message.guild.id);
			if (!song) {
				message.client.queue.delete(message.guild.id);
				log.info('Fin de lecture');
				return;
			}

			const dispatcher = queue.connection.play(song.path);

			dispatcher.on('start', () => {
				log.info(song.title+' est en cours!');
			});
			
			dispatcher.on('finish', () => {
				log.info(song.title+' est fini !');
				queue.songs.shift();
				play(queue.songs[0]);
			});

			dispatcher.setVolume(queue.volume / 5);

			dispatcher.on('error', error => log.error(error));

			queue.textChannel.send(`Musique en cours : **${song.title}**`);
		};

		if (serverQueue)
			{
				if (serverQueue.songs.length > 25) 
					{
						return message.channel.send('La file est actuelllement trop longue !');
					}
			}

		// ** Option random**//
		if (args[0] == '-random' || args[0] == '-r')
			{	
				if ( args[1] == null)
				{
					// On dresse une liste des musiques dans le dossier puis on en prend un au hasard
					const commandFiles = fs.readdirSync(randomFolder).filter(file => file.endsWith('.mp3') || file.endsWith('.flac') || file.endsWith('.wav'));
					const NumberPiste = Math.floor(Math.random() * (commandFiles.length - 1 )) ;
					
					song.title = commandFiles[NumberPiste],
					song.path = randomFolder+commandFiles[NumberPiste]

					if (serverQueue) {
						serverQueue.songs.push(song);
						return message.channel.send('Une nouvelle musique aléatoire a été ajouté');
					}
					else
					{
						message.client.queue.set(message.guild.id, queueConstruct);
						queueConstruct.songs.push(song);
					}
					

				}
				else
				{

					if (args[1] > 10 ) 
					{
						log.error(`Limite d'ajout random dépassé !`)
						return message.channel.send(`Limite d'ajout random dépassé !`);  

					}
					if (!serverQueue) 
						{
							message.client.queue.set(message.guild.id, queueConstruct);
						}

					
					for (let i = 0; i < args[1] ; i++) {

						const songLoop = {
							title: '',
							path: ''
						}; 

						const commandFiles = fs.readdirSync(randomFolder).filter(file => file.endsWith('.mp3') || file.endsWith('.flac') || file.endsWith('.wav'));
						const NumberPiste = Math.floor(Math.random() * (commandFiles.length - 1 )) ;	

						songLoop.title = commandFiles[NumberPiste];
						songLoop.path = randomFolder+commandFiles[NumberPiste];

						if (serverQueue) 
							{
								serverQueue.songs.push(songLoop);
							}
						else
							{
								queueConstruct.songs.push(songLoop);
							}
					  }
					  
					  if (serverQueue) 
							{
								return message.channel.send('Une nouvelle sélection de musique aléatoire a été ajouté');
							}
					  
				}

			}
		else
			{
				return message.channel.send('Seule la lecture de piste audio en local en aléatoire est uniquement possible.');
			}


			try {
				const connection = await channel.join();
				queueConstruct.connection = connection;
				play(queueConstruct.songs[0]);
			} catch (error) {
				log.error(`Je ne peux pas rejoindre ce channel : ${error}`);
				message.client.queue.delete(message.guild.id);
				await channel.leave();
				return message.channel.send(`Je ne peux pas rejoindre ce channel ! `);
			}
			

	},
};
