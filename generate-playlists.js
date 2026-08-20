const fs = require("fs");
const path = require("path");

const SONGS_DIR = path.join(__dirname, "songs");
const OUTPUTS = [
  path.join(__dirname, "playlists.json"),
  path.join(__dirname, "www", "playlists.json"),
];

const moods = ["village", "town", "mountain", "river", "rain", "forest"];
const playlists = {};

moods.forEach((mood) => {
  const folder = path.join(SONGS_DIR, mood);

  if (!fs.existsSync(folder)) {
    playlists[mood] = [];
    return;
  }

  const songs = fs.readdirSync(folder)
    .filter(f => f.toLowerCase().endsWith(".mp3"))
    .map(file => ({
      title: path.parse(file).name,
      file: `songs/${mood}/${file}`
    }));

  playlists[mood] = songs;
});

OUTPUTS.forEach(file => {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(file, JSON.stringify(playlists, null, 2));
});

console.log("✅ playlists.json generated!");