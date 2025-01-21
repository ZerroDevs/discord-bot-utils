const { Client, GatewayIntentBits } = require('discord.js');
const { LoggerUtil, PresetCommands } = require('../src/index.js');
require('dotenv').config();

// Initialize the client
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// Initialize logger before bot starts
async function initializeLogger() {
	await LoggerUtil.initialize({
		logDirectory: 'bot-logs',
		webhookUrl: process.env.LOG_WEBHOOK_URL,
		errorWebhookUrl: process.env.ERROR_WEBHOOK_URL,
		maxLogAge: 7
	});
}

// Wrap command handlers with logger
const wrappedCommands = {
	ping: LoggerUtil.createCommandLogger(PresetCommands.handlePing),
	avatar: LoggerUtil.createCommandLogger(PresetCommands.handleAvatar),
	// Add more wrapped commands as needed
};

// Command handling with logging
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	try {
		// Log command usage
		await LoggerUtil.log('info', 'Command received', {
			command: interaction.commandName,
			user: interaction.user.tag,
			guild: interaction.guild?.name
		});

		// Execute wrapped command
		if (wrappedCommands[interaction.commandName]) {
			await wrappedCommands[interaction.commandName](interaction);
		}
	} catch (error) {
		// Error will be automatically logged by the wrapper
		console.error('Command execution failed:', error);
	}
});

// Example of different log levels
client.on('ready', async () => {
	await LoggerUtil.log('info', `Bot is ready as ${client.user.tag}`);
});

client.on('error', async error => {
	await LoggerUtil.error(error, { source: 'Discord Client' });
});

// Example of custom event logging
client.on('guildCreate', async guild => {
	await LoggerUtil.log('info', 'Bot added to new guild', {
		guildId: guild.id,
		guildName: guild.name,
		memberCount: guild.memberCount
	});
});

// Example of warning logging
client.on('warn', async warning => {
	await LoggerUtil.log('warning', warning, {
		timestamp: new Date().toISOString()
	});
});

// Initialize logger and start bot
async function start() {
	try {
		await initializeLogger();
		await client.login(process.env.DISCORD_TOKEN);
	} catch (error) {
		console.error('Failed to start bot:', error);
		process.exit(1);
	}
}

start();