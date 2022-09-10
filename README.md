# debug-tracker-client README

This repo is to demonstrate the use of the debug-tracker-vscode extension. Any client interested in tracking debuggers can use that extension and this extension gives you a sample.

## Usage

Sorry but there are some manual steps required that if everything was published, would be simpler. But, we are in a pre-release stage

1. This is temporary until the tracker is available from the marketplace. Follow the instructions in [debug-tracker-vscode](https://github.com/mcu-debug/debug-tracker-vscode) to install the extension manually and to create an npm package
2. Clone this repo and change directory to it
3. Edit the following line in `package.json` to contain the package created in the first step. Also a temporary step
```JSON
     "debug-tracker-vscode": "file:../debug-tracker-vscode/debug-tracker-vscode-0.0.1.tgz",
```
4. Run the following commands in a shell
```bash
rm package-lock.json
npm install
npm run compile
```
5. Open this folder in VSCode
6. Start a debug session `"Run Extension"` which will launch a new Window for an "[Extension Development Host]"
7. In this new "[Extension Development Host]" window, open any directory with a program available to debug
8. Start a debug session in the "[Extension Development Host]". Observe the tracking information in the Console of the "debug-tracker-client" VSCode Window

You may see extra interesting events that you normally do not see via the vscode APIs -- not that easily anyways. This example is setup to activate on any debug session starting and this in turn will activate the tracker extension. It is possible that we can miss the beginning of the debug-initialization. Please report that issue if you notice it.
