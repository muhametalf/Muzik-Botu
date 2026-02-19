const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");
const play = require("play-dl");
const config = require("./config.json"); // token, sesId, pavyon burda

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once("ready", async () => {
  console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);

  try {
    // Kanalı al
    const channel = await client.channels.fetch(config.sesId);
    if (!channel) return console.error("Ses kanalı bulunamadı!");

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();

    // YouTube oynatma fonksiyonu
    const playMusic = async () => {
      try {
        const stream = await play.stream(config.pavyon);
        const resource = createAudioResource(stream.stream, {
          inputType: stream.type,
        });
        player.play(resource);
        console.log("Yayın çalıyor...");
      } catch (err) {
        console.error("Yayın hatası:", err.message);
      }
    };

    // İlk oynatmayı başlat
    await playMusic();
    connection.subscribe(player);

    // Yayın biterse yeniden başlat
    player.on(AudioPlayerStatus.Idle, async () => {
      console.log("Yayın yeniden başlatılıyor...");
      await playMusic();
    });

    player.on("error", (err) => {
      console.error("Player hatası:", err.message);
    });

  } catch (err) {
    console.error("Genel hata:", err.message);
  }
});

client.login(config.token);
