const { EmbedUtil } = require('./embed');
const { PermissionFlagsBits } = require('discord.js');

class PresetCommands {
	static async handlePing(interaction) {
		const ping = interaction.client.ws.ping;
		const embed = EmbedUtil.createInfoEmbed('🏓 Pong!', `Latency: ${ping}ms`);
		return interaction.reply({ embeds: [embed] });
	}

	static async handleAvatar(interaction) {
		const user = interaction.options.getUser('user') || interaction.user;
		const embed = EmbedUtil.createCustomEmbed({
			title: `${user.username}'s Avatar`,
			image: user.displayAvatarURL({ dynamic: true, size: 4096 }),
			color: '#00ff00'
		});
		return interaction.reply({ embeds: [embed] });
	}

	static async handleKick(interaction) {
		const member = interaction.options.getMember('user');
		const reason = interaction.options.getString('reason') || 'No reason provided';

		if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
			return interaction.reply({ 
				embeds: [EmbedUtil.createErrorEmbed('You do not have permission to kick members!')],
				ephemeral: true 
			});
		}

		if (!member.kickable) {
			return interaction.reply({ 
				embeds: [EmbedUtil.createErrorEmbed('I cannot kick this user!')],
				ephemeral: true 
			});
		}

		await member.kick(reason);
		return interaction.reply({ 
			embeds: [EmbedUtil.createSuccessEmbed(`Successfully kicked ${member.user.tag}\nReason: ${reason}`)]
		});
	}

	static async handleBan(interaction) {
		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason') || 'No reason provided';
		const days = interaction.options.getInteger('days') || 0;

		if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
			return interaction.reply({ 
				embeds: [EmbedUtil.createErrorEmbed('You do not have permission to ban members!')],
				ephemeral: true 
			});
		}

		try {
			await interaction.guild.members.ban(user, { reason, deleteMessageDays: days });
			return interaction.reply({ 
				embeds: [EmbedUtil.createSuccessEmbed(`Successfully banned ${user.tag}\nReason: ${reason}`)]
			});
		} catch (error) {
			return interaction.reply({ 
				embeds: [EmbedUtil.createErrorEmbed('Failed to ban the user!')],
				ephemeral: true 
			});
		}
	}

	static async handleShortLink(interaction) {
		const url = interaction.options.getString('url');
		try {
			const response = await fetch('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url));
			const shortUrl = await response.text();
			return interaction.reply({ 
				embeds: [EmbedUtil.createSuccessEmbed(`Original URL: ${url}\nShortened URL: ${shortUrl}`)]
			});
		} catch (error) {
			return interaction.reply({ 
				embeds: [EmbedUtil.createErrorEmbed('Failed to shorten the URL!')],
				ephemeral: true 
			});
		}
	}

	static getPresetCommands() {
		return [
			{
				name: 'ping',
				description: 'Check bot latency'
			},
			{
				name: 'avatar',
				description: 'Get user avatar',
				options: [{
					name: 'user',
					type: 6, // USER type
					description: 'The user to get avatar for',
					required: false
				}]
			},
			{
				name: 'kick',
				description: 'Kick a member',
				options: [
					{
						name: 'user',
						type: 6,
						description: 'The user to kick',
						required: true
					},
					{
						name: 'reason',
						type: 3, // STRING type
						description: 'Reason for kick',
						required: false
					}
				]
			},
			{
				name: 'ban',
				description: 'Ban a user',
				options: [
					{
						name: 'user',
						type: 6,
						description: 'The user to ban',
						required: true
					},
					{
						name: 'reason',
						type: 3,
						description: 'Reason for ban',
						required: false
					},
					{
						name: 'days',
						type: 4, // INTEGER type
						description: 'Number of days of messages to delete',
						required: false,
						choices: [
							{ name: 'None', value: 0 },
							{ name: '1 day', value: 1 },
							{ name: '7 days', value: 7 }
						]
					}
				]
			},
			{
				name: 'shortlink',
				description: 'Shorten a URL',
				options: [{
					name: 'url',
					type: 3,
					description: 'The URL to shorten',
					required: true
				}]
			}
		];
	}
}

module.exports = PresetCommands;