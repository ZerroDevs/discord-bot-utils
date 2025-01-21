const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

class ButtonUtil {
	static createButton({ label, style = ButtonStyle.Primary, customId, emoji, url, disabled = false }) {
		const button = new ButtonBuilder()
			.setLabel(label)
			.setStyle(style)
			.setDisabled(disabled);

		if (url) {
			button.setURL(url);
		} else {
			button.setCustomId(customId);
		}

		if (emoji) button.setEmoji(emoji);
		return button;
	}

	static createButtonRow(buttons) {
		return new ActionRowBuilder().addComponents(buttons);
	}

	static createConfirmationButtons(confirmId = 'confirm', cancelId = 'cancel', confirmLabel = 'Confirm', cancelLabel = 'Cancel') {
		const confirm = this.createButton({
			label: confirmLabel,
			style: ButtonStyle.Success,
			customId: confirmId
		});

		const cancel = this.createButton({
			label: cancelLabel,
			style: ButtonStyle.Danger,
			customId: cancelId
		});

		return this.createButtonRow([confirm, cancel]);
	}

	static createPageButtons(prevId = 'prev', nextId = 'next', disabled = { prev: true, next: false }) {
		const prev = this.createButton({
			label: '⬅️ Previous',
			style: ButtonStyle.Primary,
			customId: prevId,
			disabled: disabled.prev
		});

		const next = this.createButton({
			label: 'Next ➡️',
			style: ButtonStyle.Primary,
			customId: nextId,
			disabled: disabled.next
		});

		return this.createButtonRow([prev, next]);
	}

	static createLinkButton(label, url, emoji = null) {
		return this.createButton({
			label,
			style: ButtonStyle.Link,
			url,
			emoji
		});
	}

	static createMenuButtons(options) {
		const buttons = options.map(option => 
			this.createButton({
				label: option.label,
				style: option.style || ButtonStyle.Secondary,
				customId: option.customId,
				emoji: option.emoji,
				disabled: option.disabled
			})
		);

		return this.createButtonRow(buttons);
	}

	static createPollButtons(options) {
		const buttons = options.map((option, index) =>
			this.createButton({
				label: `${option} (0)`,
				style: ButtonStyle.Primary,
				customId: `poll_${index}`,
				emoji: '📊'
			})
		);

		return this.createButtonRow(buttons);
	}
}

module.exports = ButtonUtil;