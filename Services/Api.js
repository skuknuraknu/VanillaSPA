/**
 * API Service Module
 *
 * Fetches user data from remote endpoint.
 * Note: Backend contract/endpoint remains unmodified per constraints.
 * Safe error handling is implemented in consumer modules (App.js).
 */

const API = {
	/**
	 * Remote endpoint URL for user data
	 */
	url: "https://jsonplaceholder.typicode.com/users",

	/**
	 * Fetches user data array from the API endpoint.
	 * @returns {Promise<Array>} Promise resolving to user records
	 */
	fetchUrl: async () => {
		const result = await fetch( API.url );
		if (!result.ok) {
			throw new Error(`HTTP error! status: ${result.status}`);
		}
		return await result.json();
	}
};

export default API;
