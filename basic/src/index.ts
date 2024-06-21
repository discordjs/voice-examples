import process from 'node:process';
import { createAudioPlayer } from '@discordjs/voice';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { connectToChannel, playSong } from './util/helpers.js';

/**
 * In this example, we are creating a single audio player that plays to a number of voice channels.
 * The audio player will play a single track.
 */

/**
 * Create the audio player. We will use this for all of our connections.
 */
const player = createAudioPlayer();

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
});

client.once(Events.ClientReady, async () => {
	console.log('Discord.js client is ready!');

	/**
	 * Try to get our song ready to play for when the bot joins a voice channel
	 */
	try {
		await playSong(player, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');

		console.log('Song is ready to play!');
	} catch (error) {
		/**
		 * The song isn't ready to play for some reason :(
		 */
		console.error(error);
	}
});

client.on(Events.MessageCreate, async (message) => {
	if (message.author.bot || !message.inGuild() || !message.mentions.has(message.client.user.id)) return;

	console.log(message.mentions, message.content);

	if (message.content.includes('join')) {
		if (!message.member?.voice.channel) {
			await message.reply('Join a voice channel then try again!');

			return;
		}

		/**
		 * The user is in a voice channel, try to connect.
		 */
		try {
			const connection = await connectToChannel(message.member.voice.channel);

			/**
			 * We have successfully connected! Now we can subscribe our connection to
			 * the player. This means that the player will play audio in the user's
			 * voice channel.
			 */
			connection.subscribe(player);
			await message.reply('Playing now!');
		} catch (error) {
			/**
			 * Unable to connect to the voice channel within 30 seconds :(
			 */
			console.error(error);
		}
	}
});

await client.login(process.env.TOKEN);
