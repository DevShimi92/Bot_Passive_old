const Client = require('../struct/Client');
const fs = require("fs");
const log4js = require('log4js');
log4js.configure('./config/log_config.json',{});
const log = log4js.getLogger('BOT - play');
const { Sequelize , Op } = require("sequelize");
const { models } = require('../db_sequelize');

function isNumber(n)  { log.trace('isNumberBegin'); return /^-?[\d.]+(?:e-?\d+)?$/.test(n); } 

function addSong(message,queueConstruct,dataSong,hidemsg = false)
{
	log.trace('addSongBegin');
	const song = {
		title: '',
		path: ''
	};

	const serverQueue = message.client.queue.get(message.guild.id);
		
	try {
		
		song.title = dataSong.name ;
		log.debug('dataName : '+dataSong.name);

		song.path = dataSong.path ;
		log.debug('dataPath : '+dataSong.path);

		if (serverQueue) {
			serverQueue.songs.push(song);
			if(hidemsg == false)
			{
				return message.channel.send(song.title+' à été ajouté');
			}
			
		}
		else
			{
					message.client.queue.set(message.guild.id, queueConstruct);
					queueConstruct.songs.push(song);
			}

	} catch (error) {

		log.error(error);
		
	}
}


module.exports = {
	name: 'play',
	description: `\n       Sans argument, lancer la commande avec le nom de la musqiue à jouer \n       -random(-r) : Lance une musique random (depuis un dossier prédéfini)\n         => - globale(-g) : lancer avec -random permet de faire une séléction sur toute les musique disponible dans la base\n       - album(-al) : Lance un album\n       -id : Lance une musique via son id\n `,         
	usage: `${Client.config.prefix}play [args][Nom de la musique ou de l'album]`,
	async execute(message, args) {

		const randomFolder  = Client.config.randomFolder;

		const { channel } = message.member.voice;
		
		const serverQueue = message.client.queue.get(message.guild.id);

		const queueConstruct = {
			textChannel: message.channel,
			voiceChannel: channel,
			connection: null,
			songs: [],
			volume: 1,
			playing: true
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
				if(args[1] == 'global' || args[1] == 'g')
				{
					let id_song_max = await models.song.max('song_id');

					if(isNumber(args[2]))
					{
						if (args[2] > 10 ) 
							{
								log.error(`Limite d'ajout random en globale dépassé !`)
								return message.channel.send(`Limite d'ajout random en globale dépassé !`);  

							}
						
						if (!serverQueue) 
							{
								message.client.queue.set(message.guild.id, queueConstruct);
							}
						
						for (let i = 0; i < args[2] ; i++) {

							const NumberPiste = Math.floor(Math.random() * (id_song_max ));	

							log.debug('ID aléatoire pris pour la piste n° '+ i +' : ' + NumberPiste);

							let songRandomGlobal = await models.song.findAll({
								raw: true,
								plain: true,
								attributes:  ['name','path'] ,
								where: {
									song_id: NumberPiste
								}
							}).then(function(data) {
								return data;
							});

							addSong(message,queueConstruct,songRandomGlobal,true);

						}
					}
					else if ( args[2] == null )
					{
						const NumberPiste = Math.floor(Math.random() * (id_song_max )) ;	

							let songRandomGlobal = await models.song.findAll({
								raw: true,
								plain: true,
								attributes:  ['name','path'] ,
								where: {
									song_id: NumberPiste
								}
							}).then(function(data) {
								return data;
							});

						addSong(message,queueConstruct,songRandomGlobal,true);

					}	
				}
				else if ( args[1] == null)
				{
					const song = {
						title: '',
						path: ''
					};
					
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
				else if (isNumber(args[1]))
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
		else if (args[0] == '-album' || args[0] == '-al' )
			{
				if (!args[1])
					{
						log.error(`Nom d'un album manquant`);
						return message.channel.send(`Il manque le nom de l'album  a recherché`);
					}
				
				let listAlbumByName = await models.song.findAll({
						attributes: [[Sequelize.literal('DISTINCT `album`'), 'album']],
						raw: true,
						where: {
							album: {
								[Op.like]: args[1]+'%'
							}
						},

					}).then(function(data) {
							return data ;
					});

				try {

					if(listAlbumByName.length > 1)
					{
						let NumberAlbum;

						log.info("Plusierus résultats trouvé par rapport à la demande de l'utilisateur");
						message.channel.send(`J'ai trouvé plusieurs résultat :`)

						let result = listAlbumByName.map((x,index) => index+1 +' - '+ x.album).join("\n") ;

						log.trace('\n' + result );
						message.channel.send("```\nRésultats : \n" + result + "\n```");

						log.info("En attente du choix de l'utilisateur...");
						message.reply("Choisissez l'album que vous voulez en envoyant son chiffre assosié (30 sec restante)");

						await message.channel.awaitMessages(m => m.author.id == message.author.id,
							{max: 1, time: 30000}).then(collected => {

								if(isNumber(collected.first().content ))
								{
									if (collected.first().content <= listAlbumByName.length && collected.first().content != 0)
									{
										NumberAlbum = collected.first().content;
									}
									else
									{
										log.info("Choix incorrect, je n'ajoute rien");
										return message.channel.send("Choix incorrect, je n'ajoute rien.");
									}				
								}
								else
								{
									log.info("Valeur non numérique ! Je n'ajoute rien");
									return message.channel.send("Ce n'est pas un chiffre ! Je n'ajoute rien.");
								} 
												
							}).catch(() => {
								log.info("30 seconde écoulé, ajout de musique annulé !");
								return message.channel.send("Pas de réponse dans le temps inparti, je n'ajoute rien. ");
							});

							if(NumberAlbum)
								{
									let listSongByAlbum = await models.song.findAll({
										attributes: ['name','path'],
										raw: true,
										where: {
											album: listAlbumByName[0].album 
										},
										order: [['number_track', 'ASC']],
				
									}).then(function(data) {
											return data ;
									});
								
									for (let i = 0; i < listSongByAlbum.length ; i++) {
										addSong(message,queueConstruct,listSongByAlbum[i],true);
									}
								}

					}
					else if(listAlbumByName.length == 1)
					{
						let check = false;

						log.info("Confirmatin de la lecture de l'album demandé...("+listAlbumByName[0].album+")");
						message.channel.send(listAlbumByName[0].album+" exact ? [OUI ou NE REPONDEZ PAS] (10 sec)");
						
						await message.channel.awaitMessages(m => m.author.id == message.author.id,
							{max: 1, time: 10000}).then(collected => {
								if (collected.first().content.toLowerCase() == 'oui') {
										log.info("L'utilisateur à confirmé la lecture")
										check = true;

								}

							}).catch(() => {
								log.info("Pas de réponse ! Ajout de l'album à la queue annulé !")
								return message.channel.send("Pas de réponse ! Ajout de l'album demandé à la queue annulé !");

							});

						if(check)
						{
							let listSongByAlbum = await models.song.findAll({
								attributes: ['name','path'],
								raw: true,
								where: {
									album: listAlbumByName[0].album 
								},
								order: [['number_track', 'ASC']],
		
							}).then(function(data) {
									return data ;
							});
						
							for (let i = 0; i < listSongByAlbum.length ; i++) {
								addSong(message,queueConstruct,listSongByAlbum[i],true);
							}
						}

					}
					else
					{
						log.info("L'album demandé n'est pas présente en base ou n'exsite pas");
						log.info("Argument de recheche entrée par l'utilisateur : " + args[1])
						return message.channel.send(`Désolé, je ne trouve aucune correspondance par rapport à ta recherche.`);
					}
					

				} catch (error) {
					log.error(`Problème lors de l'ajout d'un album à la queue : ${error}`);
				}
				
			}
		else if (args[0] == '-artist' || args[0] == '-art' )
			{
				//On a des nom en alpha et en kanji qui peuveut bien dire la même chose comme ne peuveut pas dire la même chose
				// A voir plus tard 
				return message.channel.send(`Cette fonctionalité n'est pas encore disponible pour le moment`);
			}
		else if (args[0] == '-id' ) // Lecture d'une musique par id
			{
				if (!args[1])
					{
						log.error(`ID à chercher manquant`);
						return message.channel.send(`Il manque l'id a recherché`);
					}
				
				if (!isNumber(args[1]))
					{
						log.error(`Valeur non numérique`);
						return message.channel.send(`ID numérique, pas alphanumérique `);
					}

				let listSongbyid = await models.song.findAll({ 
					attributes: ['name','path'],
					raw: true,
					where: {
						song_id: args[1]	
						},
					}).then(function(data) {
							return data;
					});

				try {

					if(listSongbyid.length > 0)
							{
								addSong(message,queueConstruct,listSongbyid[0]);
							}
					else
					{
						log.info("La musique demandé n'est pas présente en base ou n'exsite pas");
						log.info("ID entré par l'utilisateur pour la recherche : " + args[1])
						return message.channel.send(`Désolé, je ne trouve aucune musique conrespondante a ton id.`);
					}

					
				} catch (error) {
					log.error(`Problème lors de l'ajout d'une musique à la queue : ${error}`);
				}
			}
		else // Lecture ou recherche d'une musique par nom
			{
				let listSongByName = await models.song.findAll({ 
					attributes: [ 'name','path'],
					raw: true,
					where: {
						name: {
							[Op.like]: args[0]+'%'
						}
					},

					}).then(function(data) {
							return data;
					});

					try {

						if(listSongByName.length > 1)
							{
								log.info("Plusierus résultats trouvé par rapport à la demande de l'utilisateur");
								message.channel.send(`J'ai trouvé plusieurs résultat :`)

								let result = listSongByName.map((x,index) => index+1 +' - '+ x.name).join("\n") ;

								log.trace('\n' + result );
								message.channel.send("```\nRésultats : \n" + result + "\n```");

								log.info("En attente du choix de l'utilisateur...");
								message.reply("Choisissez la musique que vous voulez en envoyant son chiffre assosié  (30 sec restante)");

								await message.channel.awaitMessages(m => m.author.id == message.author.id,
									{max: 1, time: 30000}).then(collected => {

										if(isNumber(collected.first().content))
										{
											if (collected.first().content <= listSongByName.length && collected.first().content != 0)
											{
												log.info("Choix de l'utilisateur : " + collected.first().content);
												addSong(message,queueConstruct,listSongByName[collected.first().content-1])
											}
											else
											{
												log.info("Choix incorrect, je n'ajoute rien");
												return message.channel.send("Choix incorrect, je n'ajoute rien.");
											}	
											
										}
										else
										{
											log.info("Valeur non numérique ! Je n'ajoute rien");
											return message.channel.send("Ce n'est pas un chiffre ! Je n'ajoute rien.");
										} 

									}).catch(() => {
										log.info("30 seconde écoulé, ajout de musique annulé !");
										return message.channel.send("Pas de réponse dans le temps inparti, je n'ajoute rien. ");
				
									});
								
							}
						else if(listSongByName.length == 1)
							{
								log.debug(listSongByName[0]);
								addSong(message,queueConstruct,listSongByName[0]);
							}
						else
							{
								log.info("La musique demandé n'est pas présente en base ou n'exsite pas");
								log.info("Argument de recheche entrée par l'utilisateur : " + args[0]);
								return message.channel.send(`Désolé, je ne trouve aucune correspondance par rapport à ta recherche.`);
							}
						
					} catch (error) {
						log.error(`Problème lors de l'ajout d'une musique à la queue : ${error}`);
					}
					
			}


		if (queueConstruct.songs != 0) // Pas la peine de venir sur le channel si il n'y a rien a jouer
		{
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
		
		
		}
	},
};
