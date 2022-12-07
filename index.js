const { REST, Routes, Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { Configuration, OpenAIApi } = require('openai')
const dotenv = require('dotenv');

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const commands = [
    {
        name: 'draw',
        description: 'draw image api',
        options: [
            {
                name: 'prompt',
                description: 'prompt to draw',
                type: 3,
                required: true,
            },
        ],
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'draw') {
        const message = interaction.options.data[0].value

        if (message == '') {
            await interaction.reply('ใส่ข้อความที่จะให้วาดด้วยนะ');
            return
        }

        try {
            const response = await openai.createImage({
                prompt: message,
                n: 1,
                size: "512x512",
            });
            const image_url = response.data.data[0].url;
            // console.log(image_url);

            const embed = {
                image: {
                    url: image_url,
                },
            };

            await interaction.reply({embeds: [embed] });
            return
        } catch (err) {
            await interaction.reply('งงๆ ขอจูนสมองแปป');
            return
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);