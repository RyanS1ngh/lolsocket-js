# LOLSocket-JS

**LOLSocket-JS** is a JavaScript library that simplifies communication with WebSocket servers. It enables you to subscribe to specific channels, bind to message types, and trigger events on designated channels. This library is specifically designed to work with servers that require API keys and secrets for authentication and authorization.

## Installation

You can easily install LOLSocket-JS via npm or yarn in your project:

```bash
npm install lolsocket-js

# or
yarn add lolsocket-js
```

## Usage

First, import the LOL class into your JavaScript file:

```
const LOL = require('lolsocket-js');
```
Then, create an instance of the LOL class by passing an object with API_KEY and API_SECRET properties:

```
const lol = new LOL({
    API_KEY: 'your-api-key',
    API_SECRET: 'your-api-secret'
});

```
### Subscribing to Channels

Subscribe to specific channels using the subscribe method. Channels are defined by unique names.

```
const channel = 'example-channel';

const subscription = lol.subscribe(channel);

subscription.bind('message-type', (data) => {
    console.log('Received message:', data);
});

```

### Triggering Events

Trigger events on specific channels using the trigger method. Events are specified by a type and can carry custom data.

```
const channel = 'example-channel';
const eventType = 'message-type';
const message = 'Hello, World!';

lol.trigger(channel, eventType, message);
```
Please ensure that triggering events is done with appropriate permissions and on existing channels on the server.

### Handling Messages

Messages received from the server are automatically processed and routed to the appropriate callbacks if the message type matches the bound type.

```
lol.subscribe('example-channel').bind('message-type', (data) => {
    console.log('Received message:', data);
});
```
### Closing the Connection

The connection is automatically closed if the received token is invalid.

## Test API Keys

ApiKey "K23AVG0UU8B96WR27612"
ApiSecret "PG76UNTD4AOOX3RCFNWWUXNP75NJD3H22"

### Important Notes

* Security: Keep your API keys and secrets secure. Do not expose them in public repositories or client-side code.

* Error Handling: Implement robust error handling for network issues and failed operations.

* Authentication: Authenticate and verify tokens before processing messages or triggering events.

For detailed information about LOLSocket-JS, refer to LOLSockets[https://lolcorp.co.uk] 

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
