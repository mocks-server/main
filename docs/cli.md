#### CLI

The interactive CLI can be instantiated and started programmatically:

```js
const { Cli } = require("@mocks-server/main");

const startMyCli = () => {
  const cli = new Cli({
    port: 3200,
    log: "debug",
    watch: false
  });

  return cli.start();
};

startMyCli().catch(err => {
  console.log("Error starting CLI", err);
});
```

##### `Cli` (\[options\]\[,customQuitMethod\])
For first argument options, please read the [options](#options) chapter of this documentation. Available methods of an instance are:
- `start` ()
Inits the server in case it was stopped, adds the watch listeners, and renders main menu.
- `initServer` ()
Inits the server in case it was stopped, adds the watch listeners.
- `stopListeningServerWatch` ()
When server watch is active, the main menu will be displayed on file changes. This behavior can be deactivated using this method. This is useful when this CLI is loaded as a submenu of another CLI, for example.
