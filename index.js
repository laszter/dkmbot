const { REST, Routes, Client, GatewayIntentBits, Events } = require('discord.js');
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

client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'draw') {
        const message = interaction.options.data[0].value
        console.log(message)
        if (message == '') {
            await interaction.reply('ใส่ข้อความที่จะให้วาดด้วยนะ');
            return
        }

        await interaction.deferReply();
        
        try {
            const response = await openai.createImage({
                prompt: message,
                n: 1,
                size: "512x512",
            })

            const image_url = response.data.data[0].url;
            // console.log(image_url);

            const embed = {
                image: {
                    url: image_url,
                },
            };

            console.log(embed)
            await interaction.editReply({embeds: [embed] });
        } catch (err) {
            await interaction.editReply('งงๆ ขอจูนสมองแปป');
        }
    }

    // if(interaction.commandName === 'ping') {
    //     // const image_url = 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-SsDzSW99tvqzOvqpE6GURve1/user-LiuOHgNwinhdGuKCUtnPRQHS/img-6lzeODU85C60xUYnPQS4DDxu.png?st=2022-12-07T01%3A45%3A52Z&se=2022-12-07T03%3A45%3A52Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2022-12-06T19%3A50%3A32Z&ske=2022-12-07T19%3A50%3A32Z&sks=b&skv=2021-08-06&sig=5%2Bxe2B9QI3Dc1sSKPJ/Y75R2VqsJfB4zgEAv4ruqOg8%3D';
    //     // const attachment = new AttachmentBuilder('https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png');
    //     const exampleEmbed = {
    //         title: 'xxx',
    //         image: {
    //             url: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png',
    //         },
    //     };
    //     // await interaction.reply({files: [attachment]});
    //     console.log(exampleEmbed)
    //     await interaction.reply({ embeds: [exampleEmbed] });
    //     return
    // }
});

client.login(process.env.DISCORD_BOT_TOKEN);