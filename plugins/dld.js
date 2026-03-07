const { exec } = require("child_process")

module.exports = {
    name: "dld",

    async execute(user, args) {

        if (!args) {
            return `📥 Cobra Downloader

Usage:
.dld <youtube link>`
        }

        const filename = `video_${Date.now()}.mp4`

        return new Promise((resolve) => {

            exec(`yt-dlp -f mp4 -o "${filename}" ${args}`, (error) => {

                if (error) {
                    console.log("YTDLP ERROR:", error)
                    resolve("⚠ Failed to download video")
                    return
                }

                resolve({
                    file: filename,
                    text: "📥 Video downloaded! Sending..."
                })

            })

        })

    }
}