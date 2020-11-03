const { Client, Collection } = require('discord.js');

module.exports = class extends Client {
	constructor(lockScan) {
		super({
			disableMentions: 'everyone'
		});

		this.commands = new Collection();

		this.queue = new Map();

		this.lockScan = lockScan;

	}
};