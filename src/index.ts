import { ColorUtils, BotUtils, PatternUtils } from "./Utils/utils";

require("dotenv").config({ path: `${__dirname}/../.env` });

if (!process.env.BOTTOKEN) {
    throw new Error(
        "Discord bot token not specified. Please properly set up your .env file."
    );
}

const commandHandler = BotUtils.commandHandler;

const client = BotUtils.client;

client.on("ready", () => {
    console.log("Bot has started");

    client.user.setPresence({
        activity: {
            name:
                "type !pattern with an image attached to generate ACNH Pattern instructions",
        },
        status: "online",
    });

    // load up the HSV array
    ColorUtils.getHSVArray();

    PatternUtils.loadPatternImages();
});

client.on("message", (message) => {
    if (message.author !== client.user) {
        commandHandler.HandleCommand(message);
    }
});

client.login(process.env.BOTTOKEN);
