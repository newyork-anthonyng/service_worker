window.onload = function() {
	alert('Hello World');

	return;

	if('serviceWorker' in navigator) {
		navigator.serviceWorker.register('service-worker.js').then(function() {
			console.log('Service worker registration complete.');
		}, function() {
			console.log('Service worker registration failed.');
		});
	} else {
		console.log('Service worker is not supported.');
	}
};

