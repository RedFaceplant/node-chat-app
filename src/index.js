const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const {generateMessage} = require("./utils/messages")
const {addUser, removeUser, getUser, getUsersInRoom} = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, "../public")

app.use(express.static(publicDirectoryPath))

//let count = 0

io.on("connection", (socket) => {
    //console.log("New Websocket Connection")

    socket.on("join", ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        
        socket.emit("message", generateMessage("Server", `Welcome to '${user.room}'!`))
        socket.broadcast.to(user.room).emit("message", generateMessage("Server", `${user.username} just joined!`))
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on("sendMessage", (msg, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit("message", generateMessage(user.username, msg))
        callback()
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit("message", generateMessage("Server", `${user.username} has left the chat.`))
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Sever is up on port ${port}!`)
})
