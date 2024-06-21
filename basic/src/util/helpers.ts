import {
	AudioPlayerStatus,
	StreamType,
	VoiceConnectionStatus,
	createAudioResource,
	entersState,
	joinVoiceChannel,
	type AudioPlayer,
} from '@discordjs/voice';
import type { VoiceBasedChannel } from 'discord.js';
import { createDiscordJSAdapter } from './adapter.js';

export async function connectToChannel(channel: VoiceBasedChannel) {
	/**
	 * Here, we try to establish a connection to a voice channel. If we're already connected
	 * to this voice channel, \@discordjs/voice will just return the existing connection for us!
	 */
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: createDiscordJSAdapter(channel),
	});

	/**
	 * If we're dealing with a connection that isn't yet Ready, we can set a reasonable
	 * time limit before giving up. In this example, we give the voice connection 30 seconds
	 * to enter the ready state before giving up.
	 */
	try {
		/**
		 * Allow ourselves 30 seconds to join the voice channel. If we do not join within then,
		 * an error is thrown.
		 */
		await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
		/**
		 * At this point, the voice connection is ready within 30 seconds! This means we can
		 * start playing audio in the voice channel. We return the connection so it can be
		 * used by the caller.
		 */
		return connection;
	} catch (error) {
		/**
		 * At this point, the voice connection has not entered the Ready state. We should make
		 * sure to destroy it, and propagate the error by throwing it, so that the calling function
		 * is aware that we failed to connect to the channel.
		 */
		connection.destroy();
		throw error;
	}
}

export async function playSong(player: AudioPlayer, songUrl: string) {
	/**
	 * Here we are creating an audio resource using a sample song freely available online
	 * (see https://www.soundhelix.com/audio-examples)
	 *
	 * We specify an arbitrary inputType. This means that we aren't too sure what the format of
	 * the input is, and that we'd like to have this converted into a format we can use. If we
	 * were using an Ogg or WebM source, then we could change this value. However, for now we
	 * will leave this as arbitrary.
	 */
	const resource = createAudioResource(songUrl, { inputType: StreamType.Arbitrary });

	/**
	 * We will now play this to the audio player. By default, the audio player will not play until
	 * at least one voice connection is subscribed to it, so it is fine to attach our resource to the
	 * audio player this early.
	 */
	player.play(resource);

	/**
	 * Here we are using a helper function. It will resolve if the player enters the Playing
	 * state within 5 seconds, otherwise it will reject with an error.
	 */
	return entersState(player, AudioPlayerStatus.Playing, 5_000);
}
