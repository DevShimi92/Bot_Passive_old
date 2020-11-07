const Client = require('./struct/Client');
const fs = require("fs");
const log4js = require('log4js');
const conf_file_log = './config/log_config.json';

// On importe les valeurs du fichier de config
Client.config = require('./config/config.json');

process.title = "BOT_PASSIVE";

// Ajout du module de log
log4js.configure(conf_file_log,{});
const log = log4js.getLogger('BOT - Main');

// On créer le client et le module de commande
const client = new Client();
Client.lockScan = false;

//On liste tout les fichier de commande avec comme filtre que on veut que des ".js" 
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

//Puis on les ajoutes au module de commmande
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

//Log tout type d'erreur de promesse 
process.on('unhandledRejection', error => {
	log.error('Rejet de promesse :', error)
});


client.login(Client.config.token);

client.on('ready', () => {
  log.info(`Connecté en tant que ${client.user.tag} !`);
});


client.on('message',  message  => {

	if(message.channel.type == 'dm' ) return log.trace('Message privée  de ' + message.channel.recipient.username + ' : ' + message.toString()); 

	if (!message.content.startsWith(Client.config.prefix) || message.author.bot) return; 
	
	const args = message.content.slice(Client.config.prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (!client.commands.has(command)) return;

		try {
			log.trace(`\nCommand name: ${command}\nArguments: ${args}\nUsername: ${message.member.user.tag}\nUsername ID: ${message.member.id}`);
			log.info(`${message.member.user.tag} utilise ${command}`);
			client.commands.get(command).execute(message, args);
		} catch (error) { 
			log.error(error);
			message.channel.send(`Une erreur s'est produite lors de l'exécution de la commande ${command} !`);
		}

});