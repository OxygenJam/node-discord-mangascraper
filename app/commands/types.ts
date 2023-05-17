import { BaseInteraction, ChatInputApplicationCommandData, Client, CommandInteraction } from "discord.js";

export interface Command extends ChatInputApplicationCommandData{
    run: (client: Client, interaction: BaseInteraction ) => void;
}