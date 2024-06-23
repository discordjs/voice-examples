# Basic Example

This example will demonstrate how to join a voice channel and play resources, with some best practice
assistance on making sure you aren't waiting indefinitely for things to happen.

To achieve this, the example sets some fairly arbitrary time constraints for things such as joining
voice channels and audio becoming available.

## Code snippet

This code snippet doesn't include any comments for brevity. If you want to see the full source code,
check the other files in this folder!

```ts
import process from 'node:process';
import { createAudioPlayer } from '@discordjs/voice';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { connectToChannel, playSong } from './util/helpers.js';

const player = createAudioPlayer();

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
});

client.once(Events.ClientReady, async () => {
	console.log('Discord.js client is ready!');

	try {
		await playSong(player, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');

		console.log('Song is ready to play!');
	} catch (error) {
		console.error(error);
	}
});

client.on(Events.MessageCreate, async (message) => {
	if (message.author.bot || !message.inGuild() || !message.mentions.has(message.client.user.id)) return;

	if (message.content.includes('join')) {
		if (!message.member?.voice.channel) {
			await message.reply('Join a voice channel then try again!');

			return;
		}

		try {
			const connection = await connectToChannel(message.member.voice.channel);

			connection.subscribe(player);

			await message.reply('Playing now!');
		} catch (error) {
			console.error(error);
		}
	}
});

await client.login(process.env.TOKEN);
```
