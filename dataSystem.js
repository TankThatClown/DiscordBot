const mysql = require("mysql");
const { EmbedBuilder } = require("discord.js");
const config = require("./config.json");

// Create MySQL connection
const connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

// Create table if not exists
connection.query('CREATE TABLE IF NOT EXISTS user (id BIGINT PRIMARY KEY, lvl INTEGER, cb INTEGER, mb INTEGER);', function (err, result) {
    if (err) console.error("Table creation error:", err);
});

// Insert data into user table
function InsertData(userID) {
    connection.query(`INSERT INTO user (id, lvl, cb, mb) VALUES (?, 0, 0, 10)`, [userID], function (err, result) {
        if (err) console.error("Insert error:", err);
    });
}

// Show all data from user table
function ShowTable() {
    connection.query(`SELECT * FROM user;`, function (err, result) {
        if (err) console.error("Show table error:", err);
        else {
            console.log("Data shown");
            console.log(result);
        }
    });
}

// Delete user table
function DeleteTable() {
    connection.query(`DROP TABLE IF EXISTS user;`, function (err, result) {
        if (err) console.error("Delete table error:", err);
    });
}

// Check if user exists in the database
async function CheckUser(userID) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM user WHERE id = ?`, [userID], function (err, result) {
            if (err) {
                console.error("Query error:", err);
                reject(err);
            } else {
                resolve(result.length > 0);
            }
        });
    });
}

// Handle user existence
async function Exist(userID, interaction) {
    try {
        const userExists = await CheckUser(userID);
        if (!userExists) {
            await interaction.reply("Welcome new member");
            InsertData(userID);
        } else {
            await interaction.reply("You already enabled level");
        }
    } catch (error) {
        console.error("Exist function error:", error);
        await interaction.reply("An error occurred");
    }
}

// Update user data
async function updateUser(userID, message) {
    try {
        const userExists = await CheckUser(userID);
        if (userExists) {
            updateData(userID, message);
        }
    } catch (error) {
        console.error("updateUser function error:", error);
    }
}

// Update user data in the database
function updateData(userID, message) {
    connection.query(`UPDATE user SET cb = cb + 1 WHERE id = ?`, [userID], function (err, result) {
        if (err) console.error("Update error:", err);
        else {
            levelUp(userID, message);
        }
    });
}

// Level up user if experience cap is exceeded
function levelUp(userID, message) {
    connection.query(`SELECT * FROM user WHERE id = ?`, [userID], function (err, result) {
        if (err) console.error("Query error:", err);
        else {
            const row = result[0];
            const cb = parseInt(row.cb);
            const mb = parseInt(row.mb);
            if (cb >= mb) {
                message.channel.send("You overflowed your cap");
                connection.query(`UPDATE user SET lvl = lvl + 1, cb = cb - mb, mb = mb + 20 WHERE id = ?`, [userID], function (err, result) {
                    if (err) console.error("Level up error:", err);
                    else message.channel.send(`<@${userID}> has leveled up!`);
                });
            }
        }
    });
}

// Return user data
async function returnUser(userID, interaction) {
    try {
        const userExists = await CheckUser(userID);
        if (userExists) {
            fetchData(userID, interaction);
        } else {
            await interaction.reply("Did not set up");
        }
    } catch (error) {
        console.error("returnUser function error:", error);
        await interaction.reply("An error occurred");
    }
}

// Fetch user data
function fetchData(userID, interaction) {
    connection.query(`SELECT * FROM user WHERE id = ?`, [userID], function (err, result) {
        if (err) console.error("Fetch error:", err);
        else {
            const row = result[0];
            const EmbedImage = new EmbedBuilder()
                .setTitle("Progress")
                .setColor("#ffffff")
                .setDescription(`Current Level: ${row.lvl} \n Current Experience: ${row.cb} \n Max Experience: ${row.mb}`);
            interaction.reply({ embeds: [EmbedImage] });
        }
    });
}

module.exports = { ShowTable, InsertData, CheckUser, Exist, updateUser, returnUser };