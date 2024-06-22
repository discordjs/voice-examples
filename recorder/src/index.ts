import process from 'node:process';
import { Client, Events, GatewayIntentBits, type Snowflake } from 'discord.js';
import { interactionHandlers } from './util/interactions.js';

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
});

client.once(Events.ClientReady, () => console.log('Ready!'));

/**
 * The ids of the users that can be recorded by the bot.
 */
const recordable = new Set<Snowflake>();

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.inCachedGuild() || !interaction.isChatInputCommand()) return;

	const handler = interactionHandlers.get(interaction.commandName);

	try {
		if (!handler) {
			await interaction.reply('Unknown command');

			return;
		}

		await handler(interaction, recordable);
	} catch (error) {
		console.warn(error);
	}
});

client.on(Events.Error, console.warn);

await client.login(process.env.TOKEN);
