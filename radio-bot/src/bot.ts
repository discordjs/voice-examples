import type { Readable } from 'node:stream';
import {
	NoSubscriberBehavior,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	entersState,
	AudioPlayerStatus,
	VoiceConnectionStatus,
	joinVoiceChannel,
} from '@discordjs/voice';
import { GatewayIntentBits } from 'discord-api-types/v10';
import { Client, type VoiceBasedChannel, Constants } from 'discord.js';
import prism from 'prism-media';

const { Events } = Constants;

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { token, device, maxTransmissionGap, type } = require('../config.json') as {
	token: string;
	device: string;
	type: string;
	maxTransmissionGap: number;
};

const player = createAudioPlayer({
	behaviors: {
		noSubscriber: NoSubscriberBehavior.Play,
		maxMissedFrames: Math.round(maxTransmissionGap / 20),
	},
});

function attachRecorder() {
	player.play(
		createAudioResource(
			new prism.FFmpeg({
				args: [
					'-analyzeduration',
					'0',
					'-loglevel',
					'0',
					'-f',
					type,
					'-i',
					type === 'dshow' ? `audio=${device}` : device,
					'-acodec',
					'libopus',
					'-f',
					'opus',
					'-ar',
					'48000',
					'-ac',
					'2',
				],
			}) as Readable,
			{
				inputType: StreamType.OggOpus,
			},
		),
	);
	console.log('Attached recorder - ready to go!');
}

player.on('stateChange', (oldState, newState) => {
	if (oldState.status === AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Playing) {
		console.log('Playing audio output on audio player');
	} else if (newState.status === AudioPlayerStatus.Idle) {
		console.log('Playback has stopped. Attempting to restart.');
		attachRecorder();
	}
});

async function connectToChannel(channel: VoiceBasedChannel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		// @ts-expect-error Currently voice is built in mind with API v10 whereas discord.js v13 uses API v9.
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	}
}

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
});

client.on(Events.CLIENT_READY, () => {
	console.log('discord.js client is ready!');
	attachRecorder();
});

client.on(Events.MESSAGE_CREATE, async (message) => {
	if (!message.guild) return;
	if (message.content === '-join') {
		const channel = message.member?.voice.channel;
		if (channel) {
			try {
				const connection = await connectToChannel(channel);
				connection.subscribe(player);
				await message.reply('Playing now!');
			} catch (error) {
				console.error(error);
			}
		} else {
			await message.reply('Join a voice channel then try again!');
		}
	}
});

void client.login(token);
