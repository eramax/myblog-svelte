export const Api = '';

export function httpGet(path) {
	return req(path);
}

export function httpPost(path, data) {
	return req(path, 'POST', data);
}

export function httpPut(path, data) {
	return req(path, 'PUT', data);
}

async function req(path, method = 'GET', data) {
	const res = await fetch(Api + path, {
		method,
		headers: {
			'Content-Type': 'application/json'
		},
		body: data && JSON.stringify(data)
	});
	const json = await res.json();
	return json;
}
