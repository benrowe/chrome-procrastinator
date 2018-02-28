
enum IconStatus {
    enabled = 'enabled',
    disabled = 'disabled',
};

interface IconState {
    icon: string,
    title: string,
}

const STATES: {[index: string]: IconState} = {
    enabled: {
        'icon': 'images/remove_16.png',
        'title': 'Procrastinator: Enabled',
    },
    disabled: {
        'icon': 'images/remove_16_disabled.png',
        'title': 'Procrastinator: Enabled',
    },
}



/**
 * Handles the icon functionality
 */
export default class ExtensionIcon
{
    private state: IconStatus;

    constructor(initState: IconStatus = IconStatus.enabled)
    {
        this.state = initState;
    }

    enable()
    {
        this.buttonState(IconStatus.enabled);
    }

    disable()
    {
        this.buttonState(IconStatus.disabled);
    }

    private buttonState(state: IconStatus)
	{
		if (state === this.state) {
			return false;
		}
		console.log('changing button state to: %s', state);
		this.state = state;
		chrome.browserAction.setTitle({title: STATES[state].title});
		chrome.browserAction.setIcon({path: STATES[state].icon});
	}
}
