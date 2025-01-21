const { ButtonUtil } = require('./button');

class PaginationHandler {
	static async createPagination(interaction, pages, options = {}) {
		const {
			timeout = 60000,
			startPage = 0,
			showPageNumbers = true,
			prevId = 'prev',
			nextId = 'next',
			prevLabel = '⬅️ Previous',
			nextLabel = 'Next ➡️'
		} = options;

		let currentPage = startPage;
		
		const updateButtons = () => ({
			prev: { label: prevLabel, disabled: currentPage === 0 },
			next: { label: nextLabel, disabled: currentPage === pages.length - 1 }
		});

		const getPageIndicator = () => {
			if (!showPageNumbers) return '';
			return `\nPage ${currentPage + 1}/${pages.length}`;
		};

		const buttons = ButtonUtil.createPageButtons(prevId, nextId, {
			prev: currentPage === 0,
			next: currentPage === pages.length - 1
		});

		const response = await interaction.reply({
			embeds: [pages[currentPage].setFooter({ 
				text: pages[currentPage].data.footer?.text + getPageIndicator() || getPageIndicator()
			})],
			components: [buttons],
			fetchReply: true
		});

		const collector = response.createMessageComponentCollector({
			time: timeout
		});

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				await i.reply({ 
					content: 'You cannot use these buttons.', 
					ephemeral: true 
				});
				return;
			}

			if (i.customId === prevId) {
				currentPage--;
			} else if (i.customId === nextId) {
				currentPage++;
			}

			const updatedButtons = ButtonUtil.createPageButtons(prevId, nextId, {
				prev: currentPage === 0,
				next: currentPage === pages.length - 1
			});

			await i.update({
				embeds: [pages[currentPage].setFooter({ 
					text: pages[currentPage].data.footer?.text + getPageIndicator() || getPageIndicator()
				})],
				components: [updatedButtons]
			});
		});

		collector.on('end', async () => {
			try {
				await response.edit({
					components: []
				});
			} catch (error) {
				console.error('Error removing buttons:', error);
			}
		});

		return collector;
	}

	static async createMenuPagination(interaction, pages, menuOptions) {
		const pageButtons = menuOptions.map((option, index) => ({
			label: option.label,
			customId: `menu_${index}`,
			style: option.style || 'PRIMARY',
			emoji: option.emoji
		}));

		const row = ButtonUtil.createMenuButtons(pageButtons);
		
		const response = await interaction.reply({
			embeds: [pages[0]],
			components: [row],
			fetchReply: true
		});

		const collector = response.createMessageComponentCollector({
			time: 60000
		});

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				await i.reply({ 
					content: 'You cannot use these buttons.', 
					ephemeral: true 
				});
				return;
			}

			const pageIndex = parseInt(i.customId.split('_')[1]);
			await i.update({ embeds: [pages[pageIndex]] });
		});

		collector.on('end', async () => {
			try {
				await response.edit({ components: [] });
			} catch (error) {
				console.error('Error removing buttons:', error);
			}
		});

		return collector;
	}
}

module.exports = PaginationHandler;