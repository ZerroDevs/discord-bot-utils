const { EmbedBuilder } = require('discord.js');

class TaxUtil {
	static calculateTax(amount, taxRate) {
		const tax = amount * (taxRate / 100);
		const total = amount + tax;
		return {
			originalAmount: amount,
			taxAmount: tax,
			totalAmount: total,
			taxRate: taxRate
		};
	}

	static createTaxMessageResponse(taxInfo) {
		return `💰 Tax Calculation\n` +
			   `Original Amount: ${taxInfo.originalAmount}\n` +
			   `Tax Rate: ${taxInfo.taxRate}%\n` +
			   `Tax Amount: ${taxInfo.taxAmount}\n` +
			   `Total Amount: ${taxInfo.totalAmount}`;
	}

	static createTaxEmbed(taxInfo) {
		return new EmbedBuilder()
			.setTitle('💰 Tax Calculation')
			.setColor('#00ff00')
			.addFields([
				{ name: 'Original Amount', value: taxInfo.originalAmount.toString(), inline: true },
				{ name: 'Tax Rate', value: `${taxInfo.taxRate}%`, inline: true },
				{ name: 'Tax Amount', value: taxInfo.taxAmount.toString(), inline: true },
				{ name: 'Total Amount', value: taxInfo.totalAmount.toString(), inline: false }
			])
			.setTimestamp();
	}
}

module.exports = TaxUtil;