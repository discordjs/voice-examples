import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { EndBehaviorType, type VoiceReceiver } from '@discordjs/voice';
import type { User } from 'discord.js';
import * as prism from 'prism-media';

export async function createListeningStream(receiver: VoiceReceiver, user: User) {
	const opusStream = receiver.subscribe(user.id, {
		end: {
			behavior: EndBehaviorType.AfterSilence,
			duration: 1_000,
		},
	});

	const oggStream = new prism.opus.OggLogicalBitstream({
		opusHead: new prism.opus.OpusHead({
			channelCount: 2,
			sampleRate: 48_000,
		}),
		pageSizeControl: {
			maxPackets: 10,
		},
	});

	const filename = `./recordings/${Date.now()}-${user.id}.ogg`;

	const out = createWriteStream(filename);

	console.log(`👂 Started recording ${filename}`);

	try {
		await pipeline(opusStream, oggStream, out);

		console.log(`✅ Recorded ${filename}`);
	} catch (error: any) {
		console.warn(`❌ Error recording file ${filename} - ${error.message}`);
	}
}
