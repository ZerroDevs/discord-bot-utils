const { Client, GatewayIntentBits } = require('discord.js');
const { InteractionUtil, EmbedUtil } = require('../src/index.js');
require('dotenv').config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers
	]
});

// Example: Create a quick poll with command
client.on('messageCreate', async message => {
	if (message.author.bot) return;

	if (message.content.startsWith('!quickpoll')) {
		const args = message.content.split('"').filter(arg => arg.trim());
		if (args.length < 2) {
			return message.reply('Usage: !quickpoll "Question" "Option1,Option2,Option3"');
		}

		const question = args[1];
		const options = args[2]?.split(',').map(opt => opt.trim()) || ['Yes', 'No'];

		if (options.length > 10) {
			return message.reply('Maximum 10 options allowed!');
		}

		const poll = InteractionUtil.createPoll(question, options);
		const pollMessage = await message.channel.send({
			embeds: [poll.embed],
			components: poll.components
		});

		// Track votes
		const votes = new Map();
		const userVotes = new Map();

		const collector = pollMessage.createMessageComponentCollector({
			time: 24 * 60 * 60 * 1000 // 24 hours
		});

		collector.on('collect', async interaction => {
			const optionIndex = parseInt(interaction.customId.split('_')[1]);

			// Remove previous vote if exists
			if (userVotes.has(interaction.user.id)) {
				const previousVote = userVotes.get(interaction.user.id);
				votes.set(previousVote, (votes.get(previousVote) || 1) - 1);
			}

			// Add new vote
			votes.set(optionIndex, (votes.get(optionIndex) || 0) + 1);
			userVotes.set(interaction.user.id, optionIndex);

			const updated = InteractionUtil.updatePollResults(interaction, votes);
			await interaction.update({
				embeds: [updated.embed],
				components: updated.components
			});
		});
	}
});

// Example: Role information command
client.on('messageCreate', async message => {
	if (message.author.bot) return;

	if (message.content.startsWith('!roleinfo')) {
		const role = message.mentions.roles.first();
		if (!role) {
			return message.reply('Please mention a role to get information about.');
		}

		try {
			const roleInfo = await InteractionUtil.getRoleInfo(role);
			const embed = InteractionUtil.createRoleInfoEmbed(roleInfo);
			await message.reply({ embeds: [embed] });
		} catch (error) {
			await message.reply({
				embeds: [EmbedUtil.createErrorEmbed('Failed to fetch role information!')]
			});
		}
	}
});

// Example: Create a timed poll
client.on('messageCreate', async message => {
	if (message.author.bot) return;

	if (message.content.startsWith('!timedpoll')) {
		const duration = 5 * 60 * 1000; // 5 minutes
		const poll = InteractionUtil.createPoll('Quick 5-minute poll!', ['Option 1', 'Option 2']);
		
		const pollMessage = await message.channel.send({
			content: '⏰ This poll will end in 5 minutes!',
			embeds: [poll.embed],
			components: poll.components
		});

		const votes = new Map();
		const userVotes = new Map();

		const collector = pollMessage.createMessageComponentCollector({
			time: duration
		});

		collector.on('collect', async interaction => {
			const optionIndex = parseInt(interaction.customId.split('_')[1]);
			
			if (userVotes.has(interaction.user.id)) {
				const previousVote = userVotes.get(interaction.user.id);
				votes.set(previousVote, (votes.get(previousVote) || 1) - 1);
			}

			votes.set(optionIndex, (votes.get(optionIndex) || 0) + 1);
			userVotes.set(interaction.user.id, optionIndex);

			const updated = InteractionUtil.updatePollResults(interaction, votes);
			await interaction.update({
				embeds: [updated.embed],
				components: updated.components
			});
		});

		collector.on('end', async () => {
			await pollMessage.edit({
				content: '🔒 Poll has ended!',
				components: [] // Remove buttons
			});
		});
	}
});

client.login(process.env.DISCORD_TOKEN);