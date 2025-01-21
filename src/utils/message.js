const { EmbedUtil } = require('./embed');

class MessageUtil {
	static async sendTemporaryMessage(channel, content, duration = 5000) {
		const message = await channel.send(content);
		setTimeout(() => message.delete().catch(() => {}), duration);
		return message;
	}

	static async editAfterDelay(message, newContent, delay = 5000) {
		await new Promise(resolve => setTimeout(resolve, delay));
		return message.edit(newContent).catch(() => {});
	}

	static createProgressBar(current, max, length = 10, filledChar = '▓', emptyChar = '░') {
		const percentage = current / max;
		const progress = Math.round(length * percentage);
		const emptyProgress = length - progress;
		const progressText = filledChar.repeat(progress);
		const emptyProgressText = emptyChar.repeat(emptyProgress);
		return progressText + emptyProgressText;
	}

	static async createTypingEffect(channel, messages, options = {}) {
		const {
			interval = 2000,
			typingDuration = 1000,
			deleteAfter = false,
			deleteDelay = 5000
		} = options;

		const sentMessages = [];

		for (const content of messages) {
			await channel.sendTyping();
			await new Promise(resolve => setTimeout(resolve, typingDuration));
			
			const message = await channel.send(content);
			sentMessages.push(message);
			
			await new Promise(resolve => setTimeout(resolve, interval));
		}

		if (deleteAfter) {
			setTimeout(() => {
				sentMessages.forEach(msg => msg.delete().catch(() => {}));
			}, deleteDelay);
		}

		return sentMessages;
	}

	static async createCountdown(interaction, seconds, options = {}) {
		const {
			startMessage = 'Countdown started!',
			endMessage = 'Time\'s up!',
			updateInterval = 1000,
			embedColor = '#0099ff'
		} = options;

		const embed = EmbedUtil.createBasicEmbed('Countdown', startMessage, embedColor);
		const message = await interaction.reply({ embeds: [embed], fetchReply: true });

		for (let i = seconds; i > 0; i--) {
			await new Promise(resolve => setTimeout(resolve, updateInterval));
			const timeLeft = this.formatTime(i);
			await message.edit({ 
				embeds: [EmbedUtil.createBasicEmbed('Countdown', `Time remaining: ${timeLeft}`, embedColor)]
			});
		}

		return message.edit({ 
			embeds: [EmbedUtil.createBasicEmbed('Countdown', endMessage, embedColor)]
		});
	}

	static formatTime(seconds) {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	static async createReactionCollector(message, options = {}) {
		const {
			reactions = ['👍', '👎'],
			time = 60000,
			max = 0,
			filter = () => true
		} = options;

		for (const reaction of reactions) {
			await message.react(reaction);
		}

		const collector = message.createReactionCollector({ 
			filter: (reaction, user) => {
				return reactions.includes(reaction.emoji.name) && 
					   !user.bot && 
					   filter(reaction, user);
			},
			time,
			max
		});

		return collector;
	}
}

module.exports = MessageUtil;