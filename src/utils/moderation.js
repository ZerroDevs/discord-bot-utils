const { PermissionFlagsBits } = require('discord.js');
const { EmbedUtil } = require('./embed');

class ModerationUtil {
	static async timeout(member, duration, reason = 'No reason provided') {
		try {
			await member.timeout(duration * 1000, reason);
			return true;
		} catch (error) {
			return false;
		}
	}

	static async clearMessages(channel, amount, filter = {}) {
		try {
			const messages = await channel.messages.fetch({ limit: amount });
			let filteredMessages = messages;

			if (filter.user) {
				filteredMessages = messages.filter(msg => msg.author.id === filter.user.id);
			}
			if (filter.contains) {
				filteredMessages = messages.filter(msg => msg.content.includes(filter.contains));
			}
			if (filter.beforeDate) {
				filteredMessages = messages.filter(msg => msg.createdTimestamp < filter.beforeDate);
			}

			await channel.bulkDelete(filteredMessages);
			return filteredMessages.size;
		} catch (error) {
			return 0;
		}
	}

	static async setSlowmode(channel, duration) {
		try {
			await channel.setRateLimitPerUser(duration);
			return true;
		} catch (error) {
			return false;
		}
	}

	static parseDuration(duration) {
		const units = {
			s: 1,
			m: 60,
			h: 3600,
			d: 86400
		};

		const match = duration.match(/^(\d+)([smhd])$/);
		if (!match) return null;

		const [, amount, unit] = match;
		return parseInt(amount) * units[unit];
	}

	static validateModPermissions(member, permission) {
		return member.permissions.has(permission);
	}
}

module.exports = ModerationUtil;