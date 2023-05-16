import * as dotenv from 'dotenv';

import axios from 'axios';
import chalk from 'chalk';

import { AniListQuery, MangaResult } from './anilist-query';
import {
    Client,
    Events,
    GatewayIntentBits ,
    EmbedBuilder
} from 'discord.js';

const bot = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
] });

dotenv.config();
const token = process.env.token;

const err = chalk.red('ERROR: ');
const arw = chalk.green('>> ');

//Init upon bot loading
bot.once(Events.ClientReady,()=>{
    console.log(chalk.green('Logged in! '), 'マドカ先輩 is up and running');
});


bot.on(Events.MessageCreate, (message)=>{

    if(message.author.bot) return;

    const
        commandReg =  /\?<([^<>]{1,})>/g,
        usersmessage = message.content;

    for(const match of usersmessage.matchAll(commandReg)){
        if(!match[1]) continue;

        const
            query = match[1],
            replyto = message.author.username,
            avatar = message.author.id + '/' +  message.author.avatar;
        
        mangaQuerySearch(query, 3)
        .then((metadata)=>{

            console.log(arw, 'Preparing to send...');

            const mangaResult = new EmbedBuilder({
                author:{
                    name: metadata.title.romaji
                },
                url: metadata.siteUrl,
                description: sanitizeStringFromHTML(metadata.description),
                fields:[
                    { name: "Romaji", value: metadata.title.romaji, inline: true },
                    { name: "English", value: metadata.title.english, inline: true },
                    { name: "Native", value: metadata.title.native, inline: true  },
                    { name: "Status", value: metadata.status }
                ],
                color: 11962048,
                timestamp: new Date(),
                footer:{
                    icon_url: `https://cdn.discordapp.com/avatars/${avatar}.png`,
                    text: `Requested by: ${replyto}`
                }
            })

            if(metadata.coverImage){
                mangaResult.setImage(metadata.coverImage.large);
                mangaResult.setThumbnail(metadata.coverImage.medium);
                console.log(arw, "Image properly loaded");
            }else{
                console.log(err, "Image failed to load or unavailable");
            }

            //console.log(arw, "Sending: \n", chalk.green(JSON.stringify(result)));
            message.reply({embeds: [mangaResult]});
            console.log(arw, 'Sent!');

        }).catch((error)=>{
            console.error(err, error);

            message.reply(`すみません！ ${error.message}`);
        })
    }
});

bot.login(token);

/**
 * Sanitizes the string from HTML tags
 * 
 * @param {string} str The string to sanitize
 * @returns {string} A clean string without any HTML tags
 */
function sanitizeStringFromHTML(str: string){
    return str.replace(/<\/?[^>]+(>|$)/g, "");
}

/**
 * Retrieves the manga from a search engine
 * 
 * @param {string} manga The manga to be searched in the search engine
 * @param {number} retries The number of retries till the bot gives up
 * 
 * @returns {Promise<MangaResult>} This returns a promise of the URL of the first result of the search engine
 */
function mangaQuerySearch(manga:string, retries:number): Promise<MangaResult>{
    console.log(arw, `Attempting to retrieve manga ${manga}`);
    const 
        searchEngine = 'https://graphql.anilist.co',
        aniListArgs = {
            search: manga
        };

    const query = {
        method: 'POST',
        url: searchEngine,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        data: {
            query: AniListQuery,
            variables: aniListArgs
        }
    };

    return axios(query)
    .then((res) => {
        const 
            { data } = res.data,
            { Media } = data,
            result: MangaResult = Media;
        
        return result;
    })
    .catch((error) => {
        if(error.response.status === 404){
            throw new Error('No results found');
        }
        else{
            if(retries>0){
                console.error(err, error.response.data || error.message);
                return mangaQuerySearch(manga, retries-1);
            }
            else{
                console.error(err, error.response.data || error.message)
                throw new Error('Something went wrong while retrieving the manga');
            }
        }
    })
}
