import * as dotenv from 'dotenv';
import * as cheerio from 'cheerio';

import axios from 'axios';
import chalk from 'chalk';

import { MangaMetadata } from './metadata-types';
import { Client, GatewayIntentBits } from 'discord.js';

const bot = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
] });

dotenv.config();
const token = process.env.token;

const err = chalk.red('ERROR: ');
const arw = chalk.green('>> ');

//Init upon bot loading
bot.on('ready',()=>{
    console.log('Logged in! マドカ先輩 is up and running');

});


bot.on('message', (message)=>{

    if(message.author.bot) return;

    let usersmessage = message.content;
    if(usersmessage.indexOf('?')!=-1){

        usersmessage = usersmessage.substr(1, usersmessage.length-1);

        if(usersmessage.indexOf('<')===0 && usersmessage.indexOf('>')===usersmessage.length-1){
            
            var replyto = message.author.username;
            var avatar = message.author.id + '/' +  message.author.avatar ;
            
            usersmessage = usersmessage.substr(1, usersmessage.length-2);

            mangaQuerySearch(usersmessage, 3).then((url)=>{

                console.log(arw, chalk.blue(url), ' was retrieved.');

                getMangaPage(url, 3).then((metadata)=>{

                    console.log(arw, 'Preparing to send...');

                    var result = {
                        "embed": {
                            "description": metadata.synopsis,
                            "color": 11962048,
                            "timestamp": new Date(),
                            "footer": {
                              "icon_url": "https://cdn.discordapp.com/avatars/" + avatar + ".png",
                              "text": "Requested by: " + replyto
                            },
                            "author": {
                                "name":metadata.title
                            }
                        }
                    };

                    if(metadata.image){
                        result.embed["image"] = { "url": metadata.image};
                        console.log(arw, "Image properly loaded");
                    }else{
                        console.log(err, "Image failed to load or unavailable");
                    }

                    //console.log(arw, "Sending: \n", chalk.green(JSON.stringify(result)));
                    message.channel.send(result);
                    console.log(arw, 'Sent!');

                }).catch((error)=>{
                    console.log(err, error);

                    message.reply('すみません！ An error occured while retrieving the manga metadata please try again...');
                });

            }).catch((error)=>{
                console.log(err, error);

                message.reply('すみません！ An error occured while retrieving the manga from the searchengine please try again later...');
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
function mangaQuerySearch(manga: string, retries: number){

    console.log(arw, 'Retrieving manga result HTML body...');
    //Creates the url to be requested
    var url = process.env.searchengine + manga;

    return axios.get(url)
        .then((body)=>{

            console.log(arw, 'Manga result HTML body loaded.');
            return getMangaPageURL(body);
        })
        .catch((error)=>{

            if(retries>0){
                console.log('ERROR: ',error);
                return mangaQuerySearch(manga, retries-1);
            }
            else{
                throw 'Unable to retrieve after multiple retries'
            }
    
        })

}

/**
 * This retrieves the manga URL from the given selector argument in the env file
 * 
 * @param {String} body This refers to the body of the html document where the search engine result is
 * 
 * @returns {String} This returns the url of the first result of the search engine
 */
function getMangaPageURL(body){
    
    console.log(arw, 'Retrieving manga url...');

    var $ = cheerio.load(body);
    var result = process.env.result;

    return $(result).first().attr('href');
    
}

/**
 * This retrieves the metadata from the page
 * 
 * @param {String} url This refers to the page of the result manga itself
 * @param {Number} retries The number of retries till the bot gives up
 * 
 * @returns {Promise} This returns a promise of the object metadata of the manga page
 */
function getMangaPage(url: string, retries: number){

    console.log(arw, 'Retrieving manga page HTML body...');
    
    return axios.get(url)
        .then((body)=>{

            console.log(arw, 'Manga page HTML body loaded.');
            return getMangaPageData(body);
        })
        .catch((error)=>{

            if(retries>0){
                console.log('ERROR: ',error);
                return getMangaPage(url, retries-1);
            }
            else{
                throw 'Unable to retrieve after multiple retries';
            }
        })
}

/**
 * Retrieves the metadata from the manga page
 * 
 * @param {String} body This refers to the HTML document of the manga page 
 * 
 * @returns {object} This returns the metadata object of the page
 */
function getMangaPageData(body){

    console.log(arw, 'Retrieving manga metadata...');
    
    const 
        $ = cheerio.load(body),
        title = process.env.title,
        imageurl = process.env.imageurl,
        synopsis = process.env.synopsis;

    const metadata: MangaMetadata = {
        title: $(title).first().text(),
        synopsis: $(synopsis).text(),       
    };

    if(imageurl){
        metadata.image = $(imageurl).attr('data-src');
    }

    console.log(arw, 'metadata has been retrieved');
    return metadata; 
}