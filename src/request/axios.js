import axios from 'axios';

const server = "http://127.0.0.1:3001" + "/";

const defaultHeader = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json; charset=utf-8'}

export async function getFromEndpoint(endpoint) {
	const res = await axios.get(server + endpoint, {
		headers: defaultHeader
	});
	if (res.status === 200) {
		return res.data;
	} else {
		console.log(res.status);
	}
}

export async function postToEndpoint(endpoint, body) {
	const res = await axios.post(server + endpoint, body, {
		headers: defaultHeader
	});
	if (res.status === 200) {
		return res.data;
	} else {
		console.log(res.status);
	}
}

export async function putToEndpoint(endpoint, body) {
	const res = await axios.put(server + endpoint, body, {
		headers: defaultHeader
	});
	if (res.status === 200) {
		return res.data;
	} else {
		console.log(res.status);
	}
}

export async function deleteToEndpoint(endpoint, id) {
	const res = await axios.delete(server + endpoint + "/" + id);
	if (res.status === 202) {
		return res.data;
	} else {
		console.log(res.status);
	}
}