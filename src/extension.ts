import * as vscode from 'vscode';
import {
	IDebugTracker,
	IDebuggerTrackerSubscribeArg,
	IDebuggerTrackerEvent,
	IDebuggerSubscription
} from 'debug-tracker-vscode';

const TRACKER_EXT_ID = 'mcu-debug.debug-tracker-vscode';
let trackerApi: IDebugTracker;
let trackerApiClientInfo: IDebuggerSubscription;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "debug-tracker-client" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(
		vscode.commands.registerCommand('debug-tracker-client.start', () => {
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
			vscode.window.showInformationMessage('Hello from debug-tracker-client.start!');
		})
	);

	const trackerExt = vscode.extensions.getExtension<IDebugTracker>(TRACKER_EXT_ID);
	if (!trackerExt) {
		// Maybe we can go ahead install it. Ideally, it should be installed as a dependency
		vscode.window.showErrorMessage(`Extension ${TRACKER_EXT_ID} not installed`);
	} else {
		trackerExt.activate().then((api) => {
			trackerApi = api;
			const arg: IDebuggerTrackerSubscribeArg = {
				version: 1,
				body: {
					debuggers: '*',
					handler: debugTrackerEventHandler,
					wantCurrentStatus: true,
					notifyAllEvents: false
				}
			};
			const result = api.subscribe(arg);
			if (typeof result === 'string') {
				vscode.window.showErrorMessage(`Subscription failed with extension ${TRACKER_EXT_ID} : ${result}`);
			} else {
				trackerApiClientInfo = result;
			}
		}),
		(e: any) => {
			vscode.window.showErrorMessage(`Activation of extension ${TRACKER_EXT_ID} failed: ${e}`);
		};
	}
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (trackerApi && trackerApiClientInfo) {
		trackerApi.unsubscribe(trackerApiClientInfo.clientId);
	}
}

async function debugTrackerEventHandler(event: IDebuggerTrackerEvent) {
	console.log('debug-tracker-client: Got event', event);
}
