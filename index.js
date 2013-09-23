var Talker = require('talker-client')
  , growl  = require('growl')
  , client = new Talker({ token: process.env.TALKER_API_TOKEN })
  , room   = process.argv.pop()
  , email  = process.argv.pop()
  , retry  = 5

function connect(roomId, email) {
  var room = client.join(roomId)

  room.on('message', function(event) {
    console.log("<"+event.user.name+"> " + event.content)

    if (email !== event.user.email) {
      growl(event.user.name+": " + event.content, {name: 'Talker', image: __dirname+'./assets/icon.png'})
    }
  })

  room.on('connect', function() {
    console.log('Connected')
  })

  room.on('error', function(err) {
    // Connection timeout or no connection whatsoever? Delay a reconnect
    if (err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
      console.log('Disconnected, reconnecting in '+retry+' seconds')
      setTimeout(connect.bind({}, roomId, email), retry * 1000)

    // Connection reset? Immediately reconnect
    } else if (err.code === 'ECONNRESET') {
      connect(roomId, email)

    // Well fuck. Crash.
    } else {
      console.error(err)
      process.exit(1)
    }
  })
}

connect(room, email)
