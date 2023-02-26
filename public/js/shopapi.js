// Define the base URL of the shop's backend API
const BASE_URL = "https://example.com/api";

// Define a function to make a GET request to the backend API
async function get(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`Failed to get ${endpoint}: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

// Define a function to make a POST request to the backend API
async function post(endpoint, body) {
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`Failed to post ${endpoint}: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

// Export the functions for use in other scripts
export {get, post };