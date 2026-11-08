import { useState, useEffect } from "react";

function CreateProject() {
    const [projectName, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [projectLeader, setProjectLeader] = useState("");
    const [projectMembers, setProjectMembers] = useState([]);
    const [message, setMessage] = useState(""); 
    

    const [users, setUsers] = useState([]);
    


    async function handleSubmit(event) {
        event.preventDefault();

        try {
            // Send the request here.
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    // data to send
                    projectName: projectName,
                    description:description,
                    status:status,
                    projectLeader:projectLeader,
                    projectMembers:projectMembers
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

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch("/api/users");
                const data = await response.json();

                setUsers(data);
            } catch(error) {
                console.error(error);
                setMessage("Error fetching users");
            }
        }

        fetchUsers();
    }, []);

    return (
        <div>
            <h2>Create Project</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Project Name: </label>
                    <input 
                        type="text"
                        value={projectName}
                        onChange={(event) => setProjectName(event.target.value)}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "5px" }}>Description: </label>
                    <textarea 
                        rows={5}
                        cols={50}
                        type="text"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        style={{ width: "100%", maxWidth: "500px", padding: "8px" }}
                    />
                </div>

                <div>
                    <label>Project Status: </label>
                    <select
                        id="status-select"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}    
                    >
                        <option value="" disabled>Select a project status</option>
                        <option value="Planning">Planning</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                <div>
                    <label>Project Leader: </label>

                    <select
                        id="project-leader"
                        value={projectLeader}
                        onChange={(event)=> setProjectLeader(event.target.value)}
                    >
                        <option value="" disabled>Select a project leader</option>

                        {users.map((user) => (
                            <option key={user._id} value ={user._id}>
                            {user.username}
                            </option>
                        ))}
                        
                    </select>
                </div>

                <div>
                    <label>Select Members: </label>

                    {users.map((user) => (
                        <div key={user._id}>
                            <input
                                type="checkbox"
                                checked={projectMembers.includes(user._id)}
                                onChange={(event) => {
                                    if (event.target.checked) {
                                        setProjectMembers([
                                            ...projectMembers,
                                            user._id
                                        ]);
                                    } else {
                                        setProjectMembers((previous) =>
                                            previous.filter((id) => id !== user._id)
                                        );
                                    }
                                }}
                            />
                            <label htmlFor={user._id}>
                                {user.username}
                            </label>
                        </div>                        
                    ))}
                </div>
                <button type="submit">Create Project</button>
            </form>
            
            {message && <p>{message}</p>}

        </div>
    );
}


export default CreateProject;