import { Client, Message, MessageAttachment } from "discord.js";
import { Canvas } from "canvas";
import { CommandHandler } from "../../command_handler";
import { config } from "../../Config/config";

export namespace BotUtils {
    export const commandHandler = new CommandHandler(config.prefix);

    export const client = new Client();

    export function sendImagesPage(
        imageCanvses: Canvas[],
        message: Message,
        page: number,
        totalPages: number
    ) {
        console.log(`Sending pattern for ${message.author.username}`);
        const attachmentArray: MessageAttachment[] = [];
        for (let i = 0; i < imageCanvses.length; i++) {
            attachmentArray[i] = new MessageAttachment(
                imageCanvses[i].toBuffer(),
                `Instructions_${i + 5 * (page - 1)}.png`
            );
        }
        let replyMessage: string = "";
        if (attachmentArray.length === 1) {
            replyMessage =
                "here's instructions for your pattern! Make sure to click `Open original` to view it at full resolution.";
        } else
            replyMessage =
                "here's instructions for your patterns! Make sure to click `Open original` to view them at full resolution.";
        if (totalPages > 1) {
            if (page > 1) {
                replyMessage = ` (${page}/${totalPages})`;
            } else {
                replyMessage += ` (1/${totalPages})`;
            }
        }
        message.channel
            .send(replyMessage, {
                files: attachmentArray,
                reply: message.author,
            })
            .then((sentMessage) => {
                if (page === totalPages) {
                    message.channel.stopTyping();
                }
            });
    }

    export function sendImages(imageCanvses: Canvas[], message: Message) {
        try {
            if (imageCanvses.length > 15) {
                message.channel.send(
                    "Too many images! The maximum amount is 15."
                );
            } else if (imageCanvses.length > 5) {
                // need to split it up.
                for (let i = 0; i < imageCanvses.length; i += 5) {
                    const howManyCanvasesRemaining = imageCanvses.length - i;
                    const pagesArray = [];
                    for (let j = 0; j < howManyCanvasesRemaining; j++) {
                        if (j > 4) break;
                        pagesArray[j] = imageCanvses[i + j];
                    }
                    sendImagesPage(
                        pagesArray,
                        message,
                        Math.ceil(i / 5) + 1,
                        Math.ceil(imageCanvses.length / 5)
                    );
                }
            } else {
                sendImagesPage(imageCanvses, message, 1, 1);
            }
        } catch (error) {
            message.channel.send("Error sending image(s)!");
            throw new Error(error);
        }
    }
}
