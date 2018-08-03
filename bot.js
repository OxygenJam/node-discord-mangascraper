require('dotenv').config();

const cheerio = require('cheerio');
const request = require('request-promise');

const Discord = require('discord.js');
const bot = new Discord.Client();

const token = process.env.token;

//Init upon bot loading
bot.on('ready',()=>{
    console.log('Logged in! マドカ先輩 is up and running');
});


bot.on('message', (message)=>{

    if(message.author.bot) return;

    let usersmessage = message.content;
    if(usersmessage.indexOf('?')){

        if(usersmessage.indexOf('<')===0 && usersmessage.indexOf('>')===usersmessage.length-1){

            usersmessage = usersmessage.substr(1, usersmessage.length-2);

            mangaQuerySearch(usersmessage, 3).then((url)=>{

                getMangaPage(url, 3).then((metadata)=>{

                    message.channel.send(metadata.title);
                    message.channel.send(metadata.synopsis, { files: [metadata.image] });

                }).catch((error)=>{
                    console.log('ERROR:', error);

                    message.reply('すみません！ An error occured while retrieving the manga metadata please try again...');
                });

            }).catch((error)=>{
                console.log('ERROR:', error);

                message.reply('すみません！ An error occured while retrieving the manga from the searchengine please try again...');
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
function mangaQuerySearch(manga, retries){

    //Creates the url to be requested
    var url = process.env.searchengine + manga;

    return request(url)
        .then((body)=>{
            console.log('Retrieving result url');
            return getMangaPageURL(body);
        }).catch((error)=>{

            if(retries>0){
                console.log('ERROR: ',error);
                return mangaQuerySearch(manga, retries-1);
            }
            else{
                console.log('ERROR:','Unable to retrieved after multiple retries');
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
    
    var $ = cheerio.load(body);
    var result = process.env.result;
    
    return $(result).first();
    
}

/**
 * This retrieves the metadata from the page
 * 
 * @param {String} url This refers to the page of the result manga itself
 * @param {Number} retries The number of retries till the bot gives up
 * 
 * @returns {Promise} This returns a promise of the object metadata of the manga page
 */
function getMangaPage(url, retries){
    
    return request(url)
        .then((body)=>{
            
            console.log("Retrieving metadata...");
            return getMangaPageData(body);

        }).catch((error)=>{

            if(retries>0){
                console.log('ERROR: ',error);
                return getMangaPage(manga, retries-1);
            }
            else{
                console.log('ERROR:','Unable to retrieved after multiple retries');
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
    
    var $ = cheerio.load(body);
    var title = process.env.title;
    var imageurl = process.env.imageurl;
    var synopsis = process.env.synopsis;

    var metadata ={};
    metadata.title = $(title).text();
    metadata.synopsis = $(synopsis).text();
    if(imageurl){
        metadata.image = $(imageurl).attr('src');
    }

    return metadata; 
}