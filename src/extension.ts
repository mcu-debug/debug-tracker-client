import * as vscode from 'vscode';
import {
	IDebugTracker,
	IDebuggerTrackerSubscribeArg,
	IDebuggerTrackerEvent,
	IDebuggerSubscription,
	DebugSessionStatus,
	DebugTracker
} from 'debug-tracker-vscode';

const TRACKER_EXT_ID = 'mcu-debug.debug-tracker-vscode';
let trackerApi: IDebugTracker;
let trackerApiClientInfo: IDebuggerSubscription;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "debug-tracker-client" is now active!');

	// package.json has been setup so any start of a debug session triggers our activation but
	// you can also start the extension manually
	context.subscriptions.push(
		vscode.commands.registerCommand('debug-tracker-client.start', () => {
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
			vscode.window.showInformationMessage('Hello from debug-tracker-client.start!');
		})
	);

	const arg: IDebuggerTrackerSubscribeArg = {
		version: 1,
		body: {
			debuggers: '*',						// All debuggers
			// debuggers: ['cortex-debug', 'cppdbg'],
			handler: debugTrackerEventHandler,	// Only this debugger
			wantCurrentStatus: true,
			notifyAllEvents: false,
			// Make sure you set debugLevel to zero for production
			debugLevel: 2
		}
	};

	// We can use either our own copy of a debug tracker or use a shared one.
	const useLocal = false;
	if (useLocal) {
		trackerApi = new DebugTracker(context);
		trackerApi.subscribe(arg);
		return;
	}

	const trackerExt = vscode.extensions.getExtension<IDebugTracker>(TRACKER_EXT_ID);
	if (!trackerExt) {
		// Maybe we can go ahead install it. Ideally, it should be installed as a dependency
		vscode.window.showErrorMessage(`Extension ${TRACKER_EXT_ID} not installed`);
	} else {
		trackerExt.activate().then((api) => {
			trackerApi = api;
			const result = api.subscribe && api.subscribe(arg);
			if (!result || (typeof result === 'string')) {
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
	if (event.event === DebugSessionStatus.Initializing) {
		console.log('debug-tracker-client: NEW SESSION!!!!');
	}
}
