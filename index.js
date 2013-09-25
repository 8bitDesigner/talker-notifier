#! /usr/bin/env node

var Talker = require('talker-client')
  , growl  = require('growl')
  , token  = process.env.TALKER_API_TOKEN
  , args   = require('optimist').argv
  , room   = args.r || args.room || args._[0]
  , email  = args.e || args.email || args._[1]
  , retry  = args.t || args.timeout || 5
  , client

function usage(msg) {
  if (msg) { console.log(msg) }
  console.log('Usage: talker-notifier --room [room ID] [ --email [optional email address] ]')
  process.exit(1)
}

function logger() {
  var args = Array.prototype.slice.call(arguments)
    , now = new Date()
    , timestamp = now.toDateString()+' '+now.toLocaleTimeString()

  args.unshift(timestamp)
  console.log.apply(console, args)
}

function connect(roomId, email) {
  var room = client.join(roomId)

  room.on('message', function(event) {
    logger("<"+event.user.name+"> " + event.content)

    if (!email || email !== event.user.email) {
      growl(event.user.name+": " + event.content, {name: 'Talker', image: __dirname+'./assets/icon.png'})
    }
  })

  room.on('connect', logger.bind({}, 'Connected'))

  room.on('error', function(err) {
    // Connection timeout or no connection whatsoever? Delay a reconnect
    if (err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
      logger('Disconnected, reconnecting in '+retry+' seconds')
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

// Make sure we have what we need to connect
if (!token) { usage('No API token found - use `export TALKER_API_TOKEN=[your api token]` to set one') }
if (!room)  { usage('No room ID given') }

// Create a new client and start connecting
client = new Talker({ token: process.env.TALKER_API_TOKEN })
connect(room, email)
