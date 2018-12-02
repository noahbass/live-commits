const RedisSMQ = require('rsmq')
const RSMQWorker = require('rsmq-worker')
const Sequelize = require('sequelize')

const worker = new RSMQWorker('worker-queue')
const rsmq = new RedisSMQ({ host: '127.0.0.1', port: 6379, ns: 'rsmq' })

// Connect to postgres
const sequelize = new Sequelize('postgres', process.env.POSTGRES_USER, process.env.PROCESS_PASS, {
  host: process.env.POSTGRES_HOST,
  dialect: 'postgres',
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operatorsAliases: false
})

// Define the schema for a commit
const Commit = sequelize.define('commit', {
  oid: Sequelize.STRING,
  abbreviated_oid: Sequelize.STRING,
  committed_date: Sequelize.DATE,
  authored_date: Sequelize.DATE,
  pushed_date: Sequelize.DATE,
  message_headline: Sequelize.STRING,
  additions: Sequelize.INTEGER,
  deletions: Sequelize.INTEGER,
  repo_owner: Sequelize.STRING,
  repo_name: Sequelize.STRING,
  author_login: Sequelize.STRING,
  author_name: Sequelize.STRING,
  author_avatarUrl: Sequelize.STRING,
  author_url: Sequelize.STRING
})

worker.on('message', (message, next, id) => {
  // process the incoming message
  console.log(`Message id: ${id}`)

  // jsonify
  const messageData = JSON.parse(message)
  // console.log(JSON.stringify(messageData, undefined, 2))

  // throw this data into the database
  sequelize.sync()
    .then(() => Commit.create({
      oid: messageData.oid,
      abbreviated_oid: messageData.abbreviatedOid,
      committed_date: messageData.committedDate,
      authored_date: messageData.authoredDate,
      pushed_date: messageData.pushedDate,
      message_headline: messageData.messageHeadline,
      additions: messageData.additions,
      deletions: messageData.deletions,
      repo_owner: messageData.repository.owner.login,
      repo_name: messageData.repository.name,
      author_login: messageData.author.user.login,
      author_name: messageData.author.user.name,
      author_avatarUrl: messageData.author.user.avatarUrl,
      author_url: messageData.author.user.url
    }))
    .then(() => {
      // then, throw this data at the websocket server via a message
      console.log('throw this darta at a websocket server')
      return sendMessage(JSON.stringify(messageData))
    })
    .finally(() => {
      // read the next incoming message
      console.log('call next...')
      next()
    })
})

const sendMessage = (messageData) => {
  return new Promise((resolve, reject) => {
    rsmq.sendMessage({ qname: 'websocket-server-queue', message: messageData }, (err, resp) => {
      if (err) {
        console.log(new Error(err))
        reject(err)
        return
      }

      if (resp) {
        console.log(`Message sent w/ ID: ${resp}`)
        resolve(resp)
        return
      }
    })
  })
}

// optional error listeners
worker.on('error', (err, msg) => {
    console.log('ERROR', err, msg.id)
})

worker.on('exceeded', (msg) => {
    console.log('EXCEEDED', msg.id)
})

worker.on('timeout', (msg) => {
    console.log('TIMEOUT', msg.id, msg.rc)
})

worker.start()
