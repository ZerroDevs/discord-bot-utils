const { EmbedBuilder, WebhookClient } = require('discord.js');
const fs = require('fs/promises');
const path = require('path');

class LoggerUtil {
	static webhooks = new Map();
	static logPath = '';
	static errorHandlers = new Map();

	static async initialize(options = {}) {
		const {
			logDirectory = 'logs',
			webhookUrl = null,
			errorWebhookUrl = null,
			maxLogAge = 7 // days
		} = options;

		this.logPath = path.join(process.cwd(), logDirectory);
		await fs.mkdir(this.logPath, { recursive: true });

		if (webhookUrl) {
			this.webhooks.set('general', new WebhookClient({ url: webhookUrl }));
		}
		if (errorWebhookUrl) {
			this.webhooks.set('error', new WebhookClient({ url: errorWebhookUrl }));
		}

		// Cleanup old logs
		this.cleanupOldLogs(maxLogAge);

		// Set up global error handlers
		this.setupGlobalErrorHandlers();
	}

	static async log(level, message, data = {}) {
		const timestamp = new Date().toISOString();
		const logEntry = {
			timestamp,
			level,
			message,
			...data
		};

		// Write to file
		const logFile = path.join(this.logPath, `${level}-${new Date().toISOString().split('T')[0]}.log`);
		await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');

		// Send to webhook if configured
		if (this.webhooks.has('general')) {
			const embed = new EmbedBuilder()
				.setTitle(`${level.toUpperCase()} Log`)
				.setDescription(message)
				.setColor(this.getColorForLevel(level))
				.setTimestamp();
			
			if (Object.keys(data).length > 0) {
				embed.addFields([{ 
					name: 'Additional Data', 
					value: '```json\n' + JSON.stringify(data, null, 2) + '\n```' 
				}]);
			}

			await this.webhooks.get('general').send({ embeds: [embed] });
		}
	}

	static async error(error, context = {}) {
		const errorData = {
			name: error.name,
			message: error.message,
			stack: error.stack,
			...context
		};

		await this.log('error', error.message, errorData);

		if (this.webhooks.has('error')) {
			const embed = new EmbedBuilder()
				.setTitle('Error Occurred')
				.setDescription(error.message)
				.setColor('#ff0000')
				.addFields([
					{ name: 'Error Type', value: error.name, inline: true },
					{ name: 'Stack Trace', value: '```' + error.stack + '```' }
				])
				.setTimestamp();

			if (Object.keys(context).length > 0) {
				embed.addFields([{
					name: 'Context',
					value: '```json\n' + JSON.stringify(context, null, 2) + '\n```'
				}]);
			}

			await this.webhooks.get('error').send({ embeds: [embed] });
		}
	}

	static setupGlobalErrorHandlers() {
		process.on('uncaughtException', async (error) => {
			await this.error(error, { type: 'uncaughtException' });
		});

		process.on('unhandledRejection', async (error) => {
			await this.error(error, { type: 'unhandledRejection' });
		});

		process.on('warning', async (warning) => {
			await this.log('warning', warning.message, {
				name: warning.name,
				stack: warning.stack
			});
		});
	}

	static async cleanupOldLogs(maxAgeDays) {
		const files = await fs.readdir(this.logPath);
		const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;
		const now = Date.now();

		for (const file of files) {
			const filePath = path.join(this.logPath, file);
			const stats = await fs.stat(filePath);
			if (now - stats.mtime.getTime() > maxAge) {
				await fs.unlink(filePath);
			}
		}
	}

	static getColorForLevel(level) {
		const colors = {
			info: '#00ff00',
			warning: '#ffff00',
			error: '#ff0000',
			debug: '#0000ff'
		};
		return colors[level] || '#ffffff';
	}

	static createCommandLogger(command) {
		return async (interaction) => {
			try {
				await command(interaction);
				await this.log('info', `Command executed: ${interaction.commandName}`, {
					user: interaction.user.tag,
					guild: interaction.guild?.name,
					options: interaction.options.data
				});
			} catch (error) {
				await this.error(error, {
					command: interaction.commandName,
					user: interaction.user.tag,
					guild: interaction.guild?.name,
					options: interaction.options.data
				});

				// Send error message to user
				const errorMessage = process.env.NODE_ENV === 'production' 
					? 'An error occurred while executing the command.'
					: error.message;

				if (!interaction.replied && !interaction.deferred) {
					await interaction.reply({ 
						content: errorMessage,
						ephemeral: true 
					});
				}
			}
		};
	}
}

module.exports = LoggerUtil;