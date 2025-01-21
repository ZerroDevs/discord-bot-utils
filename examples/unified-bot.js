const { Client, GatewayIntentBits, REST, Routes, ButtonStyle } = require('discord.js');
const { ButtonUtil, CommandHandler, EmbedUtil, MessageUtil, PaginationHandler, PresetCommands } = require('../src/index.js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Combine preset commands with custom commands
const commands = [
	...PresetCommands.getPresetCommands(),
	{
		name: 'test',
		description: 'Test command to demonstrate utilities'
	},
	{
		name: 'buttons',
		description: 'Test button utilities'
	},
	{
		name: 'countdown',
		description: 'Start a countdown timer',
		options: [{
			name: 'seconds',
			type: 4,
			description: 'Number of seconds',
			required: true
		}]
	},
	{
		name: 'typing',
		description: 'Demonstrate typing effect'
	},
	{
		name: 'serverinfo',
		description: 'Show server information'
	},
	{
		name: 'userinfo',
		description: 'Show user information'
	}
];

// Create Discord client
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers
	]
});

// Command registration function
async function deployCommands() {
	try {
		console.log('Started refreshing application (/) commands.');
		const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
		await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commands }
		);
		console.log('Successfully registered application (/) commands.');
	} catch (error) {
		console.error('Error registering commands:', error);
	}
}

// Command handling
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	// Track command usage
	CommandHandler.trackCommandUsage(interaction.user.id, interaction.commandName);

	try {
		switch(interaction.commandName) {
			case 'test':
				const pages = [
					EmbedUtil.createInfoEmbed('Welcome to Discord Bot Utils'),
					EmbedUtil.createWarningEmbed('This is a warning example'),
					EmbedUtil.createCustomEmbed({
						title: 'Custom Embed',
						description: 'This is a custom embed example',
						fields: [{ name: 'Usage', value: CommandHandler.getCommandStats('test').totalUses.toString() }],
						footer: { text: 'Custom Footer' }
					})
				];
				await PaginationHandler.createPagination(interaction, pages, { showPageNumbers: true });
				break;

			case 'buttons':
				const menuOptions = [
					{ label: 'Option 1', customId: 'opt_1', emoji: '1️⃣' },
					{ label: 'Option 2', customId: 'opt_2', emoji: '2️⃣' },
					{ label: 'Option 3', customId: 'opt_3', emoji: '3️⃣' }
				];
				const menuRow = ButtonUtil.createMenuButtons(menuOptions);
				const pollRow = ButtonUtil.createPollButtons(['Yes', 'No', 'Maybe']);
				
				await interaction.reply({
					content: 'Test our button utilities!',
					components: [menuRow, pollRow]
				});
				break;

			case 'countdown':
				const seconds = interaction.options.getInteger('seconds');
				await MessageUtil.createCountdown(interaction, seconds, {
					startMessage: '⏰ Countdown started!',
					endMessage: '⏰ Time\'s up!'
				});
				break;

			case 'typing':
				await interaction.deferReply();
				const messages = [
					'This is the first message...',
					'This is the second message...',
					'And this is the final message!'
				];
				await MessageUtil.createTypingEffect(interaction.channel, messages, {
					deleteAfter: true,
					deleteDelay: 10000
				});
				await interaction.editReply('Typing effect completed!');
				break;

			case 'serverinfo':
				const serverEmbed = EmbedUtil.createServerInfoEmbed(interaction.guild);
				await interaction.reply({ embeds: [serverEmbed] });
				break;

			case 'userinfo':
				const userEmbed = EmbedUtil.createUserInfoEmbed(interaction.member);
				await interaction.reply({ embeds: [userEmbed] });
				break;
		}
	} catch (error) {
		console.error(`Error executing ${interaction.commandName}:`, error);
		await interaction.reply({ 
			embeds: [EmbedUtil.createErrorEmbed('An error occurred while executing the command.')],
			ephemeral: true 
		});
	}
});

// Button interaction handling
client.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return;

	try {
		if (interaction.customId.startsWith('poll_')) {
			const option = interaction.customId.split('_')[1];
			await interaction.reply(`You voted for option ${parseInt(option) + 1}!`);
		} else if (interaction.customId.startsWith('opt_')) {
			await interaction.reply(`You selected option ${interaction.customId.split('_')[1]}!`);
		}
	} catch (error) {
		console.error('Error handling button:', error);
	}
});

// Ready event
client.once('ready', async () => {
	console.log(`Logged in as ${client.user.tag}`);
	await deployCommands();
});

// Error handling
client.on('error', error => {
	console.error('Discord client error:', error);
});

// Login
client.login(process.env.DISCORD_TOKEN)
	.catch(error => {
		console.error('Failed to login:', error);
	});
