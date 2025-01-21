const { EmbedUtil } = require('./embed');
const { TaxUtil } = require('../index');
const { ModerationUtil } = require('../index');
const { InteractionUtil } = require('../index');
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

	static async handleTax(interaction, options = { userDefined: false, fixedRate: 15 }) {
		const amount = interaction.options.getNumber('amount');
		const taxRate = options.userDefined ? interaction.options.getNumber('tax_rate') : options.fixedRate;
		const displayType = interaction.options.getString('display') || 'embed';

		const taxInfo = TaxUtil.calculateTax(amount, taxRate);

		if (displayType === 'message') {
			return interaction.reply(TaxUtil.createTaxMessageResponse(taxInfo));
		} else {
			return interaction.reply({ embeds: [TaxUtil.createTaxEmbed(taxInfo)] });
		}
	}

	static async handleTimeout(interaction) {
		const member = interaction.options.getMember('user');
		const duration = interaction.options.getString('duration');
		const reason = interaction.options.getString('reason') || 'No reason provided';

		if (!ModerationUtil.validateModPermissions(interaction.member, PermissionFlagsBits.ModerateMembers)) {
			return interaction.reply({ 
				embeds: [EmbedUtil.createErrorEmbed('You do not have permission to timeout members!')],
				ephemeral: true 
			});
		}

		const parsedDuration = ModerationUtil.parseDuration(duration);
		if (!parsedDuration) {
			return interaction.reply({ 
				embeds: [EmbedUtil.createErrorEmbed('Invalid duration format! Use 1s, 1m, 1h, or 1d')],
				ephemeral: true 
			});
		}

		const success = await ModerationUtil.timeout(member, parsedDuration, reason);
		if (success) {
			return interaction.reply({ 
				embeds: [EmbedUtil.createSuccessEmbed(`Successfully timed out ${member.user.tag} for ${duration}\nReason: ${reason}`)]
			});
		} else {
			return interaction.reply({ 
				embeds: [EmbedUtil.createErrorEmbed('Failed to timeout the user!')],
				ephemeral: true 
			});
		}
	}

	static async handleClear(interaction) {
		const amount = interaction.options.getInteger('amount');
		const user = interaction.options.getUser('user');
		const contains = interaction.options.getString('contains');

		if (!ModerationUtil.validateModPermissions(interaction.member, PermissionFlagsBits.ManageMessages)) {
			return interaction.reply({ 
				embeds: [EmbedUtil.createErrorEmbed('You do not have permission to manage messages!')],
				ephemeral: true 
			});
		}

		const filter = {
			user: user || null,
			contains: contains || null
		};

		const deleted = await ModerationUtil.clearMessages(interaction.channel, amount, filter);
		return interaction.reply({ 
			embeds: [EmbedUtil.createSuccessEmbed(`Successfully deleted ${deleted} messages`)],
			ephemeral: true 
		});
	}

	static async handleRoleInfo(interaction) {
        const role = interaction.options.getRole('role');
        
        try {
            const roleInfo = await InteractionUtil.getRoleInfo(role);
            const embed = InteractionUtil.createRoleInfoEmbed(roleInfo);
            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            return interaction.reply({ 
                embeds: [EmbedUtil.createErrorEmbed('Failed to fetch role information!')],
                ephemeral: true 
            });
        }
    }

    static async handlePoll(interaction) {
        const question = interaction.options.getString('question');
        const optionsString = interaction.options.getString('options') || 'Yes,No';
        const options = optionsString.split(',').map(opt => opt.trim());

        if (options.length > 10) {
            return interaction.reply({ 
                embeds: [EmbedUtil.createErrorEmbed('Maximum 10 options allowed!')],
                ephemeral: true 
            });
        }

        const poll = InteractionUtil.createPoll(question, options);
        const message = await interaction.reply({ 
            embeds: [poll.embed], 
            components: poll.components,
            fetchReply: true 
        });

        const votes = new Map();
        const userVotes = new Map();

        const collector = message.createMessageComponentCollector({ time: 24 * 60 * 60 * 1000 }); // 24 hours

        collector.on('collect', async i => {
            const optionIndex = parseInt(i.customId.split('_')[1]);
            
            // Remove previous vote if exists
            if (userVotes.has(i.user.id)) {
                const previousVote = userVotes.get(i.user.id);
                votes.set(previousVote, (votes.get(previousVote) || 1) - 1);
            }

            // Add new vote
            votes.set(optionIndex, (votes.get(optionIndex) || 0) + 1);
            userVotes.set(i.user.id, optionIndex);

            const updated = InteractionUtil.updatePollResults(i, votes);
            await i.update({ 
                embeds: [updated.embed], 
                components: updated.components 
            });
        });
    }

	static async handleSlowmode(interaction) {
		const duration = interaction.options.getString('duration');

		if (!ModerationUtil.validateModPermissions(interaction.member, PermissionFlagsBits.ManageChannels)) {
			return interaction.reply({ 
				embeds: [EmbedUtil.createErrorEmbed('You do not have permission to manage channels!')],
				ephemeral: true 
			});
		}

		const parsedDuration = ModerationUtil.parseDuration(duration);
		if (!parsedDuration) {
			return interaction.reply({ 
				embeds: [EmbedUtil.createErrorEmbed('Invalid duration format! Use 1s, 1m, 1h, or 1d')],
				ephemeral: true 
			});
		}

		const success = await ModerationUtil.setSlowmode(interaction.channel, parsedDuration);
		if (success) {
			return interaction.reply({ 
				embeds: [EmbedUtil.createSuccessEmbed(`Set slowmode to ${duration}`)]
			});
		} else {
			return interaction.reply({ 
				embeds: [EmbedUtil.createErrorEmbed('Failed to set slowmode!')],
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
			},
			{
				name: 'tax',
				description: 'Calculate tax on an amount',
				options: [
					{
						name: 'amount',
						type: 10, // NUMBER type
						description: 'The amount to calculate tax on',
						required: true
					},
					{
						name: 'tax_rate',
						type: 10,
						description: 'Custom tax rate percentage',
						required: false
					},
					{
						name: 'display',
						type: 3, // STRING type
						description: 'Display style (embed/message)',
						required: false,
						choices: [
							{ name: 'Embed', value: 'embed' },
							{ name: 'Message', value: 'message' }
						]
					}
				]
			},
			{
				name: 'timeout',
				description: 'Timeout a user',
				options: [
					{
						name: 'user',
						type: 6,
						description: 'The user to timeout',
						required: true
					},
					{
						name: 'duration',
						type: 3,
						description: 'Duration (1s, 1m, 1h, 1d)',
						required: true
					},
					{
						name: 'reason',
						type: 3,
						description: 'Reason for timeout',
						required: false
					}
				]
			},
			{
				name: 'clear',
				description: 'Clear messages',
				options: [
					{
						name: 'amount',
						type: 4,
						description: 'Number of messages to delete',
						required: true
					},
					{
						name: 'user',
						type: 6,
						description: 'Filter messages by user',
						required: false
					},
					{
						name: 'contains',
						type: 3,
						description: 'Filter messages containing text',
						required: false
					}
				]
			},
			{
				name: 'slowmode',
				description: 'Set channel slowmode',
				options: [
					{
						name: 'duration',
						type: 3,
						description: 'Duration (1s, 1m, 1h, 1d)',
						required: true
					}
				]
			},
			{
				name: 'roleinfo',
				description: 'Get information about a role',
				options: [{
					name: 'role',
					type: 8, // ROLE type
					description: 'The role to get information about',
					required: true
				}]
			},
			{
				name: 'poll',
				description: 'Create a poll',
				options: [
					{
						name: 'question',
						type: 3,
						description: 'The poll question',
						required: true
					},
					{
						name: 'options',
						type: 3,
						description: 'Comma-separated options (max 10)',
						required: false
					}
				]
			}
		];
	}
}

module.exports = PresetCommands;