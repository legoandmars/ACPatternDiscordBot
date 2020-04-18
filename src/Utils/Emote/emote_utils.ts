const twemoji = require("twemoji-parser");

export namespace EmoteUtils {
    export let emoteLimit: number = 5;

    function emojiToUrl(emote: string): string{
        if(emote.includes(':')){
            let splitEmote = emote.split(":");
            if(splitEmote[1] != null && splitEmote[1] != ""){
                return `https://cdn.discordapp.com/emojis/${emote.split(":")[1]}.png`
            }else return null;
        }
    }
    export const ErrorCodes = {
        NoEmojis: "No attached emotes(s)!",
        TooManyEmojis: `Too many emotes! Please limit your message to ${emoteLimit.toString()}.`
    }
    
    export function urlsFromEmojiString(emojiString: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            let emoteArray: string[] = emojiString.split(new RegExp('(?<=\:)(.*?)(?=\>)'));
            let unicodeEmoteArray = twemoji.parse(emojiString,{assetType: 'png'})
            if(emoteArray != null && unicodeEmoteArray != null){
                let emoteUrlArray: string[] = [];
                for(let i = 0; i < emoteArray.length; i++){
                    let emojiUrl = emojiToUrl(emoteArray[i])
                    if(emojiUrl != null){
                        emoteUrlArray.push(emojiUrl);
                    }
                }
                for(let i = 0; i < unicodeEmoteArray.length; i++){
                    if(unicodeEmoteArray[i].url != null){
                        emoteUrlArray.push(unicodeEmoteArray[i].url);
                    }
                }
                emoteUrlArray = emoteUrlArray.filter((a, b) => emoteUrlArray.indexOf(a) === b);
                if(emoteUrlArray.length == 0) reject(ErrorCodes.NoEmojis);
                if(emoteUrlArray.length > emoteLimit) reject(ErrorCodes.TooManyEmojis);
                resolve(emoteUrlArray);
                //let imagesArray: Canvas[] = [];
            }else reject(ErrorCodes.NoEmojis);
        });
    }
    
}