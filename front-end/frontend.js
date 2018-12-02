// Create WebSocket connection.
const socket = new WebSocket('ws://localhost:8000')

const ctx = document.getElementById("myChart").getContext('2d');

let sampleRawData = [
    {
        "oid": "2f61f4eafe23b467d483f23389513b9e2129f689",
        "messageHeadline": "Do stuff",
        "authoredDate": "2018-12-02T00:18:30.00Z",
        "additions": 23,
        "deletions": 5,
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
    },
    {
        "oid": "2f61f4eafe23b467d483f23389513b9e2129f689",
        "messageHeadline": "Hello world!",
        "authoredDate": "2018-12-02T00:18:41.383Z",
        "additions": 23,
        "deletions": 5,
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
    },
    {
        "oid": "2f61f4eafe23b467d483f23389513b9e2129f689",
        "messageHeadline": "Update page on website",
        "authoredDate": "2018-12-02T00:18:43.000Z",
        "additions": 23,
        "deletions": 5,
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
]

const data = {
    // Labels should be Date objects
    labels: sampleRawData.map(rawItem => rawItem['authoredDate']),
    datasets: [{
        fill: false,
        label: 'Commits',
        data: [3, 2, 1],
        borderColor: '#fe8b36',
        backgroundColor: 'rgb(255, 99, 132)',
        showLine: false
    }]
}

const options = {
    type: 'line',
    data: data,
    options: {
        animation: false,
        fill: false,
        responsive: true,
        scales: {
            xAxes: [{
                type: 'time',
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: "Date",
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                },
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: "Commits",
                }
            }]
        },
        elements: {
            point: {
                pointStyle: 'circle'
            }
        },
        tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
                label: function(tooltipItem, data) { 
                    const index = tooltipItem.index
                    const rawDataItem = sampleRawData[index]
                    var multistringText = [`"${rawDataItem.messageHeadline}"`,
                                           `+${rawDataItem.additions}, -${rawDataItem.deletions}`,
                                           `${rawDataItem.author.user.login} (${rawDataItem.author.user.name})`,
                                           `github.com/${rawDataItem.repository.owner.login}/${rawDataItem.repository.name}`]
                    return multistringText
                }
            }
        }
    }
}

const chart = new Chart(ctx, options)

// utility: update the given chart with a new label, data pair
function addData(chart, label, data) {
    chart.data.labels.push(label)
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    })
    chart.update()
}


// Connection opened
socket.addEventListener('open', (event) => {
    socket.send('Hello!')
})

// Listen for messages
socket.addEventListener('message', (event) => {
    // add the message
    console.log('Received new message:', event.data)

    // parse the data as json
    const data = JSON.parse(event.data)
    console.log(data)

    // add a new point to the chart
    sampleRawData.push(data)
    addData(chart, data.authoredDate, 1)
})
