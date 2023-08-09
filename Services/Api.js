// API object yo
const API = {
	url: "https://jsonplaceholder.typicode.com/users",
	fetchUrl: async () => {
		const result = await fetch( API.url )
		return await result.json()
	}
}
export default API