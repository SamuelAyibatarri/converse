import * as Interfaces from '@/Interfaces'
const LOGIN_API_ENDPOINT = 'http://localhost:8888/api/auth/login';
const SIGNUP_API_ENDPOINT = 'http://localhost:8888/api/auth/signup';


export async function login(formData: Interfaces.LAI) {
    console.log("Do nothing", formData, LOGIN_API_ENDPOINT)
}

export async function signup(formData: Interfaces.CAI) {
    try {
        const response = await fetch(`${SIGNUP_API_ENDPOINT}/${formData.usertype}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })

        if (!response.ok) { 
            // Get the error message from the backend
            const errorData = await response.json();
            // THROW the error
            throw new Error(errorData.details || "Failed to sign up");
        }
        
        const data = await response.json();
        const localData = {
            isLoggedIn: true,
            userData: data.data
        }
        localStorage.setItem("user_data", JSON.stringify(localData));
        
        return data.data; 

    } catch (error) {
        console.error({message: "An Error Occured", Error: error});
        // Re-throw the error so the component can catch it
        throw error;
    }
}
