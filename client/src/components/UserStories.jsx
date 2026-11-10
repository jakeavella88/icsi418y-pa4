import { useState, useEffect } from "react";
import EditUserStory from './EditUserStory'
import CreateUserStory from "./CreateUserStory";

function UserStories() {
    const [message, setMessage] = useState("");
    const [title, setTitle] = useState([]);
    const [description, setDescription] = useState([]);
    const [priority, setPriority] = useState([]);
    const [status, setStatus] = useState([]);    

    const [projects, setProject] = useState([]);
    const [projectId, setProjectId] = useState("");
    const [userStories, setUserStories] = useState([]);
    const [projectSelected, setProjectSelected] = useState(false);
    const [selectedStory, setSelectedStory] = useState(null);
    const [createStory, setCreateStory] = useState(false);

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

    if (selectedStory) {
        return (
            <EditUserStory
                story={selectedStory}
                onBack={() => setSelectedStory(null)}
            />
        );
    }

    if(createStory) {
        return (
            <CreateUserStory
                onBack={() => setCreateStory(false)}
            />
        )
    }

    return (
        <div>
            <h2>User Stories</h2>
            
            <button onClick={() => setCreateStory(true)}>
                Create User Story
            </button>

            <form onSubmit={selectProject}>
                <label>Select from a project: </label>
                <select
                    id="project-id"
                    value={projectId}
                    onChange={(event)=> {
                        setProjectId(event.target.value)
                        setProjectSelected(false);
                    }}
                >
                    <option value="" disabled>
                        Select from a project
                    </option>

                    {projects.map((project) => (
                        <option key={project._id} value ={project._id}>
                        {project.name}
                        </option>
                    ))}
                </select>
                
                <button type="submit" disabled={!projectId}>
                    Select Project</button>
            </form>

            <div>
                {projectSelected ? (
                    
                    userStories.length > 0 ? (
                        userStories.map((story) => (
                        <div key={story._id}>
                            <h3>{story.title}</h3>
                            <p>Priority: {story.priority}</p>
                            <p>Status: {story.status}</p>
                            <button onClick={() => setSelectedStory(story)}>
                                Edit
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No user stories associated with this project yet.</p>
                )
                ) : null}
            </div>
        </div>

    );
}



export default UserStories;