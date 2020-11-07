const Client = require('../struct/Client');
const log4js = require('log4js');
log4js.configure('./config/log_config.json',{});
const log = log4js.getLogger('BOT - help');

module.exports = {
	name: 'help',
	description: 'Liste des commandes avec description',
	usage: `${Client.config.prefix}help`,
	execute(message) {

		const msg = message.client.commands.map(command => command.name +' - '+ command.usage +' - '+command.description).join("\n");

		log.info("\n"+msg);

		message.channel.send("```\nListe des commandes: \n" +`Nom - Exemple d'utilisation - Description \n`+ msg + "\n```");

	},
}