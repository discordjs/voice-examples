import type { Readable } from 'node:stream';
import {
	createAudioResource,
	entersState,
	joinVoiceChannel,
	StreamType,
	VoiceConnectionStatus,
	type AudioPlayer,
	type VoiceConnection,
} from '@discordjs/voice';
import type { VoiceBasedChannel } from 'discord.js';
import prism from 'prism-media';
import { config } from '../config.js';

const { device, type } = config;

export function attachRecorder(player: AudioPlayer) {
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

export async function connectToChannel(channel: VoiceBasedChannel): Promise<VoiceConnection> {
	const connection = joinVoiceChannel({
		adapterCreator: channel.guild.voiceAdapterCreator,
		channelId: channel.id,
		guildId: channel.guild.id,
	});

	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

		return connection;
	} catch (error) {
		connection.destroy();

		throw error;
	}
}
