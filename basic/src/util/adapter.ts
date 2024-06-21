import type { DiscordGatewayAdapterCreator, DiscordGatewayAdapterLibraryMethods } from '@discordjs/voice';
import {
	Events,
	GatewayDispatchEvents,
	type Client,
	type GatewayVoiceServerUpdateDispatchData,
	type GatewayVoiceStateUpdateDispatchData,
	type Guild,
	type VoiceBasedChannel,
	type Snowflake,
	Status,
} from 'discord.js';

const adapters = new Map<Snowflake, DiscordGatewayAdapterLibraryMethods>();
const trackedClients = new Set<Client>();
const trackedShards = new Map<number, Set<Snowflake>>();

/**
 * Tracks a Discord.js client, listening to VOICE_SERVER_UPDATE and VOICE_STATE_UPDATE events
 *
 * @param client - The Discord.js Client to track
 */
function trackClient(client: Client) {
	if (trackedClients.has(client)) return;

	trackedClients.add(client);

	client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (payload: GatewayVoiceServerUpdateDispatchData) => {
		adapters.get(payload.guild_id)?.onVoiceServerUpdate(payload);
	});

	client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (payload: GatewayVoiceStateUpdateDispatchData) => {
		if (payload.guild_id && payload.session_id && payload.user_id === client.user?.id) {
			adapters.get(payload.guild_id)?.onVoiceStateUpdate(payload);
		}
	});

	client.on(Events.ShardDisconnect, (_, shardId) => {
		const guilds = trackedShards.get(shardId);

		if (guilds) {
			for (const guildId of guilds.values()) {
				adapters.get(guildId)?.destroy();
			}
		}

		trackedShards.delete(shardId);
	});
}

function trackGuild(guild: Guild) {
	let guilds = trackedShards.get(guild.shardId);

	if (!guilds) {
		guilds = new Set();

		trackedShards.set(guild.shardId, guilds);
	}

	guilds.add(guild.id);
}

/**
 * Creates an adapter for a Voice Channel.
 *
 * @param channel - The channel to create the adapter for
 */
export function createDiscordJSAdapter(channel: VoiceBasedChannel): DiscordGatewayAdapterCreator {
	return (methods) => {
		adapters.set(channel.guild.id, methods);
		trackClient(channel.client);
		trackGuild(channel.guild);

		return {
			sendPayload(data) {
				if (channel.guild.shard.status !== Status.Ready) return false;

				channel.guild.shard.send(data);

				return true;
			},
			destroy() {
				adapters.delete(channel.guild.id);
			},
		};
	};
}
