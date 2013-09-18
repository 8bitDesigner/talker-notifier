var Talker = require('talker-client')
  , growl  = require('growl')
  , client = new Talker({ token: process.env.TALKER_API_TOKEN })
  , room   = client.join(process.argv.pop())

room.on('message', function(event) {
  var message = "<"+event.user.name+"> " + event.content
  console.log(message)
  growl(event.user.name+": " + event.content, {name: 'Talker', image: __dirname+'./assets/icon.png'})
})

room.on('error', function(error) {
  console.log(error)
  process.exit(1)
})
