import { useState } from "react";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    
    async function handleSubmit(event) {
        event.preventDefault();

        try {
            // Send the request here.
            const response = await fetch(
            "http://localhost:9000/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    // data to send
                    username: username,
                    password: password
                })
            }
            );

            const data = await response.json();
            if(response.ok) {
                setMessage(data.message);   // request succeeded
            } else {
                setMessage(data.message);   // request failed
            }
        } catch (error) {
            console.error(error);
            setMessage("Could not connect to the server");
        }
    }

    return (
        <div>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username: </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                </div>

                <div>
                    <label>Password: </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </div>

                <button type="submit">Login</button>
            </form>

            {message && <p>{message}</p>}

        </div>
    );
}



export default Login;