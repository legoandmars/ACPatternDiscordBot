import { CommandHandler } from "../../command_handler";
import { Client, Message, MessageAttachment } from "discord.js";
import { Canvas } from  "canvas";

export namespace BotUtils {
    export let client: Client;
    export let commandHandler: CommandHandler;

    export function sendImages(imageCanvses: Canvas[], message: Message){
        try{
        console.log("Sending pattern for "+message.author.username);
        let attachmentArray: MessageAttachment[] = [];
        for(let i = 0; i < imageCanvses.length; i++){
            attachmentArray[i] = new MessageAttachment(imageCanvses[i].toBuffer(), `Instructions_${i}.png`);
        }
        let replyMessage: string = "";
        if (attachmentArray.length == 1){
            replyMessage = "here's instructions for your pattern! Make sure to click `Open original` to view it at full resolution.";
        }else replyMessage = "here's instructions for your patterns! Make sure to click `Open original` to view them at full resolution.";
        message.channel.send(replyMessage,{
            files: attachmentArray,
            reply: message.author
        });
        }catch(error){
            message.channel.send("Error sending image(s)!");
            throw new Error(error);
        }
    }
}