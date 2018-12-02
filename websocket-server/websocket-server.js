const WebSocket = require('ws')
const RSMQWorker = require('rsmq-worker')

// Connect up to the worker called 'websocket-server-queue'
const worker = new RSMQWorker('websocket-server-queue')

// Implements a rsmq worker and serves up a websocket broadcast service
const wss = new WebSocket.Server({ port: 8000 })


// Utility: broadcast a message to all clients
// Message is a string
wss.broadcast = function broadcast(message) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            console.log('broadcasting message to all clients')
            client.send(message)
        }
    })
}

worker.on('message', (message, next, id) => {
    // process the message
    console.log(`Message id: ${id}`)

    // broadcast message (message is still a string)
    wss.broadcast(message)

    next()
})

// optional error listeners
worker.on('error', (err, msg) => {
    console.log('ERROR', err, msg.id )
})
worker.on('exceeded', (msg) => {
    console.log('EXCEEDED', msg.id)
})
worker.on('timeout', (msg) => {
    console.log('TIMEOUT', msg.id, msg.rc)
})

worker.start()
