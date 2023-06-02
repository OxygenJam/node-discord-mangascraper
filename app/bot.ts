import * as dotenv from 'dotenv';

import chalk from 'chalk';

import { mangaQuerySearch, arw, sanitizeStringFromHTML, populateEmbedFields, err } from './utils/helper';
import { ActivityType, CommandInteraction, Interaction } from 'discord.js';
import { commands } from './commands/commands';

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

//Init upon bot loading
bot.once(Events.ClientReady,()=>{
    bot.application.commands.set(commands);
    console.log(chalk.green('Logged in! '), 'マドカ先輩 is up and running');
    bot.user.setActivity({
        name:"anime 👀",
        type: ActivityType.Watching,
        url: "https://www.youtube.com/channel/UCYHM6s0dk0PgFqNmnqHfHkQ"
    })
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
                fields: populateEmbedFields(metadata),
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

            message.reply({embeds: [mangaResult]});
            console.log(arw, 'Sent!');

        }).catch((error)=>{
            console.error(err, error);

            message.reply(`すみません！ ${error.message}`);
        })
    }
});


bot.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if(!interaction.isCommand()) return;

    // Get the command snowflake via command name
    await handleCommand(bot, interaction);
});

async function handleCommand(client: Client, interaction: CommandInteraction): Promise<void> {
    const slashCommands = commands.find(c => c.name === interaction.commandName);

    if(!slashCommands){
        interaction.reply("すまー、わかりません! I don't understand the command");
        return;
    }

    await interaction.deferReply();

    slashCommands.run(client, interaction);
}

bot.login(token);