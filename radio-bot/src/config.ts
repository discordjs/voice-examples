type Config = {
	device: string;
	maxTransmissionGap: number;
	type: string;
};

export const config: Config = {
	device: 'alsa_output.usb-Logitech_PRO_X_000000000000-00.analog-stereo.monitor',
	maxTransmissionGap: 5_000,
	type: 'pulse',
};
