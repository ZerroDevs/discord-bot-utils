# Discord Bot Utils

A comprehensive utility package for Discord.js bots that provides advanced features and helpers to make bot development easier and more efficient.

## Features

### Preset Commands
- Ready-to-use moderation commands (kick, ban)
- Utility commands (ping, avatar, shortlink)
- Automatic permission handling
- Embedded responses
- Command usage tracking

### Embed Utilities
- Basic, Error, Success, Warning, and Info embeds
- Custom embeds with full customization
- Server and User info embeds
- Loading embeds

### Button Utilities
- Custom button creation
- Button rows and menus
- Confirmation buttons
- Poll buttons
- Link buttons
- Menu buttons

### Pagination Utilities
- Standard pagination with navigation
- Custom page indicators
- Menu-based pagination
- Configurable timeouts and labels

### Message Utilities
- Temporary messages
- Delayed message editing
- Progress bars
- Typing effects
- Countdown timers
- Reaction collectors

### Tax Utilities
- Fixed and user-defined tax rate calculations
- Embed and message display options
- Customizable tax rate presets
- Automatic total calculation

### Command Handler Utilities
- Permission validation
- Cooldown management
- Command usage tracking
- Command statistics
- Role hierarchy checking
- Role requirement validation

## Installation

```bash
npm install @ZerroDevs/discord-bot-utils
```

## Usage Examples

### Embed Utilities
```javascript
const { EmbedUtil } = require('@ZerroDevs/discord-bot-utils');

// Create different types of embeds
const successEmbed = EmbedUtil.createSuccessEmbed('Operation completed!');
const errorEmbed = EmbedUtil.createErrorEmbed('Something went wrong!');
const warningEmbed = EmbedUtil.createWarningEmbed('Please be careful!');
const infoEmbed = EmbedUtil.createInfoEmbed('Here is some information');
const loadingEmbed = EmbedUtil.createLoadingEmbed('Processing...');

// Create server/user info embeds
const serverEmbed = EmbedUtil.createServerInfoEmbed(guild);
const userEmbed = EmbedUtil.createUserInfoEmbed(member);

// Create custom embed
const customEmbed = EmbedUtil.createCustomEmbed({
	title: 'Custom Title',
	description: 'Custom Description',
	fields: [{ name: 'Field', value: 'Value', inline: true }],
	thumbnail: 'thumbnail_url',
	image: 'image_url',
	footer: { text: 'Footer text' },
	author: { name: 'Author name' }
});
```

### Button Utilities
```javascript
const { ButtonUtil } = require('@ZerroDevs/discord-bot-utils');

// Create confirmation buttons
const confirmRow = ButtonUtil.createConfirmationButtons();

// Create custom button
const button = ButtonUtil.createButton({
	label: 'Click me!',
	style: ButtonStyle.Primary,
	customId: 'custom',
	emoji: '👋'
});

// Create menu buttons
const menuRow = ButtonUtil.createMenuButtons([
	{ label: 'Option 1', customId: 'opt_1', emoji: '1️⃣' },
	{ label: 'Option 2', customId: 'opt_2', emoji: '2️⃣' }
]);

// Create poll buttons
const pollRow = ButtonUtil.createPollButtons(['Yes', 'No', 'Maybe']);
```

### Message Utilities
```javascript
const { MessageUtil } = require('@ZerroDevs/discord-bot-utils');

// Send temporary message
await MessageUtil.sendTemporaryMessage(channel, 'This will delete in 5 seconds');

// Create typing effect
await MessageUtil.createTypingEffect(channel, [
	'First message...',
	'Second message...',
	'Final message!'
], {
	interval: 2000,
	deleteAfter: true
});

// Create countdown
await MessageUtil.createCountdown(interaction, 60, {
	startMessage: 'Countdown started!',
	endMessage: 'Time\'s up!'
});

// Create progress bar
const progress = MessageUtil.createProgressBar(7, 10); // "ZerroDevs"
```

### Tax Calculator
```javascript
const { TaxUtil } = require('@ZerroDevs/discord-bot-utils');

// Calculate tax with fixed rate
const taxInfo = TaxUtil.calculateTax(1000, 15); // 15% tax rate

// Display as message
const messageResponse = TaxUtil.createTaxMessageResponse(taxInfo);

// Display as embed
const embedResponse = TaxUtil.createTaxEmbed(taxInfo);

// Using preset command with fixed rate
await PresetCommands.handleTax(interaction, { 
	userDefined: false, 
	fixedRate: 15 
});

// Using preset command with user-defined rate
await PresetCommands.handleTax(interaction, { 
	userDefined: true 
});
```

### Command Handler
```javascript
const { CommandHandler } = require('@ZerroDevs/discord-bot-utils');

// Check permissions
const hasPermission = CommandHandler.validatePermissions(member, ['BAN_MEMBERS']);

// Handle cooldowns
const cooldownTime = CommandHandler.checkCooldown(userId, 'commandName', 10);

// Track usage
const usageCount = CommandHandler.trackCommandUsage(userId, 'commandName');

// Get command stats
const stats = CommandHandler.getCommandStats('commandName');

// Check role hierarchy
const canModerate = CommandHandler.checkPermissionHierarchy(moderator, target);

// Check roles
const hasRole = CommandHandler.hasRequiredRole(member, roleId);
const hasAnyRole = CommandHandler.hasAnyRole(member, roleIds);
const hasAllRoles = CommandHandler.hasAllRoles(member, roleIds);
```

### Logging System
- Comprehensive error tracking and handling
- Multiple log levels (info, warning, error, debug)
- File-based logging with automatic cleanup
- Discord webhook integration
- Command execution logging
- Global error catching
- Custom event logging

```javascript
const { LoggerUtil } = require('@ZerroDevs/discord-bot-utils');

// Initialize logger
await LoggerUtil.initialize({
	logDirectory: 'logs',
	webhookUrl: 'your-webhook-url',
	errorWebhookUrl: 'your-error-webhook-url',
	maxLogAge: 7 // days
});

// Log different levels
await LoggerUtil.log('info', 'Operation successful');
await LoggerUtil.log('warning', 'Resource running low');
await LoggerUtil.error(error, { context: 'additional info' });

// Wrap commands with logging
const wrappedCommand = LoggerUtil.createCommandLogger(async (interaction) => {
	// Your command logic here
});

// Automatic file cleanup
// Logs older than maxLogAge days are automatically removed
```

### Preset Commands
```javascript
const { PresetCommands } = require('@ZerroDevs/discord-bot-utils');

// Get all preset command definitions
const presetCommands = PresetCommands.getPresetCommands();

// In your interaction handler:
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	switch(interaction.commandName) {
		case 'ping':
			await PresetCommands.handlePing(interaction);
			break;
		case 'avatar':
			await PresetCommands.handleAvatar(interaction);
			break;
		case 'kick':
			await PresetCommands.handleKick(interaction);
			break;
		case 'ban':
			await PresetCommands.handleBan(interaction);
			break;
		case 'shortlink':
			await PresetCommands.handleShortLink(interaction);
			break;
	}
});
```

Available Preset Commands:
- `/ping` - Check bot latency
- `/avatar [user]` - Get user avatar (optional user mention)
- `/kick <user> [reason]` - Kick a member with optional reason
- `/ban <user> [reason] [days]` - Ban a user with optional reason and message deletion days
- `/shortlink <url>` - Create a shortened URL using TinyURL
- `/tax-fixed <amount> [display]` - Calculate tax with fixed rate (15%)
- `/tax-custom <amount> <tax_rate> [display]` - Calculate tax with custom rate

## Example Bot
Check the `examples` directory for a complete example bot showcasing all features.

## License

MIT