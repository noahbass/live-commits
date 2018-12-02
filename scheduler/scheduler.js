const RedisSMQ = require('rsmq')
const cron = require('node-cron')
const moment = require('moment')

const rsmq = new RedisSMQ({ host: "127.0.0.1", port: 6379, ns: "rsmq" })

// 
let previousTimestamp = moment()

cron.schedule('*/1 * * * *', () => {
    console.log('running a task every minute')

    const temp = moment()
    previousTimestamp = moment()

    // publish a message to the message queue
    rsmq.sendMessage({ qname: 'scheduler-queue', message: temp.toISOString() }, (err, resp) => {
        if (err) {
            console.log(new Error(err))
        }

        if (resp) {
            console.log(`Message sent w/ ID: ${resp}`)
            previousTimestamp = temp
        }
    })
})
