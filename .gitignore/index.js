const Discord = require('discord.js');
var bot = new Discord.Client();
var prefix = ("x-");
const YTDL = require("ytdl-core");
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('database.json');
const db = low(adapter);
const talkedRecently = new Set();
const cooldown = new Set();
bot.login(process.env.TOKEN);
db.defaults({ histoires: [], xp: []}).write()

function play(connection, message) {
    var server = servers[message.guild.id];

    server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));

    server.queue.shift();

    server.dispatcher.on("end", function() {
        if (server.queue[0]) play(connection, message);
        else connection.disconnect();
    });
}

var servers = {};

bot.on("ready", function() {
    bot.user.setActivity(`x-help | ${bot.guilds.size} serveurs | ${bot.users.size} utilisateurs`)
    console.log("Connected");

bot.on("message", function(message) {
    if (message.author.equals(bot.user)) return;
    
    if (!message.content.startsWith(prefix)) return;
    
    var args = message.content.substring(prefix.length).split(" ");
    
    switch (args[0].toLowerCase()) {
        case "play":
        var argsplay = message.content.substring(prefix.length).split(" ");
            if (!argsplay[1]) {
                message.channel.sendMessage("Merci d'envoyer le lien.");
                return;
            }

            if (!message.member.voiceChannel) {
                message.channel.sendMessage("Tu dois être dans un channel vocal.");
                return;
            }

            if(!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            };

            var server = servers[message.guild.id];

            server.queue.push(argsplay[1]);

            if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
                play(connection, message);
                message.channel.send("Lancement de votre musique. \n En cas de problème, vérifier si c'est un lien ( et non un teste ), si celle-ci n'a pas de copyright ou est correcte.")
            });
            break;
        case "skip":
            var server = servers[message.guild.id];

            if (server.dispatcher) server.dispatcher.end();
            message.channel.send("Musique skipé !\nEn cas de problème, vérifier si c'est un lien ( et non un teste ), si celle-ci n'a pas de copyright ou est correcte.")
            break;
        case "stop":
            var server = servers[message.guild.id];

            if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
            message.channel.send("Musique arrêté.")
            break;
            case "avatar":
            if (!message.mentions.users.first()) return message.channel.send("Merci de mentionner un utilisateur")
                let user = message.mentions.users.first() ? message.mentions.users.first() : message.author
                let ava = user.displayAvatarURL
                let embed = {
                color:0x000000,
                description:"Avatar de "+user.username+"",
                image:{url:ava}
                }
            message.channel.send("", {embed})
            break;
            case "help":
                var embede = new Discord.RichEmbed()
                    .setDescription(`${message.author.username}, Voici la liste des commandes:`)
                    .addField(`Divertissement`, "` \n x-8ball \n x-sondage-t`", true)
                    .addField(`Musique`, "`x-play \n x-skip \n x-stop`", true)
                    .addField("Utilitaire", "` x-avatar \n x-profil \n x-serverinfo \n x-botinfo \n x-id \n x-ping \n x-invite \n x-support`", true)
                    .addField(`Modération`, "` x-ban \n x-kick \n x-clear`", true)
                    .addField(`Administration`, "` x-sondage \n x-say`", true)
                    .addField(`Support`, "[[Clique ici pour accéder au support du Bot]](https://discordapp.com/invite/DRuyt7Q)", true)
                    .setFooter(`Xonaria`)
                    .setTimestamp()
                    .setColor("0xDF7401")
                message.channel.sendEmbed(embede)
            break;
            case "support":
                var embedef = new Discord.RichEmbed()
                    .setDescription(`Support`)
                    .addField(`Un problème avec le bot ? Ou vous voulez juste rejoindre le discord du créateur de celui-ci ?`, `[Clique ici pour rejoindre](https://discordapp.com/invite/DRuyt7Q)`, true)
                    .setFooter(`Xonaria`)
                    .setTimestamp()
                    .setColor("0xDF7401")
                message.channel.sendEmbed(embedef)
               break;
               case "say":
               if(message.member.hasPermission("ADMINISTRATOR")) {
               message.delete();
               let args = message.content.split(" ").slice(1);
               let thingToEcho = args.join(" ")
               message.channel.sendMessage(thingToEcho)
           } else {
               message.reply(`tu n'as pas la permission de faire cette commande.`)}
           break;
           case "serverinfo":
       var embedee = new Discord.RichEmbed()
           .setDescription("Server info")
           .addField("Nom du Discord", message.guild.name)
           .addField("Crée le", message.guild.createdAt)
           .addField("Tu as rejoin le", message.member.joinedAt)
           .addField("Utilisateurs sur le discord", message.guild.memberCount)
           .addField("Nombre de channels sur ce discord", `${message.guild.channels.size}`)
           .setColor("0xFE2E64")
       message.channel.sendEmbed(embedee)
           break;
           case "sondage":
           if (message.member.hasPermission("MANAGE_MESSAGES")) {
               let args = message.content.split(" ").slice(1);
               let thingToEcho = args.join(" ")
               if (!thingToEcho) return message.reply("Merci d'envoyer une question pour le sondage")
               if (!message.guild.channels.find("name", "sondage")) return message.reply("Le channel sondage est introuvable. merci de crée ce channel pour que celui-ci marche.")
               var embedeee = new Discord.RichEmbed()
                   .setDescription("Sondage")
                   .addField(thingToEcho, "Répondre avec :white_check_mark: ou :x:")
                   .setColor("0xB40404")
                   .setTimestamp()
           message.channel.sendMessage("Votre sondage a bien été envoyé dans #sondage.")
           message.guild.channels.find("name", "sondage").sendEmbed(embedeee)
           .then(function (message) {
               message.react("✅")
               message.react("❌")
           }).catch(function() {
           });
           }else{
               return message.reply("Tu n'as pas la permission.")}
           break;
            case "kick":
           let command = message.content.split(" ")[0];
           const args = message.content.slice(prefix.length).split(/ +/);
           command = args.shift().toLowerCase();
    
               if(!message.member.hasPermission("KICK_MEMBERS")) {
                   return message.reply("Tu n'as pas la permission de faire cette commande.").catch(console.error);
               }
               if(message.mentions.users.size === 0) {
                   return message.reply("Merci de mentionner l'utilisateur à expluser.").catch(console.error);
               }
               let kickMember = message.guild.member(message.mentions.users.first());
               if(!kickMember) {
                   return message.reply("Cet utilisateur est introuvable ou impossible à expulser.")
               }
               if(!message.guild.member(bot.user).hasPermission("KICK_MEMBERS")) {
                   return message.reply("Je n'ai pas la permission KICK_MEMBERS pour faire ceci.").catch(console.error);
               }
               kickMember.kick().then(member => {
                   message.reply(`${member.user.username} a été expulsé avec succès.`).catch(console.error);
                   message.guild.channels.find("name", "general").send(`**${member.user.username}** a été expulsé du discord par **${message.author.username}**`)
               }).catch(console.error)
           break;
           case "ban":
           let commande = message.content.split(" ")[0];
           const argse = message.content.slice(prefix.length).split(/ +/);
           commande = argse.shift().toLowerCase();
           if(!message.member.hasPermission("BAN_MEMBERS")) {
               return message.reply("Tu n'as pas la permission de faire cette commande.").catch(console.error);
           }
           const member = message.mentions.members.first();
           if (!member) return message.reply("Merci de mentionner l'utilisateur à bannir.");
           member.ban().then(member => {
               message.reply(`${member.user.username} a été banni avec succès.`).catch(console.error);
               message.guild.channels.find("name", "general").send(`**${member.user.username}** a été banni du discord par **${message.author.username}**`)
           }).catch(console.error)
           break;
           case "8ball":
           let argsed = message.content.split(" ").slice(1);
           let tte = argsed.join(" ")
           if (!tte){
               return message.reply("Merci de poser une question. :8ball:")};
    
               var replys = [
               "Oui.",
               "Non.",
               "Je ne sais pas.",
               "Peut-être.",
               "Probablement."
               ];
           
               let reponse = (replys[Math.floor(Math.random() * replys.length)])
               var ballembed = new Discord.RichEmbed()
               .setDescription(":8ball: 8ball")
               .addField("Question", tte)
               .addField("Réponse", reponse)
               .setColor("0x40FF00")
           message.channel.sendEmbed(ballembed)
               break;
           case "id":
               var idembed = new Discord.RichEmbed()
                   .setDescription(`Votre IDENTIFIANT/ID est ${message.author.id}`)
               message.channel.sendEmbed(idembed)
               break;
           case "ping":
               message.channel.sendMessage('Temp de latence avec le serveur: `' + `${message.createdTimestamp - Date.now()}` + ' ms`');
               break;
           case "clear":
           if (message.member.hasPermission("MANAGE_MESSAGES")) {
               message.channel.fetchMessages()
                  .then(function(list){
                       message.channel.bulkDelete(list);
                   }, function(err){message.channel.send("Erreur")})}
               break;
           case "invite":
               var invembed = new Discord.RichEmbed()
               .setDescription("Invite moi sur ton serveur: https://discordapp.com/oauth2/authorize?client_id=427432036152770560&scope=bot&permissions=359005431")
              message.channel.sendEmbed(invembed)
           break;
           case "botinfo":
               var embedbot = new Discord.RichEmbed()
                   .setDescription("Information")
                   .addField("Nombre de discord sur lequel je suis", `${bot.guilds.size} serveur(s)`)
                   .addField(`Nombre d'utilisateur(s) au total sur les ${bot.guilds.size} serveur(s) ou je suis`, `${bot.users.size} utilisateur(s)`)
                   .addField("Crée par", "[PZH#8058](https://www.youtube.com/c/pzhcodage)")
                   .addField("Crée le", "31/03/2018")
                   .addField("Version", "1.0.0")
                   .setColor("0x81DAF5")
               message.channel.sendEmbed(embedbot)
           break;
            case "tempsondage":
                let argson = message.content.split(" ").slice(1);
                let thingToEchon = argson.join(" ")
                if (!thingToEchon) return message.reply("Merci d'envoyer une question pour le sondage temporaire de 5 minutes")
                if (!message.guild.channels.find("name", "sondage-temp")) return message.reply("Erreur: le channel `sondage-temp` est introuvable, il est nécéssaire de le créer pour effectuer cette commande.");
                if (message.channel.name !== 'sondage-temp') { return message.reply("Cette commande ne se fait pas ici, elle se fait dans `sondage-temp`");
                }else{
                message.delete()
                if (cooldown.has(message.author.id)) return message.author.send(`**[ Command __tempsondage__ via le discord __${message.guild.name}__ ]** Veuillez attendre 12 heures avant de re-éffectuer cette commande.`);
            
            
                    cooldown.add(message.author.id);
            
                    setTimeout(() => {
            
                      cooldown.delete(message.author.id);
            
                    }, 43200000);
                setTimeout(() => message.guild.channels.find("name", "sondage-temp").send(`Le sondage de ${message.author.username} vient d'expirer.`), 10000)
                var embedeeeon = new Discord.RichEmbed()
                    .setDescription("Sondage Temporaire")
                    .addField(thingToEchon, "Répondre avec :white_check_mark: ou :x:")
                    .addField("Fin du sondage dans", "Moin de 5 minutes")
                    .setColor("0xFF00FF")
                    .setFooter(`Requête de ${message.author.username}`)
                    .setTimestamp()
                message.channel.sendEmbed(embedeeeon)
                .then(function (message) {
                message.react("✅")
                message.react("❌")
                setTimeout(() => message.delete(), 300000)
                if (talkedRecently.has(message.author)) {
                    message.delete()
                } else {
                talkedRecently.add(message.author);
                setTimeout(() => {
                    talkedRecently.delete(message.author);
                }, 43200000);
                }
                }).catch(function() {
                });

            break;

        }


};

bot.on('message', message => {

var msgauthor = message.author.id;

if(message.author.bot)return;
    
if(!db.get("xp").find({user: msgauthor}).value()){
    db.get("xp").push({user: msgauthor, xp: 1}).write();
}else{
    var userxpdb = db.get("xp").filter({user: msgauthor}).find('xp').value();
    console.log(userxpdb);
    var userxp = Object.values(userxpdb)
    console.log(userxp)
    console.log(`Nombre d'xp : ${userxp[1]}`)

    db.get("xp").find({user: msgauthor}).assign({user: msgauthor, xp: userxp[1] += 1}).write();

if (message.content === prefix + "profil") {
var xp = db.get("xp").filter({user: msgauthor}).find('xp').value()
var xpfinal = Object.values(xp);
var statembed = new Discord.RichEmbed()
.setDescription("Profil")
.addField("Ton pseudo", `${message.author.tag}`, true)
.addField("Ton identifiant", `${message.author.id}`, true)
.addField("Tu as rejoin le", `${message.member.joinedAt}`, true)
.addField("Nombre de message envoyé", `${xpfinal[1]}`, true)
.setColor("0xFF0040")
message.channel.sendEmbed(statembed)
}}})})})
