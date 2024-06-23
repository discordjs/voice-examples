import { entersState, getVoiceConnection, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import type { ChatInputCommandInteraction, Snowflake } from 'discord.js';
import { createListeningStream } from './createListeningStream.js';

async function join(interaction: ChatInputCommandInteraction<'cached'>, recordable: Set<Snowflake>) {
	await interaction.deferReply();

	let connection = getVoiceConnection(interaction.guildId);

	if (!connection) {
		if (!interaction.member?.voice.channel) {
			await interaction.followUp('Join a voice channel and then try that again!');

			return;
		}

		connection = joinVoiceChannel({
			adapterCreator: interaction.guild.voiceAdapterCreator,
			channelId: interaction.member.voice.channel.id,
			guildId: interaction.guild.id,
			selfDeaf: false,
			selfMute: true,
		});
	}

	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
		const receiver = connection.receiver;

		receiver.speaking.on('start', async (userId) => {
			if (recordable.has(userId)) {
				const user = await interaction.client.users.fetch(userId);

				await createListeningStream(receiver, user);
			}
		});
	} catch (error) {
		console.warn(error);

		await interaction.followUp('Failed to join voice channel within 20 seconds, please try again later!');
	}

	await interaction.followUp('Ready!');
}

async function record(interaction: ChatInputCommandInteraction<'cached'>, recordable: Set<Snowflake>) {
	const connection = getVoiceConnection(interaction.guildId);

	if (!connection) {
		await interaction.reply({ content: 'Join a voice channel and then try that again!', ephemeral: true });

		return;
	}

	const user = interaction.options.getUser('speaker', true);

	recordable.add(user.id);

	if (connection.receiver.speaking.users.has(user.id)) {
		await createListeningStream(connection.receiver, user);
	}

	await interaction.reply({ content: 'Listening!', ephemeral: true });
}

async function leave(interaction: ChatInputCommandInteraction<'cached'>, recordable: Set<Snowflake>) {
	const connection = getVoiceConnection(interaction.guildId);

	if (!connection) {
		await interaction.reply({ content: 'Not in a voice channel in this server!', ephemeral: true });

		return;
	}

	connection.destroy();

	recordable.clear();

	await interaction.reply({ content: 'Left the channel!', ephemeral: true });
}

export const interactionHandlers = new Map([
	['join', join],
	['leave', leave],
	['record', record],
]);
