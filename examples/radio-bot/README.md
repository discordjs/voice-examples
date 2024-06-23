# Discord Radio Bot 🎧

A proof-of-concept radio bot that uses @discordjs/voice and discord.js. Streams audio from an audio output hardware device on your computer over a Discord voice channel.

**Works on:**

- Linux (via PulseAudio `pulse`)
- Windows (via DirectShow `dshow`)

## Usage

```sh-session
# Clone the examples repository, copy the `radio-bot` files in a folder and then run:
$ npm install
$ npm run build

# Set a bot token (see .env.example)
$ cp .env.example .env
$ nano .env

# Configure device, max transmission gap, and type (see src/config.ts)
$ nano src/config.ts

# Start the bot!
$ npm start
```

## Configuring on Windows via `dshow`

Run `ffmpeg -list_devices true -f dshow -i dummy` and observe output containing something similar:

```
DirectShow audio devices
 "Stereo Mix (Realtek(R) Audio)"
    Alternative name "@device_cm_{ID1}\wave_{ID2}"
```

For example, playing the above device will mirror audio from the speaker output of your machine. Your `config.ts` should then be considered like so:

```json
{
	"device": "Stereo Mix (Realtek(R) Audio)",
	"maxTransmissionGap": 5_000
	"type": "dshow",
}
```

## Configuring on Linux via `pulse`

Run `pactl list short sources` and observe output containing something similar:

```
5   alsa_output.pci.3.analog-stereo.monitor   module-alsa-card.c   s16le 2ch 44100Hz   IDLE
```

Then configure your `config.ts` with the device you'd like to use:

```json
{
	"device": "alsa_output.pci.3.analog-stereo.monitor",
	"maxTransmissionGap": 5_000
	"type": "pulse",
}
```
