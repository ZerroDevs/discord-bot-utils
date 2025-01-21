const { Client, GatewayIntentBits } = require('discord.js');
const { 
	ModerationUtil, 
	InteractionUtil, 
	EmbedUtil,
	LoggerUtil 
} = require('../src/index.js');
require('dotenv').config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers
	]
});

// Initialize logger
async function init() {
	await LoggerUtil.initialize({
		logDirectory: 'bot-logs',
		webhookUrl: process.env.LOG_WEBHOOK_URL,
		errorWebhookUrl: process.env.ERROR_WEBHOOK_URL
	});
}

// Command handler with prefix
const prefix = '!';
const commands = {
	// Moderation Commands
	'timeout': async (message, args) => {
		const member = message.mentions.members.first();
		const duration = args[1];
		const reason = args.slice(2).join(' ') || 'No reason provided';
		
		const parsedDuration = ModerationUtil.parseDuration(duration);
		if (!parsedDuration) {
			return message.reply('Invalid duration format! Use 1s, 1m, 1h, or 1d');
		}

		const success = await ModerationUtil.timeout(member, parsedDuration, reason);
		await LoggerUtil.log('info', `Timeout command used`, { 
			moderator: message.author.tag,
			target: member.user.tag,
			duration,
			reason 
		});
		
		return message.reply(success ? 'User timed out successfully!' : 'Failed to timeout user.');
	},

	'clear': async (message, args) => {
		const amount = parseInt(args[0]);
		const filter = {
			user: message.mentions.users.first(),
			contains: args.slice(1).join(' ')
		};

		const deleted = await ModerationUtil.clearMessages(message.channel, amount, filter);
		await LoggerUtil.log('info', `Clear command used`, { 
			moderator: message.author.tag,
			amount: deleted 
		});
		
		return message.reply(`Deleted ${deleted} messages.`);
	},

	'slowmode': async (message, args) => {
		const duration = ModerationUtil.parseDuration(args[0]);
		if (!duration) {
			return message.reply('Invalid duration format! Use 1s, 1m, 1h, or 1d');
		}

		const success = await ModerationUtil.setSlowmode(message.channel, duration);
		await LoggerUtil.log('info', `Slowmode command used`, { 
			moderator: message.author.tag,
			duration: args[0] 
		});
		
		return message.reply(success ? `Slowmode set to ${args[0]}` : 'Failed to set slowmode.');
	},

	// Role Information Command
	'roleinfo': async (message) => {
		const role = message.mentions.roles.first();
		if (!role) return message.reply('Please mention a role!');

		try {
			const roleInfo = await InteractionUtil.getRoleInfo(role);
			const embed = InteractionUtil.createRoleInfoEmbed(roleInfo);
			await message.reply({ embeds: [embed] });
			
			await LoggerUtil.log('info', `Role info requested`, { 
				user: message.author.tag,
				role: role.name 
			});
		} catch (error) {
			await LoggerUtil.error(error, { command: 'roleinfo' });
			return message.reply('Failed to fetch role information!');
		}
	},

	// Poll Commands
	'poll': async (message, args) => {
		const question = args.join(' ');
		const poll = InteractionUtil.createPoll(question, ['👍 Yes', '👎 No']);
		
		const pollMessage = await message.channel.send({
			embeds: [poll.embed],
			components: poll.components
		});

		const votes = new Map();
		const userVotes = new Map();

		const collector = pollMessage.createMessageComponentCollector({ time: 3600000 }); // 1 hour

		collector.on('collect', async interaction => {
			if (userVotes.has(interaction.user.id)) {
				const previousVote = userVotes.get(interaction.user.id);
				votes.set(previousVote, (votes.get(previousVote) || 1) - 1);
			}

			const optionIndex = parseInt(interaction.customId.split('_')[1]);
			votes.set(optionIndex, (votes.get(optionIndex) || 0) + 1);
			userVotes.set(interaction.user.id, optionIndex);

			const updated = InteractionUtil.updatePollResults(interaction, votes);
			await interaction.update({
				embeds: [updated.embed],
				components: updated.components
			});

			await LoggerUtil.log('info', `Poll vote recorded`, {
				user: interaction.user.tag,
				option: optionIndex
			});
		});
	}
};

// Command handler
client.on('messageCreate', async message => {
	if (message.author.bot || !message.content.startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	try {
		if (commands[command]) {
			await commands[command](message, args);
		}
	} catch (error) {
		await LoggerUtil.error(error, { 
			command,
			user: message.author.tag,
			args 
		});
		message.reply('An error occurred while executing the command.');
	}
});

// Error handling
client.on('error', async error => {
	await LoggerUtil.error(error, { source: 'Discord Client' });
});

// Initialize and start
init().then(() => {
	client.login(process.env.DISCORD_TOKEN);
	LoggerUtil.log('info', 'Bot started successfully');
});