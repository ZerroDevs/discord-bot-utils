const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

class InteractionUtil {
	static async getRoleInfo(role) {
		const members = await role.guild.members.fetch();
		const membersWithRole = members.filter(member => member.roles.cache.has(role.id));

		return {
			name: role.name,
			id: role.id,
			color: role.hexColor,
			position: role.position,
			memberCount: membersWithRole.size,
			mentionable: role.mentionable,
			hoisted: role.hoist,
			managed: role.managed,
			createdAt: role.createdAt,
			permissions: role.permissions.toArray()
		};
	}

	static createRoleInfoEmbed(roleInfo) {
		return new EmbedBuilder()
			.setTitle(`Role Information: ${roleInfo.name}`)
			.setColor(roleInfo.color)
			.addFields([
				{ name: 'Members', value: roleInfo.memberCount.toString(), inline: true },
				{ name: 'Position', value: roleInfo.position.toString(), inline: true },
				{ name: 'Color', value: roleInfo.color, inline: true },
				{ name: 'Mentionable', value: roleInfo.mentionable ? 'Yes' : 'No', inline: true },
				{ name: 'Hoisted', value: roleInfo.hoisted ? 'Yes' : 'No', inline: true },
				{ name: 'Managed', value: roleInfo.managed ? 'Yes' : 'No', inline: true },
				{ name: 'Created At', value: roleInfo.createdAt.toLocaleDateString(), inline: true },
				{ name: 'Key Permissions', value: roleInfo.permissions.join(', ') || 'None' }
			])
			.setTimestamp();
	}

	static createPoll(question, options) {
		const embed = new EmbedBuilder()
			.setTitle('📊 Poll')
			.setDescription(question)
			.setColor('#00ff00')
			.setTimestamp();

		const buttons = options.map((option, index) => {
			return new ButtonBuilder()
				.setCustomId(`poll_${index}`)
				.setLabel(`${option} (0)`)
				.setStyle(ButtonStyle.Primary);
		});

		const rows = [];
		for (let i = 0; i < buttons.length; i += 5) {
			const row = new ActionRowBuilder().addComponents(buttons.slice(i, i + 5));
			rows.push(row);
		}

		return {
			embed,
			components: rows
		};
	}

	static updatePollResults(interaction, votes) {
		const embed = EmbedBuilder.from(interaction.message.embeds[0]);
		const components = interaction.message.components.map(row => {
			const newRow = new ActionRowBuilder();
			row.components.forEach(button => {
				const optionIndex = parseInt(button.customId.split('_')[1]);
				const optionText = button.label.split(' (')[0];
				const voteCount = votes.get(optionIndex) || 0;
				
				newRow.addComponents(
					new ButtonBuilder()
						.setCustomId(button.customId)
						.setLabel(`${optionText} (${voteCount})`)
						.setStyle(ButtonStyle.Primary)
				);
			});
			return newRow;
		});

		return {
			embed,
			components
		};
	}
}

module.exports = InteractionUtil;