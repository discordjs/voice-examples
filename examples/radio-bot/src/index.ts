import process from 'node:process';
import { createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior } from '@discordjs/voice';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { config } from './config.js';
import { attachRecorder, connectToChannel } from './util/helpers.js';

const { maxTransmissionGap } = config;

const player = createAudioPlayer({
	behaviors: {
		noSubscriber: NoSubscriberBehavior.Play,
		maxMissedFrames: Math.round(maxTransmissionGap / 20),
	},
});

player.on('stateChange', (oldState, newState) => {
	if (oldState.status === AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Playing) {
		console.log('Playing audio output on audio player');
	} else if (newState.status === AudioPlayerStatus.Idle) {
		console.log('Playback has stopped. Attempting to restart.');

		attachRecorder(player);
	}
});

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
});

client.once(Events.ClientReady, () => {
	console.log('Ready!');

	attachRecorder(player);
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
