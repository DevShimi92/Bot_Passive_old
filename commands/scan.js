const Client = require('../struct/Client');
const fs = require("fs");
const log4js = require('log4js');
log4js.configure('./config/log_config.json',{});
const log = log4js.getLogger('BOT - scan');

var path = require('path');
var jsmediatags = require("jsmediatags");

const { models } = require('../db_sequelize');

async function addSongToDatabase(tabSong,idmax){

	const regex =/\b(Disc|disk|DISK) \d/g;

	let songError = new Map();

	for(let i = 0 ; i < tabSong.length ; i++) 
			{
				try {
					let tag = await getTags(tabSong[i]);

					let discNumber = 0;

					let pos = tabSong[i].search(regex);

					if ( pos > discNumber)
						discNumber = tabSong[i].slice(pos+5, pos+6)

					const songdb = { song_id : idmax,
								name : tag.tags.title,
								numberTrack : tag.tags.track,
								album : tag.tags.album,
								disc : discNumber,
								artist : tag.tags.artist,
								genre : tag.tags.genre,
								year : tag.tags.year, 
								path : tabSong[i] }

					models.song.create(songdb);
					
					log.info((i+1)+'/'+tabSong.length+' | '+tag.tags.title+' ajouté !');
					idmax++;

				} catch (error) {
					log.error((i+1)+'/'+tabSong.length+' | '+tabSong[i]+' problème rencontré !');
					songError.set('Song_'+i,{path : tabSong[i]});
					log.error(error);
				}

			}
		
			log.info("Fin de l'ajout ! ");
			if (songError.size > 0)
			{
				setTimeout(() => {
					log.error("Les musiques qui ont eu un probléme au niveau des informations a fournir : ");
					log.error(songError);	
				},3000);
				
			}
			
}

// Permet de récupérer les informations d'une musique (artiste, nom de l'album...)
function getTags(url) {      
	return new Promise((resolve, reject) => {
		new jsmediatags.Reader(url).read({
			onSuccess: (tag) => {                
				resolve(tag);
				},
			onError: (error) => {                
				reject(error);
				}
		});
	});
  }

//Récupere la liste de toutes les musiques disponible depuis le dossier indiqué (recherche dans les sous-dossiers aussi)
function getFilesFromDir(dir) {

	const fileTypes = [".mp3",".wav",".flac"];

	let tabSong = [];

	function walkDir(currentPath) {
	var files = fs.readdirSync(currentPath);
		for (var i in files) {
			
			var curFile = path.join(currentPath, files[i]);   

			if (fs.statSync(curFile).isFile() && fileTypes.indexOf(path.extname(curFile)) != -1 ) {
				
				tabSong.push(curFile);
				
			} else if (fs.statSync(curFile).isDirectory()) {
			walkDir(curFile);
			} 
		}
	}
	
	walkDir(dir);
	return tabSong;
  }




module.exports = {
	name: 'scan',
	description: "Actulise la base de donnée (utiliser -forcebdd ou -fbdd en tant qu'argument pour une réécriture de la base)",
	usage: `${Client.config.prefix}scan [args]`,
	async execute(message, args) {

		if(Client.lockScan == true)
		{
			log.error("Commande déja en cours d'exécution ! Demande bloqué ! ");
			message.channel.send('Commande bloqué car déja en cours !');
			return;
		}
		else
		{
		
			Client.lockScan = true;

			const ScanFolder = Client.config.scanFolder;

			let modeForce = false ;

			log.info('Début du scan du dossier...');

			let tabSong = getFilesFromDir(ScanFolder);

			log.info("Scan terminé ! Début de l'ajout des musiques en base ...");

			if (args[0] == '-forcebdd' || args[0] == '-fbdd')
			{
				log.warn("Demande d'ajout de musique en mode force : Confirmation en cours... ");
				
				message.reply("Confirmation de l'usage forcé de la commande ? [OUI ou NE REPONDEZ PAS] (10 sec)");

				await message.channel.awaitMessages(m => m.author.id == message.author.id,
					{max: 1, time: 10000}).then(collected => {
							// only accept messages by the user who sent the command
							// accept only 1 message, and return the promise after 30000ms = 30s

							// first (and, in this case, only) message of the collection
							if (collected.first().content.toLowerCase() == 'oui') {
								log.warn("Demande d'ajout de musique en mode force : Confirmation confirmé ! ")

								modeForce = true ;

							}
							else
							{
								log.warn("Demande d'ajout de musique en mode force : Confirmation négatif ! Scan annulé !")
								Client.lockScan = false;
								return message.reply('Scan annulé !'); 
							}
							
					}).catch(() => {
							log.warn("Demande d'ajout de musique en mode force : Pas de réponse ! Scan annulé !")
							Client.lockScan = false;
							return message.reply('Pas de réponse ! Scan annulé !');
							
					});

				if (modeForce == false)
					return;
				
			}


				if (modeForce == true)
					await models.song.sync({ force: true });

				let idmax = models.song.max('song_id');
				
				if(isNaN(idmax))
					idmax = 0 ;
				
				if(tabSong.length > 100)
					message.channel.send('Scan en cours...Veuillez patienter...');  
					
				await addSongToDatabase(tabSong,idmax);

				Client.lockScan = false;

				return message.channel.send('Scan terminé !');  

		}
	
	},
};
