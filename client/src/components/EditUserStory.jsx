import { useState, useEffect } from "react";

function UserStories({story, onBack, onSaved}) {
    const [message, setMessage] = useState("");

    const [title, setTitle] = useState(story.title);
    const [description, setDescription] = useState(story.description);
    const [priority, setPriority] = useState(story.priority);
    const [status, setStatus] = useState(story.status);    
    const [assignedUserId, setAssignedUserId] = useState(story.assigned_user_id || "");
    
    const [members, setMembers] = useState([]);

    useEffect(() => {
        async function fetchMembers() {
            try {
                const response = await fetch(
                    `/api/projects/${story.project_id}/members`
                );

                const data = await response.json();

                if (response.ok) {
                    setMembers(data);
                } else {
                    setMessage(data.message || "Error fetching members");
                }
            } catch (error) {
                console.error(error);
                setMessage("Could not connect to the server");
            }
        }

        fetchMembers();
    }, [story.project_id]);


    async function saveStory(event) {
        event.preventDefault();

        try {
            const response = await fetch(
                `/api/projects/${story.project_id}/stories/${story._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        priority,
                        status,
                        assigned_user_id: assignedUserId || null
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage("User story updated successfully!");
            } else {
                setMessage(data.message || "Error updating story");
            }
        } catch (error) {
            console.error(error);
            setMessage("Could not connect to the server");
        }
    }

    async function deleteStory() {
    const confirmed = window.confirm(
        "Are you sure you want to delete this user story?"
    );

    if (!confirmed) return;

    try {
        const response = await fetch(
            `/api/projects/${story.project_id}/stories/${story._id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (response.ok) {
            if (onSaved) onSaved();
            onBack();
        } else {
            setMessage(data.message || "Error deleting story");
        }
    } catch (error) {
        console.error(error);
        setMessage("Could not connect to the server");
    }
}

    

    return (
        <div>
            <h2>Edit User Story</h2>
            
            <form onSubmit={saveStory}>
                <label>Title</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <label>Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />

                <label>Priority</label>
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>

                <label>Status</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>

                <label>Assigned Member</label>
                <select
                    value={assignedUserId}
                    onChange={(e) => setAssignedUserId(e.target.value)}
                >
                    <option value="">Unassigned</option>

                    {members.map((member) => (
                        <option key={member._id} value={member._id}>
                            {member.firstName} {member.lastName} ({member.username})
                        </option>
                    ))}
                </select>

                <button type="submit">Save Changes</button>
                <button onClick={onBack}>Back to User Stories</button>
                <button type="button" onClick={deleteStory}>Delete Story</button>
            </form>
            {message && (
                <div>
                    <p className="success-message">{message}</p>
                    <button type="button" onClick={() => {
                        if (onSaved) onSaved();
                        onBack();
                    }}>
                        Return to Backlog
                    </button>
                </div>
            )}
        </div>

    );
}



export default UserStories;