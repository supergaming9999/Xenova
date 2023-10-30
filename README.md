# Xenova

[![Bot Invite](/assets/invite-button.png)](https://discord.com/api/oauth2/authorize?client_id=770693993897918475&permissions=378944&scope=applications.commands%20bot)

#### A custom economy discord bot made with discord.js

This is a work in progress personal project made for fun.

## Self Hosting

Clone or download this repository

You must have [Node.js](https://nodejs.org) if you don't already.

You will need to copy `example.env` as `.env` and replace the values

### Configuration - Environment Variables

- `PREFIX` - Used for message commands, and can be whatever you want

- `MONGO_SRV` - [Create a MongoDB account for free](https://account.mongodb.com/account/register), create a cluster, then copy your MongoDB Driver [connection string](https://www.mongodb.com/basics/mongodb-connection-string).
  - You will replace the `MONGO DB SRV` value with it in your new `.env` file

- `CLIENT_ID`, `OWNER_ID`, and `GUILD_ID`
  - [**How to find User/Server ID**](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)
  - `CLIENT_ID`: The Bot's User ID - Only if you want to work with slash commands
  - `OWNER_ID`: Your User ID - For the `addmonkey` message command
  - `GUILD_ID`: Discord Server ID - If you want slash commands to ONLY work on one server

### Installation and Startup

In your machine's console make sure you are in the repository folder and run:
```bash
npm install
npm start
```

## Credits
- [Ashish Emmanuel](https://github.com/3061LRTAGSPKJMORMRT) - Blackjack code was adapted from their repository [discord-blackjack](https://github.com/3061LRTAGSPKJMORMRT/discord-blackjack)
