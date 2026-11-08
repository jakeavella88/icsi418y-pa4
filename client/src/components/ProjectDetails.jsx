import { useState, useEffect } from "react";

function ProjectDetails({project, onBack}) {
    const [members, setMembers] = useState([]);
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");

    async function fetchMembers() {
    const response = await fetch(`/api/projects/${project._id}/members`);
    if (response.ok) setMembers(await response.json());
    }

    async function handleAdd() {
    const response = await fetch(`/api/projects/${project._id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId })
    });
    const data = await response.json();
    setMessage(data.message);
    if (response.ok) fetchMembers();
    }

    async function handleRemove(userId) {
    const response = await fetch(
        `/api/projects/${project._id}/members/${userId}`,
        { method: "DELETE" }
    );
    const data = await response.json();
    setMessage(data.message);
    if (response.ok) fetchMembers();
    }


    useEffect(() => {
    fetchMembers();

    async function fetchUsers() {
        const response = await fetch("/api/users");
        if (response.ok) setUsers(await response.json());
    }
    fetchUsers();
    }, [project._id]);

    
    return (
        <div>
            <button onClick={onBack}>Back to Projects</button>

            <h2>{project.name}</h2>

            <p><strong>Description:</strong> {project.description}</p>
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Project ID:</strong> {project._id}</p>

            <h3>Project Members</h3>
            {members.length === 0 ? (
            <p>No members found</p>
        ) : (
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                {members.map((member) => (
                    <li key={member._id}>
                        {member.username}{" "}
                        {member._id !== project.project_lead_id && (
                            <button onClick={() => handleRemove(member._id)}>
                                Remove
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        )}

        <select
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
        >
            <option value="" disabled>Select a user to add</option>
            {users.map((user) => (
                <option key={user._id} value={user._id}>
                    {user.username}
                </option>
            ))}
        </select>
        <button onClick={handleAdd}>Add Member</button>
            
            {message && <p>{message}</p>}
        </div>
    )
}





export default ProjectDetails;