const fs = require("fs")

module.exports = {
    name: "ban",
    execute(user, targetName, data, dbPath) {

        if (user.role !== "owner") {
            return "👑 Only Owner can ban users"
        }

        const target = data.users.find(u => u.name === targetName)

        if (!target) {
            return "❌ Target user not found"
        }

        target.banned = true
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))

        return `🚫 ${target.name} has been banned by ${user.name}`
    }
}