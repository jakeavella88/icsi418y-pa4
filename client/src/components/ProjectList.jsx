import { useState, useEffect } from "react";
import ProjectDetails from "./ProjectDetails";


function ProjectList() {
    const[projects, setProjects] = useState([]);
    const[selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        async function fetchProjects() {
            const response = await fetch ("/api/projects");
            const data = await response.json();
            setProjects(data);
        }

        fetchProjects();
    }, []);

    if (selectedProject) {
        return (
            <ProjectDetails
                project={selectedProject}
                onBack={() => setSelectedProject(null)}
            />
        );
    }

    return (
        <div>
            {projects.map((project) => (
                <div key={project._id}>
                    <h3>{project.name}</h3>
                    <p>Status: {project.status}</p>

                    <button onClick={() => setSelectedProject(project)}>
                        View Project
                    </button>
                </div>
            ))}
        </div>
    )
}


export default ProjectList;