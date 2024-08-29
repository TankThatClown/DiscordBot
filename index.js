const {Client,GatewayIntentBits,EmbedBuilder, Embed} = require('discord.js');
const config= require("./config.json")
const csvParser=require("csv-parser")
const dataSystem=require("./dataSystem")
const fs =require("fs")
let censorList=[]
csvSetup()
const {ShowTable,InsertData,CheckUser,Exist,updateUser,returnUser}=dataSystem
const client = new Client({
    intents:[
        GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
       // GatewayIntentBits.messageCreate
    ],
});
const token=config.botToken;
client.login(token);
const prefix="!"
let channelJoin="";
const commandList ={
    "help":"list all listing commands",
    "ping":"ping the user",
    "kill":"kill an user and give him a killed role",
    "invite":"invite bot to your own server",
    "msg":"send an message to someone",
    "setjoin":"Send the channel for Join Notification",
    "enablelvl":"enable leveling for user",
    "checklvl":"check your current level"
}
client.on('ready',()=>{
    client.application.commands.create({
        name:"help",
        description:"list all existing commands"
    })
    client.application.commands.create({
        name:"enablelvl",
        description:"enableLevel"
    })
    client.application.commands.create({
        name:"checklvl",
        description:"check your current level"
    })
    client.application.commands.create({
        name:"invite",
        description:"invite the bot"
    })
    client.application.commands.create({
        name:"setjoin",
        description:"set the current channel as the designated join channel"
    })
    client.application.commands.create({
        name:"kill",
        description:"kill a player",
        options: [
            {
                name:"user",
                description:"user",
                type:6,
                required:true
            }
        ]
    })
    client.application.commands.create({
        name:"msg",
        description:"msg a user",
        options:[
            {
            name:"user",
            description:"user",
            type:6,
            required:true
            },
            {
            name:"message",
            description:"message",
            type:3,
            required:true
            }
        ]
    })

})
client.on('messageCreate', message => {
    if (message==""||message.author.bot) return;
    else if(compareWords(message.content.toLowerCase())) message.delete();
     updateUser(message.member.id,message);
     
})
client.on("guildMemberAdd",member=>
{
if(channelJoin!=null)
{
    channelJoin.send(`<@${member.user.id}> has joined the server!`)
}
else
{
    console.log("invalid channel set!");
}
})
client.on("interactionCreate",interaction=>
{
let {commandName,options}=interaction;
if(!interaction.isCommand()) return;
switch(commandName)
{
case "help":
    let response = "Available commands:\n";
    for (const [cmd, desc] of Object.entries(commandList)) {
        response += `**${cmd}**: ${desc}\n`;
    }
    interaction.reply(response);
    break;
case "kill":
          userId=options.getUser("user").id
          username=interaction.guild.members.cache.get(userId).user.username
          const EmbedImage = new EmbedBuilder()
            .setTitle(`${username} been killed`)
            .setColor("#ffffff")
            .setImage("https://ninjacoder58.neocities.org/Hip%20Hop%20Images.html/hulk%20smash.gif")
    interaction.reply({embeds:[EmbedImage]});
    break;
case "msg":
    usermention=options.getUser("user");
    usermention.send(options.getString("message"))
    break;
case "setjoin":
    channelJoin=interaction.channel;
    interaction.reply("join channel had been set!");
    break;
case "enablelvl":
    //console.log("ready");
    Exist(interaction.member.id,interaction); 
    break;
case "checklvl":
    returnUser(interaction.user.id,interaction);
    break;
case "invite":
    let link = new EmbedBuilder()
        .setTitle("invite bot")
        .setURL("https://discord.com/oauth2/authorize?client_id=1206457406939201566&permissions=8&response_type=code&redirect_uri=https%3A%2F%2Fdiscord.com%2Foauth2%2Fauthorize%3Fclient_id%3D1206457406939201566%26scope%3Dbot%26permissions%3D134144&scope=bot+applications.commands+guilds.members.read+applications.commands.permissions.update+guilds.join")
    interaction.user.send({embeds:[link]})
    break;
}
})
function csvSetup()
{
    const censorWord =[]
    fs.createReadStream("./profanity_en.csv")
    .pipe(csvParser())
    .on("data",(data)=> {
        for (const key in data) {
            if (data[key] === '')
              data[key] = null; // Or handle it as needed
        }
        censorWord.push(data)})
    .on("end", ()=> {
        console.log("censor list loaded")
        for(word of censorWord)
            {
                censorList.push(word.text)
            }
        console.log(censorList)
})
    
}
function compareWords(message)
{
    messArray= message.split(" ")
    for(content of messArray)
    {
        if(censorList.includes(content))
        {
            console.log(content)
            return true;
        }
    }
    return false;
}
