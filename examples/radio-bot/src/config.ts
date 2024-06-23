type Config = {
	device: string;
	maxTransmissionGap: number;
	type: string;
};

export const config: Config = {
	device: 'audio_hw_device_id',
	maxTransmissionGap: 5_000,
	type: 'pulse',
};
