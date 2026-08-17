const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5500;;

app.use(express.static(__dirname));

app.get("/api/playlists", (req, res) => {

    const songsFolder = path.join(__dirname, "songs");

    const playlists = [
        "village",
        "town",
        "mountain",
        "river",
        "rain",
        "forest"
    ];

    const result = {};

    playlists.forEach((playlist) => {

        const folderPath = path.join(
            songsFolder,
            playlist
        );

        if (!fs.existsSync(folderPath)) {
            result[playlist] = [];
            return;
        }

        const files = fs.readdirSync(folderPath);

        result[playlist] = files
            .filter(file =>
                file.toLowerCase().endsWith(".mp3")
            )
            .map(file => ({
                name: path.parse(file).name,
                file:
                    `/songs/${playlist}/${encodeURIComponent(file)}`
            }));
    });

    res.json(result);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Music Player running on port ${PORT}`);
});