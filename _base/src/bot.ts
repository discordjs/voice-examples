import {} from '@discordjs/voice';
import { GatewayIntentBits } from 'discord-api-types/v10';
import { Client } from 'discord.js';

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { token } = require('../config.json') as { token: string };

const client = new Client({
	intents: [GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds],
});

void client.login(token);
