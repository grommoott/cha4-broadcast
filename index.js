const { WebSocketServer } = require("ws")
const jwt = require("jsonwebtoken")

const PORT = process.env.PORT || 10000
const privateKey = process.env.PRIVATE_KEY

const server = new WebSocketServer({
    port: PORT,
})

let httpServerWS
const users = new Array()

server.on('connection', (ws) => {
    ws.onerror(console.error)

    ws.onmessage((msg) => {
        switch (msg.event) {
            case "auth":
                const token = msg.data
                let tokenData

                try {
                    tokenData = jwt.verify(token, privateKey)
                } catch (e) {
                    ws.send("Invalid token")
                    return
                }

                switch (tokenData) {
                    case "http server":
                        httpServerWS = ws

                    default:
                        users.push(ws)
                }

            case "message":
                httpServerWS.send(msg)

                users.forEach(user => {
                    if (user.readyState == WebSocket.OPEN) {
                        user.send(msg)
                    }
                })
        }
    })
})
