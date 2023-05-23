import axios from "axios";
import { APIEmbedField } from "discord.js";
import { MangaResult, AniListQuery } from "./anilist-query";
import chalk from "chalk";

export function populateEmbedFields(metadata: MangaResult): APIEmbedField[]{
    if(Object.keys(metadata).length === 0) return [];
    const
        fields: APIEmbedField[] = [],
        { romaji, english, native } = metadata.title,
        fieldBuilder = (k:string, v: string, i: boolean = true) => {
            return { name: k, value: v, inline: i };
        };
 
    if(romaji){
        fields.push(fieldBuilder("Romaji", romaji));
    }
    if(english){
        fields.push(fieldBuilder("English", english));
    }
    if(native){
        fields.push(fieldBuilder("Native", native));
    }
    if(metadata.status){
        fields.push(fieldBuilder("Status", metadata.status, false));
    }
    return fields;
}

/**
 * Sanitizes the string from HTML tags
 * 
 * @param {string} str The string to sanitize
 * @returns {string} A clean string without any HTML tags
 */
export function sanitizeStringFromHTML(str: string = ""){
    if(!str) return;
    return str.replace(/<\/?[^>]+(>|$)/g, "");
}

/**
 * Pascalize a given string
 * @param {string} str The string to pascalize
 * @returns {string} A PascalizedString
 */
export function pascalize(str: string = ""): string{
    if(!str) return;
    // group 1 and group 2
    return str.replace(/(\w)(\w*)/g, (g0,g1,g2) => {
        return g1.toUpperCase() + g2.toLowerCase();
    });

}

/**
 * Retrieves the manga from a search engine
 * 
 * @param {string} manga The manga to be searched in the search engine
 * @param {number} retries The number of retries till the bot gives up
 * 
 * @returns {Promise<MangaResult>} This returns a promise of the URL of the first result of the search engine
 */
export function mangaQuerySearch(manga:string, retries:number): Promise<MangaResult>{
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

export const err = chalk.red('ERROR: ');
export const arw = chalk.green('>> ');