const { EmbedBuilder } = require('discord.js');

class EmbedUtil {
	static createBasicEmbed(title, description, color = '#0099ff') {
		return new EmbedBuilder()
			.setTitle(title)
			.setDescription(description)
			.setColor(color)
			.setTimestamp();
	}

	static createErrorEmbed(message) {
		return this.createBasicEmbed('Error', message, '#ff0000');
	}

	static createSuccessEmbed(message) {
		return this.createBasicEmbed('Success', message, '#00ff00');
	}

	static createWarningEmbed(message) {
		return this.createBasicEmbed('Warning', message, '#ffff00');
	}

	static createInfoEmbed(message) {
		return this.createBasicEmbed('Information', message, '#0099ff');
	}

	static createCustomEmbed({ title, description, color, fields, thumbnail, image, footer, author, url }) {
		const embed = new EmbedBuilder()
			.setTitle(title || '')
			.setDescription(description || '')
			.setColor(color || '#0099ff')
			.setTimestamp();

		if (fields) embed.addFields(fields);
		if (thumbnail) embed.setThumbnail(thumbnail);
		if (image) embed.setImage(image);
		if (footer) embed.setFooter(footer);
		if (author) embed.setAuthor(author);
		if (url) embed.setURL(url);

		return embed;
	}

	static createLoadingEmbed(message = 'Loading...') {
		return this.createBasicEmbed('Loading', `${message} ⏳`, '#ffa500');
	}

	static createServerInfoEmbed(guild) {
		return this.createCustomEmbed({
			title: guild.name,
			thumbnail: guild.iconURL({ dynamic: true }),
			fields: [
				{ name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
				{ name: 'Members', value: guild.memberCount.toString(), inline: true },
				{ name: 'Created At', value: guild.createdAt.toLocaleDateString(), inline: true },
				{ name: 'Boost Level', value: guild.premiumTier.toString(), inline: true },
				{ name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
				{ name: 'Channels', value: guild.channels.cache.size.toString(), inline: true }
			]
		});
	}

	static createUserInfoEmbed(member) {
		return this.createCustomEmbed({
			title: member.user.tag,
			thumbnail: member.user.displayAvatarURL({ dynamic: true }),
			fields: [
				{ name: 'Joined Server', value: member.joinedAt.toLocaleDateString(), inline: true },
				{ name: 'Account Created', value: member.user.createdAt.toLocaleDateString(), inline: true },
				{ name: 'Roles', value: member.roles.cache.map(r => r.name).join(', ') || 'None' }
			]
		});
	}
}

module.exports = EmbedUtil;