require("dotenv").config()

module.exports = {

    botName: "Project Cobra",
    version: "1.0.0",

    ownerName: process.env.OWNER_NAME,
    owner: [process.env.OWNER_NUMBER],

    prefix: ".",
    mode: "Public"

}