# live-commits

A hacked together live commits dashboard. Track commits from a GitHub repo in near real-time, display those commits on a graph to any number of clients via websockets.

Services:

- Front-end:
    - Chart.js
    - Subscribe to websocket-server via websockets
- Back-end services:
    - websocket-server
        - Broadcasts messages to subscribed browser clients
    - master-worker
        - Puts commits into Postgresql, then messages websocket-server queue
    - github-worker (WIP)
        - Retrieves latest commit(s) data using the GitHub GraphQL API, then messages the master-worker queue
    - scheduler (WIP)
        - Messages github-worker queue every x minutes to retrieve new GitHub commit data
    - rest-api (WIP)
        - Add other GitHub repositories to track

Dependencies:

- Node.js
- PostgreSQL
- Redis
