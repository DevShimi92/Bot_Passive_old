const { Client, Collection } = require('discord.js');

module.exports = class extends Client {
	constructor(lockScan,config) {
		super({
			disableMentions: 'everyone'
		});

		this.commands = new Collection();

		this.queue = new Map();

		this.config = config;

		this.lockScan = lockScan;

	}
};