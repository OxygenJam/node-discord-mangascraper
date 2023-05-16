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
    console.log('Logged in! マドカ先輩 is up and running');
});


bot.once(Events.MessageCreate, (message)=>{

    if(message.author.bot) return;

    let usersmessage = message.content;
    if(usersmessage.indexOf('?')!=-1){

        usersmessage = usersmessage.substr(1, usersmessage.length-1);

        if(usersmessage.indexOf('<')===0 && usersmessage.indexOf('>')===usersmessage.length-1){
            
            const 
                replyto = message.author.username,
                avatar = message.author.id + '/' +  message.author.avatar;
            
            usersmessage = usersmessage.substr(1, usersmessage.length-2);

            mangaQuerySearch(usersmessage, 3)
            .then((metadata)=>{

                console.log(arw, 'Preparing to send...');

                const mangaResult = new EmbedBuilder({
                    author:{
                        name: metadata.title.romaji
                    },
                    fields:[
                        { name: "Romaji", value: metadata.title.romaji },
                        { name: "English", value: metadata.title.english },
                        { name: "Native", value: metadata.title.native },
                        { name: "Status", value: metadata.status },
                    ],
                    color: 11962048,
                    timestamp: new Date(),
                    footer:{
                        icon_url: `https://cdn.discordapp.com/avatars/${avatar}.png`,
                        text: `Requested by: ${replyto}`
                    }
                })

                if(metadata.coverImage){
                    mangaResult.setImage(metadata.coverImage.medium);
                    console.log(arw, "Image properly loaded");
                }else{
                    console.log(err, "Image failed to load or unavailable");
                }

                //console.log(arw, "Sending: \n", chalk.green(JSON.stringify(result)));
                message.channel.send({embeds: [mangaResult]});
                console.log(arw, 'Sent!');

            }).catch((error)=>{
                console.log(err, error);

                message.reply(`すみません！ ${error.message}`);
            })
        }
    }
});

bot.login(token);

/**
 * Retrieves the manga from a search engine
 * 
 * @param {String} manga The manga to be searched in the search engine
 * @param {Number} retries The number of retries till the bot gives up
 * 
 * @returns {Promise} This returns a promise of the URL of the first result of the search engine
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
        body: JSON.stringify({
            query: AniListQuery,
            variables: aniListArgs
        })
    };

    return axios(query)
    .then((res) => {
        const result: MangaResult = res.data.json();
        
        return result;
    })
    .catch((error) => {
        if(error.response.status === 404){
            throw 'No results found';
        }
        else{
            if(retries>0){
                console.log('ERROR: ', err);
                return mangaQuerySearch(manga, retries-1);
            }
            else{
                throw 'Something went wrong while retrieving the manga';
            }
        }
    })
}
