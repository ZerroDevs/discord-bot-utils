const { Client, GatewayIntentBits } = require('discord.js');
const { ModerationUtil, EmbedUtil } = require('../src/index.js');
require('dotenv').config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers
	]
});

// Example of using moderation utilities directly
client.on('messageCreate', async message => {
	if (message.author.bot) return;

	// Example: Auto-moderate messages
	if (message.content.includes('bad-word')) {
		// Timeout user for 5 minutes
		const success = await ModerationUtil.timeout(message.member, 300, 'Using inappropriate language');
		if (success) {
			await message.channel.send({
				embeds: [EmbedUtil.createWarningEmbed('User has been timed out for inappropriate language')]
			});
		}
	}

	// Example: Clear messages containing specific content
	if (message.content === '!clear-spam') {
		const deleted = await ModerationUtil.clearMessages(message.channel, 100, {
			contains: 'spam'
		});
		await message.channel.send(`Deleted ${deleted} spam messages`);
	}
});

// Example: Auto-slowmode based on message frequency
const messageCount = new Map();
const THRESHOLD = 10;
const INTERVAL = 30000; // 30 seconds

client.on('messageCreate', async message => {
	if (message.author.bot) return;

	const key = `${message.channel.id}`;
	const count = (messageCount.get(key) || 0) + 1;
	messageCount.set(key, count);

	// If more than THRESHOLD messages in INTERVAL
	if (count >= THRESHOLD) {
		await ModerationUtil.setSlowmode(message.channel, 10); // 10 seconds slowmode
		await message.channel.send({
			embeds: [EmbedUtil.createWarningEmbed('Slowmode enabled due to high message frequency')]
		});
	}

	// Reset counter after INTERVAL
	setTimeout(() => messageCount.set(key, 0), INTERVAL);
});

client.login(process.env.DISCORD_TOKEN);