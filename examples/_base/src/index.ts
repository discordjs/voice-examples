import process from 'node:process';
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
});

await client.login(process.env.TOKEN);
