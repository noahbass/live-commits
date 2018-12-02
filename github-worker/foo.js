const token = process.env.GITHUB_TOKEN
const GraphQLClient = require('graphql-request').GraphQLClient

async function main() {
  const endpoint = 'https://api.github.com/graphql'

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: { authorization: `bearer ${token}` }
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
                  repository {
                    owner {
                      login
                    }
                    name
                  }
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
  // console.log(JSON.stringify(data, undefined, 2))

  // console.log(JSON.stringify(data.repository.defaultBranchRef.target.history, undefined, 2))
  const rateLimit = data.rateLimit
  const history = data.repository.defaultBranchRef.target.history
  const hasNextPage = history.pageInfo.hasNextPage || false

  console.log(JSON.stringify(history.edges[0], undefined, 2))

  history.edges.map(node => {
    console.log(JSON.stringify(node, undefined, 2))
  })

  console.log(JSON.stringify(rateLimit, undefined, 2))
}

main().catch(error => console.error(error))
