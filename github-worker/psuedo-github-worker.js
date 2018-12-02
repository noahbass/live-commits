const RedisSMQ = require('rsmq')
const rsmq = new RedisSMQ({ host: "127.0.0.1", port: 6379, ns: "rsmq" })

const fakeMessage = {
    "oid": "2f61f4eafe23b467d483f23389513b9e2129f689",
    "abbreviatedOid": "2f61f4e",
    "committedDate": "2018-12-02T00:18:44Z",
    "authoredDate": "2018-12-02T00:19:44Z",
    "pushedDate": "2018-12-02T00:18:49Z",
    "messageHeadline": "Clean up some HTML",
    "additions": 10,
    "deletions": 56,
    "repository": {
        "owner": {
          "login": "ACMatUC"
        },
        "name": "acmatuc.github.io"
    },
    "author": {
        "user": {
            "login": "domfarolino",
            "name": "Dominic Farolino",
            "avatarUrl": "https://avatars1.githubusercontent.com/u/9669289?v=4",
            "url": "https://github.com/domfarolino"
        }
    }
}

rsmq.sendMessage({ qname: 'worker-queue', message: JSON.stringify(fakeMessage) }, (err, resp) => {
    if (err) {
        console.log(new Error(err))
    }

    if (resp) {
        console.log(`Message sent with id ${resp}`)
        process.exit(0)
    }
})
