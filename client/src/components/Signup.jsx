import { useState } from "react";
//import { ObjectId } from "mongodb";


function Signup() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    

    async function handleSubmit(event) {    
        event.preventDefault();


        
        try {
            // Send the request here.
            const response = await fetch(
            "http://localhost:9000/signup",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    // data to send
                    firstName: firstName,
                    lastName: lastName,
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
            <h2>Sign Up</h2>
            
            

            <form onSubmit={handleSubmit}>
                <div>
                    <label>First Name: </label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                    />
                </div>

                <div>
                    <label>Last Name: </label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                    />
                </div>


                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                </div>

                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </div>

                <button type="submit">Sign Up</button>
            </form>

            {message && <p>{message}</p>}
        </div>
    ); 
    }

export default Signup;