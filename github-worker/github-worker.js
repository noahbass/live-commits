const RedisSMQ = require('rsmq')
const RSMQWorker = require('rsmq-worker')
const GraphQLClient = require('graphql-request').GraphQLClient

const worker = new RSMQWorker('scheduler-queue')
const rsmq = new RedisSMQ({ host: "127.0.0.1", port: 6379, ns: "rsmq" })
const githubToken = process.env.GITHUB_TOKEN

// GitHub worker
async function main() {
    const endpoint = 'https://api.github.com/graphql'
  
    const graphQLClient = new GraphQLClient(endpoint, {
      headers: { authorization: `bearer ${githubToken}` }
    })

    const query = `
    query {
      repository(owner: "acmatuc", name: "acmatuc.github.io") {
        defaultBranchRef {
          name
          repository {
            name
          }
          target {
            ... on Commit {
              history(since: "2017-12-01T17:53:00.003Z") {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                edges {
                  node {
                    oid
                    abbreviatedOid
                    committedDate
                    authoredDate
                    pushedDate
                    messageHeadline
                    additions
                    deletions
                    author {
                      user {
                        login
                        name
                        avatarUrl
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      rateLimit {
        limit
        cost
        remaining
        resetAt
      }
    }
    `
  
    const data = await graphQLClient.request(query)

    const rateLimit = data.rateLimit
    const history = data.repository.defaultBranchRef.target.history
    const hasNextPage = history.pageInfo.hasNextPage || false
  
    console.log(JSON.stringify(history.edges[0], undefined, 2))
  
    history.edges.map(node => {
      console.log(JSON.stringify(node.node, undefined, 2))
    })
  
    console.log(JSON.stringify(rateLimit, undefined, 2))

    rsmq.sendMessage({ qname: 'worker-queue', message: 'hello' }, (err, resp) => {
        if (err) {
            console.log(new Error(err))
        }

        if (resp) {
            console.log(`Message sent w/ ID: ${resp}`)
        }
    })
}

main().catch(error => console.error(error))


// worker.on('message', function(msg, next, id) {
//     // process the message
//     console.log(`Message id: ${id}`)
//     console.log(`Message: ${msg}`)
//     next()
// })

// // optional error listeners
// worker.on('error', function(err, msg) {
//     console.log( "ERROR", err, msg.id )
// })
// worker.on('exceeded', function(msg) {
//     console.log("EXCEEDED", msg.id)
// })
// worker.on('timeout', function( msg ) {
//     console.log("TIMEOUT", msg.id, msg.rc)
// })

// worker.start()
