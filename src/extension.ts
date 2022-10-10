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

	// We can use either our own copy of a debug tracker or use a shared one.
	const doSubscribe = () => {
		const arg: IDebuggerTrackerSubscribeArg = {
			version: 1,
			body: {
				debuggers: '*',						// All debuggers
				// debuggers: ['cortex-debug', 'cppdbg'], 	// Only these debugger
				handler: debugTrackerEventHandler,
				wantCurrentStatus: true,
				notifyAllEvents: false,
				// Make sure you set debugLevel to zero for production
				debugLevel: 2
			}
		};

		const result = trackerApi.subscribe && trackerApi.subscribe(arg);
		if (!result || (typeof result === 'string')) {
			vscode.window.showErrorMessage(`Subscription failed with extension ${TRACKER_EXT_ID} : ${result}`);
		} else {
			trackerApiClientInfo = result;
		}		
	};

	const useLocal = false;
	if (useLocal) {
		trackerApi = new DebugTracker(context);
		doSubscribe();
	} else {
		DebugTracker.getTrackerExtension('debug-tracker-client').then((ret) => {
			if (ret instanceof Error) {
				vscode.window.showErrorMessage(ret.message);
			} else {
				trackerApi = ret;
				doSubscribe();
			}
		});
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
