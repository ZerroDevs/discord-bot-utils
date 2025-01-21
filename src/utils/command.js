const { PermissionsBitField } = require('discord.js');

class CommandHandler {
	static cooldowns = new Map();
	static commandUsage = new Map();

	static validatePermissions(member, permissions) {
		if (!Array.isArray(permissions)) {
			throw new Error('Permissions must be an array');
		}

		for (const permission of permissions) {
			if (!member.permissions.has(permission)) {
				return false;
			}
		}
		return true;
	}

	static checkCooldown(userId, commandName, cooldownTime) {
		const key = `${userId}-${commandName}`;
		const cooldownAmount = cooldownTime * 1000;
		
		if (this.cooldowns.has(key)) {
			const expirationTime = this.cooldowns.get(key) + cooldownAmount;
			if (Date.now() < expirationTime) {
				const timeLeft = (expirationTime - Date.now()) / 1000;
				return timeLeft;
			}
		}
		
		this.cooldowns.set(key, Date.now());
		setTimeout(() => this.cooldowns.delete(key), cooldownAmount);
		return 0;
	}

	static getRemainingCooldowns(userId) {
		const userCooldowns = {};
		this.cooldowns.forEach((value, key) => {
			if (key.startsWith(userId)) {
				const commandName = key.split('-')[1];
				const timeLeft = (value - Date.now()) / 1000;
				if (timeLeft > 0) {
					userCooldowns[commandName] = timeLeft;
				}
			}
		});
		return userCooldowns;
	}

	static trackCommandUsage(userId, commandName) {
		const key = `${userId}-${commandName}`;
		const currentCount = this.commandUsage.get(key) || 0;
		this.commandUsage.set(key, currentCount + 1);
		return currentCount + 1;
	}

	static getCommandStats(commandName) {
		let totalUses = 0;
		const userStats = new Map();

		this.commandUsage.forEach((count, key) => {
			if (key.endsWith(commandName)) {
				const userId = key.split('-')[0];
				totalUses += count;
				userStats.set(userId, count);
			}
		});

		return {
			totalUses,
			uniqueUsers: userStats.size,
			userStats: Object.fromEntries(userStats)
		};
	}

	static checkPermissionHierarchy(member, target) {
		if (member.id === target.id) return false;
		if (member.id === member.guild.ownerId) return true;
		if (target.id === member.guild.ownerId) return false;
		
		return member.roles.highest.position > target.roles.highest.position;
	}

	static hasRequiredRole(member, roleId) {
		return member.roles.cache.has(roleId);
	}

	static hasAnyRole(member, roleIds) {
		return roleIds.some(roleId => member.roles.cache.has(roleId));
	}

	static hasAllRoles(member, roleIds) {
		return roleIds.every(roleId => member.roles.cache.has(roleId));
	}

	static isInCooldownCategory(member, categoryId) {
		const channel = member.guild.channels.cache.get(categoryId);
		return channel && channel.type === 'GUILD_CATEGORY' && 
			   member.guild.channels.cache
					 .filter(ch => ch.parentId === categoryId)
					 .some(ch => ch.permissionsFor(member).has('SEND_MESSAGES'));
	}
}

module.exports = CommandHandler;