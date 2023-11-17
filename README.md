# Server-Side Module (lolsocket-js)
## LOLSocket-js

A Node.js module for creating a WebSocket server with support for channels, message subscription, and triggering events. This module allows you to easily implement real-time communication in your Node.js applications.


### Installation

```
npm install lolsocket-js
```

### Usage

First make an account and create an application to get your API keys from [LOLSocket.com](https://lolsocket.com)


```
const LOL = require('lolsocket-js');

const lol = new LOL({ ApiKey: 'YOUR_API_KEY', ApiSecret: 'YOUR_API_SECRET' });

const channel = lol.subscribe('example-channel');

channel.bind('example-namespace', (data) => {
    console.log('Received message:', data);
});

lol.trigger('example-channel', 'example-namespace', { message: 'Hello, world!' });
```



### Features

- Subscribe to channels and listen for messages in specific namespaces.

- Trigger events to broadcast messages to subscribed clients.

- Automatic connection handling and error logging.


### License

This project is Owned by [LOLSocket](https://lolsocket.com)& [LOLCorp](https://lolcorp.co.uk). 

