import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";
import { Command } from "./types";
import { arw, err, mangaQuerySearch, populateEmbedFields, sanitizeStringFromHTML } from "../utils/helper";

export const mangaCmd: Command = {
    name: "manga",
    description: "Finds the manga",
    type: ApplicationCommandType.ChatInput,
    options: [ // Basically arguments user inputs
        {
            name: "manga",
            description: "The name of the manga to search",
            type: ApplicationCommandOptionType.String
        }
    ],
    run: async (client: Client, interaction: ChatInputCommandInteraction) => {
        try{
            const query = interaction.options.getString("manga", true);

            mangaQuerySearch(query, 3)
            .then((metadata)=>{

                console.log(arw, 'Preparing to send...');
                const avatar = `${interaction.user.id}/${interaction.user.avatar}`;
                const mangaResult = new EmbedBuilder({
                    author:{
                        name: metadata.title.romaji
                    },
                    url: metadata.siteUrl,
                    description: sanitizeStringFromHTML(metadata.description),
                    fields: populateEmbedFields(metadata),
                    color: 11962048,
                    timestamp: new Date(),
                    footer:{
                        icon_url: `https://cdn.discordapp.com/avatars/${avatar}.png`,
                        text: `Requested by: ${interaction.user.username}`
                    }
                })

                if(metadata.coverImage){
                    mangaResult.setImage(metadata.coverImage.large);
                    mangaResult.setThumbnail(metadata.coverImage.medium);
                    console.log(arw, "Image properly loaded");
                }else{
                    console.log(err, "Image failed to load or unavailable");
                }

                interaction.followUp({embeds: [mangaResult]});
                console.log(arw, 'Sent!');

            }).catch((error)=>{
                console.error(err, error);

                interaction.followUp(`すみません！ ${error.message}`);
            })
            return;
        }
        catch(e){
            console.error(err, e.message);
            interaction.followUp('An error occurred while processing your command');
        }
    }
}