import Discord from "discord.js";
import { DiscordBotConfig, config } from "./Config/config";
import { CommandHandler } from "./command_handler";
import { ColorUtils, BotUtils } from "./Utils/utils";

validateConfig(config);

const commandHandler = new CommandHandler(config.prefix);

const client = new Discord.Client();

client.on("ready", () => {
    console.log("Bot has started");

    client.user.setPresence({ activity: { name: "type !pattern with an image attached to generate ACNH Pattern instructions" }, status: 'online' })

    //load up the HSV array
    ColorUtils.getHSVArray()

    BotUtils.client = client;
    BotUtils.commandHandler = commandHandler;
});

client.on("message", (message) => {
    if(message.author != client.user){
        commandHandler.HandleCommand(message);
    }
});

client.login(process.env.BOTTOKEN);

function validateConfig(config: DiscordBotConfig) {
    require('dotenv').config({path: __dirname+'/../.env'});
    if (!process.env.BOTTOKEN) {
        throw new Error("Discord bot token not specified. Please properly set up your .env file.");
    }
}
  