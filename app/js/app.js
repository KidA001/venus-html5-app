var deviceInterface = new Venus.MqttInterface("ws://192.168.3.82:9001/mqtt"); // todo: needs to be localhost when done
var metricService = new Venus.MetricService(deviceInterface);

window.onload = function() {
	setupCurrentLimitSelection();
	setupMetrics();
}

function setupCurrentLimitSelection() {
	var container = document.getElementById('inputLimitSelection');
	for (var currentValue=1; currentValue<=16; currentValue++) {
		var selection = document.createElement('a');
		selection.href = '#';
		selection.innerHTML = currentValue+'A';
		selection.addEventListener('click', createSetInputLimitFunction(currentValue));
		container.appendChild(selection);
	}
}

function createSetInputLimitFunction(limit) {
	return function() {
		metricService.write('Ac/Grid/CurrentLimit', limit);
		hideCurrentLimitSelection();
	}
}

function showCurrentLimitSelection() {
	document.getElementById("mySidenav").style.width = "300px";
}

function hideCurrentLimitSelection() {
	document.getElementById("mySidenav").style.width = "0px";
}

function setMode(mode) {
	if (mode === 'on') {
		console.log('setMode: on');
		metricService.metrics['System/Mode'].rawValue = 0;
		// metricService.write('System/State', ???);
	}
	else if (mode === 'off') {
		console.log('setMode: off');
		metricService.metrics['System/Mode'].rawValue = 1;
		// metricService.write('System/State', 0);
	}
	else if (mode === 'charge') {
		console.log('setMode: charge');
		metricService.metrics['System/Mode'].rawValue = 2;
		// metricService.write('System/State', ???);
	}
}

function showModeSelection() {
	document.getElementById('setModeOnButton').classList.remove('modeBtnOn');
	document.getElementById('setModeOffButton').classList.remove('modeBtnOn');
	document.getElementById('setModeChargeOnlyButton').classList.remove('modeBtnOn');
	if (metricService.metrics['System/Mode'].rawValue === 0) {
		document.getElementById('setModeOnButton').classList.add('modeBtnOn');
	}
	else if (metricService.metrics['System/Mode'].rawValue === 1) {
		document.getElementById('setModeOffButton').classList.add('modeBtnOn');
	}
	else if (metricService.metrics['System/Mode'].rawValue === 2) {
		document.getElementById('setModeChargeOnlyButton').classList.add('modeBtnOn');
	}
	document.getElementById("myMultiPlus").style.width = "300px";
}

function hideModeSelection() {
	document.getElementById("myMultiPlus").style.width = "0px";
}

function setupMetrics() {
	metricService.register('Dc/Battery/Voltage', '/system/0/Dc/Battery/Voltage', 'Voltage', 'V', Venus.numericFormatter(1));
	metricService.register('Dc/Battery/Current', '/system/0/Dc/Battery/Current', 'Current', 'A', Venus.numericFormatter(1));
	metricService.register('Dc/Battery/Power', '/system/0/Dc/Battery/Power', 'Power', 'W', Venus.numericFormatter());
	metricService.register('Dc/Battery/Soc', '/system/0/Dc/Battery/Soc', 'State of charge', '%', Venus.numericFormatter());
	metricService.register('Dc/Loads/Current', '/system/0/Dc/Vebus/Current', 'DC loads current', 'A', Venus.numericFormatter(1));
	metricService.register('Dc/Loads/Power', '/system/0/Dc/Vebus/Power', 'DC loads power', 'W', Venus.numericFormatter());
	metricService.register('Ac/Loads/Voltage', '/vebus/257/Ac/Out/L1/V', 'AC loads voltage', 'V', Venus.numericFormatter());
	metricService.register('Ac/Loads/Current', '/vebus/257/Ac/Out/L1/I', 'AC loads current', 'A', Venus.numericFormatter(1));
	metricService.register('Ac/Loads/Power', '/vebus/257/Ac/Out/L1/P', 'AC loads power', 'W', Venus.numericFormatter());
	metricService.register('Ac/Grid/IsConnected', '/Ac/ActiveIn/Connected', 'Grid is connected', '', Venus.numericFormatter());
	metricService.register('Ac/Grid/Voltage', '/vebus/257/Ac/ActiveIn/L1/V', 'Grid voltage', 'V', Venus.numericFormatter());
	metricService.register('Ac/Grid/Current', '/vebus/257/Ac/ActiveIn/L1/I', 'Grid current', 'A', Venus.numericFormatter(1));
	metricService.register('Ac/Grid/Power', '/vebus/257/Ac/ActiveIn/L1/P', 'Grid power', 'W', Venus.numericFormatter());
	metricService.register('Ac/Grid/CurrentLimit', '/vebus/257/Ac/ActiveIn/CurrentLimit', 'Grid input limit', 'V', Venus.numericFormatter(), 'rw');
	metricService.register('System/State', '/system/0/SystemState/State', 'System state', '', function(metric) {
		if (metric.rawValue == 0) return 'Off';
		if (metric.rawValue == 1) return 'Low power';
		if (metric.rawValue == 2) return 'VE.Bus Fault condition';
		if (metric.rawValue == 3) return 'Bulk charging';
		if (metric.rawValue == 4) return 'Absorption charging';
		if (metric.rawValue == 5) return 'Float charging';
		if (metric.rawValue == 6) return 'Storage mode';
		if (metric.rawValue == 7) return 'Equalisation charging';
		if (metric.rawValue == 8) return 'Passthru';
		if (metric.rawValue == 9) return 'Inverting';
		if (metric.rawValue == 10) return 'Assisting';
		if (metric.rawValue == 256) return 'Discharging';
		if (metric.rawValue == 257) return 'Sustain';
		return '--';
	});
	metricService.register('System/Mode', undefined, 'System mode', '', function(metric) {
		if (metric.rawValue == 0) return 'ON';
		if (metric.rawValue == 1) return 'OFF';
		if (metric.rawValue == 2) return 'Charge only';
		return '--';
	}, 'rw');

	metricService.metrics['Ac/Grid/IsConnected'].addOnChangeCallback(function(metric) {
		if (metric.rawValue == 1) {
			document.getElementById('shorePowerContainer').classList.add('shorePower');
		}
		else {
			document.getElementById('shorePowerContainer').classList.remove('shorePower');
		}
	})

	metricService.metrics['Dc/Battery/Current'].addOnChangeCallback(function(metric) {
		var container = document.getElementById('batteryContainer');
		if (metric.rawValue < 0) {
			container.classList.add('batteryDischarge')
			container.classList.remove('batteryCharge')
		}
		else {
			container.classList.add('batteryCharge')
			container.classList.remove('batteryDischarge')
		}
	})

	metricService.metrics['Dc/Battery/Soc'].addOnChangeCallback(function(metric) {
		var soc = metric.value;
        [].forEach.call(document.styleSheets[0].cssRules, function(cssRule) {
			if (cssRule.selectorText == '.batteryProgress::after') {
                cssRule.style.top = (73-43*soc/100)+'%';
            }
		});
	})

	metricService.bindElements(document.body);
	metricService.start();
	metricService.metrics['System/Mode'].rawValue = 0;
}
