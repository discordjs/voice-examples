# Voice Template

The template to use when creating a new example for voice. Steps to follow:

1. Update `package.json`s name with the name of the example
2. Update `<folder>` in this readme with the example name
3. Test it before pushing!
4. Replace this portion of the readme with a short description of what the example shows.

## Usage

```sh-session
# Clone the examples repository, copy the `<folder>` files in a folder and then run:
$ npm install
$ npm run build

# Set a bot token (see .env.example)
$ cp .env.example .env
$ nano .env

# Start the bot!
$ npm start
```
