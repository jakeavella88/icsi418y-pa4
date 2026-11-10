import { useState, useEffect } from "react";

function UserStories({onBack}) {
    const [message, setMessage] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [status, setStatus] = useState("To DO");    
    const [assignedUserId, setAssignedUserId] = useState("");

    const [members, setMembers] = useState([]);
    const [projects, setProject] = useState([]);
    const [projectId, setProjectId] = useState("");
    const [userStories, setUserStories] = useState([]);
    const [projectSelected, setProjectSelected] = useState(false);
    const [selectedStory, setSelectedStory] = useState(null);

    async function selectProject(event) {
        event.preventDefault();

        try {
            // Send the request here.
            const response = await fetch(`/api/projects/${projectId}/stories`);

            const data = await response.json();
            console.log("Selected project:", projectId);
            console.log("Backend response:", data);
            if(response.ok) {
                setUserStories(data);      // request succeeded
                setProjectSelected(true);
            } else {
                setMessage(data.message);   // request failed
            }
        } catch (error) {
            console.error(error);
            setMessage("Could not connect to the server");
        }
    }


    useEffect(() => {
        async function fetchProjects() {
            try {
                const response = await fetch("/api/projects");
                const data = await response.json();

                setProject(data);
            } catch(error) {
                console.error(error);
                setMessage("Error fetching projects");
            }
        }

        fetchProjects();
    }, []);

    useEffect(() => {
        async function fetchMembers() {
            if (!projectId) {
                setMembers([]);
                return;
            }

            try {
                const response = await fetch(
                    `/api/projects/${projectId}/members`
                );

                const data = await response.json();

                if (response.ok) {
                    setMembers(data);
                } else {
                    setMembers([]);
                    setMessage(data.message);
                }
            } catch (error) {
                console.error(error);
                setMessage("Error fetching project members");
            }
        }

        setAssignedUserId("");
        fetchMembers();
    }, [projectId]);



    if (selectedStory) {
        return (
            <EditUserStory
                story={selectedStory}
                onBack={() => setSelectedStory(null)}
            />
        );
    }

    async function createStory(event) {
        event.preventDefault();

        try{
            const response = await fetch(
                `/api/projects/${projectId}/stories`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        priority,
                        assigned_user_id: assignedUserId || null
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage("User story created successfully");

                setTitle("");
                setDescription("");
                setPriority("Medium");
                setAssignedUserId("To Do");
                setProjectId("");
            } else {
                setMessage(data.message);   
            }
        } catch (error) {
            console.log(error);
            setMessage("Could not connect to the server");
        }
    }


    return (
        <div>
            <h2>User Stories</h2>
            
            <form onSubmit={createStory}>
                <div>
                    {/*Select project field*/}
                    <label>Project: </label>
                    <select
                        value={projectId}
                        onChange={(event) => setProjectId(event.target.value)}
                        required
                    >
                        <option value="" disabled>
                            Select a project
                        </option>

                        {projects.map((project) => (
                            <option key={project._id} value={project._id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/*Input title field*/}
                <div>
                        <label>Title: </label>
                        <input
                            type = "text"
                            value = {title}
                            onChange = {(event) => setTitle(event.target.value)}
                            required
                        />
                </div>
                
                {/*Input description field*/}
                <div>
                    <label>Description: </label>
                    <textarea
                        value={description}
                        onChange = {(event) => setDescription(event.target.value)}
                        placeholder="As a [type of user], I want [goal], so that [benefit]."
                        required
                    />
                </div>

                {/*Priority field*/}
                <div>
                    <label>Priority: </label>
                    <select
                        value = {priority}
                        onChange = {(event) => setPriority(event.target.value)}
                    >
                        <option value = "Medium">Medium</option>
                        <option value = "High">High</option>
                        <option value = "Low">Low</option>
                    </select>
                </div>
            

                {/*Assign member field*/}
                <div>
                    <label>Assigned member: </label>
                    <select
                        value = {assignedUserId}
                        onChange = {(event) => setAssignedUserId(event.target.value)}
                        disabled = {!projectId}
                    >
                        <option value="">Unassigned</option>

                        {members.map((member) => (
                            <option key={member._id} value={member._id}>
                                {member.firstName} {member.lastName} ({member.username})
                            </option>
                        ))}
                    </select>
                </div>


                <button type = "submit" disabled={!projectId}>
                    Create user story
                </button>
            </form>
            
            {message && <p className="success-message">{message}</p>}
                    
            

            <button onClick={onBack}>Cancel user story creation</button>
        </div>
        
    );
}



export default UserStories;