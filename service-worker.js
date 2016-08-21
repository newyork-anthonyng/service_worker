console.log('Executing worker');

var version = 'v1::';

var offlineFundamentals = [
	'',
	'images/small.jpg',
	'images/medium.jpg',
	'images/large.jpg'
];

self.addEventListener('install', function(event) {
	console.log('Install event in progress.');

	event.waitUntil(
		caches
			.open(version + 'fundamentals')
			.then(function(cache) {
				return cache.addAll(offlineFundamentals);
			})
			.then(function() {
				console.log('Install completed');
			})
	);
});

self.addEventListener('fetch', function(event) {
	console.log('Fetch event in progress.');

	if(event.request.method !== 'GET') {
		console.log('Fetch event ignored', event.request.method, event.request.url);
		return;
	}

	event.respondWith(
		caches
			.match(event.request)
			.then(function(cached) {
				var networked =
					fetch(event.request)
						.then(fetchedFromNetwork, unableToResolve)
						.catch(unableToResolve);

				console.log('Fetch event completed', cached ? '(cached)' : '(network)', event.request.url);
				return cached || networked;

				function fetchedFromNetwork(response) {
					var cacheCopy = response.clone();
					console.log('Fetch response from network.', event.request.url);

					caches
						.open(version + 'pages')
						.then(function add(cache) {
							cache.put(event.request, cacheCopy);
						})
						.then(function() {
							console.log('Fetch response stored in cache.', event.request.url);
						});

					return response;
				}

				function unableToResolve() {
					console.log('Fetch request failed in both cache and network.');
					return new Response('<h1>Service Unavailable</h1>', {
						status: 503,
						statusText: 'Service Unavailable',
						headers: new Headers({
							'Content-Type': 'text/html'
						})
					});
				}
			})
	);
});

self.addEventListener('activate', function(event) {
	console.log('Activate event in progress.');

	event.waitUntil(
		caches
			.keys()
			.then(function(keys) {
				return Promise.all(
					keys
						.filter(function(key) {
							return !key.startsWith(version);
						})
						.map(function(key) {
							return caches.delete(key);
						})
				);
			})
			.then(function() {
				console.log('Activate completed.');
			})
	);
});
