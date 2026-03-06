const handleCommand = require("./commandHandler")
const config = require("./config")

const rawCommand = process.argv[2]
const user = process.argv[3]
const target = process.argv[4]

if (!rawCommand || !user) {
    console.log("⚠ Usage: node index.js .command <user> [target]")
    process.exit()
}

if (!rawCommand.startsWith(config.prefix)) {
    console.log("❌ Invalid prefix. Use .command")
    process.exit()
}

const command = rawCommand.slice(config.prefix.length)

const result = handleCommand(command, user, target)

console.log(result)