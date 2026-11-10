require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.json({
        message: "Server is running"
    });
});

app.post("/signup", async (req, res) => {
    const db = client.db("pa2");
    const users = db.collection("users");
    const { username, password, firstName, lastName } = req.body;

    
    // Check if all required fields are provided
    if (!username || !password || !firstName || !lastName) {
        return res.status(400).json({ 
            message: "Required information is missing" 
        });
    }    
    
    try{
        // Check if the username already exists, if error occurs, sends a server error message to the user
        const existingUser = await users.findOne({ username });
    
        // if username already exists, sends message to the user, otherwise creates new user in database and sends success message
        if (existingUser) {
            return res.status(409).json({ message: "Username already exists" });
        } else {
            // Insert new user into database and return success response
            
                await users.insertOne({ 
                    username, 
                    password, 
                    firstName, 
                    lastName
                });
        
            
            return res.status(201).json({ 
                message: "User created successfully" 
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }


    
});


app.post("/login", async (req, res) => {
    // Login logic
    const db = client.db("pa2");
    const users = db.collection("users");
    const { username, password } = req.body;


    if(!username || !password) {
        return res.status(400).json ({
            message: "Required information is missing"
        });
    }

    try{
        // Check is the username exists in the database
        const user = await users.findOne({ username });

        if(!user) {
            return res.status(401).json({
                message: "Invalid username"
            });
        } else {
            // Check if the password matches
            if(user.password !== password) {
                return res.status(401).json({
                    message: "Invalid password"
                });
            } else {
                return res.status(200).json({
                    message: "Login successful"
                });
            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});


app.post("/api/projects", async (req, res) => {
    const db = client.db("pa2");
    const projects = db.collection("projects");
    const users = db.collection("users");
    const memberships = db.collection("projectMemberships");
    const { projectName, description, status, projectLeader, projectMembers } = req.body;

    if (typeof projectName !== "string" || !projectName.trim() || typeof description !== "string" || !description.trim() || !status || !projectLeader) {
        return res.status(400).json ({
            message: "Required information is missing"
        });
    }
    
    if(!ObjectId.isValid(projectLeader)) {
        return res.status(400).json ({
            message: "Invalid project leader ID"
        })
    }
    
    if (!Array.isArray(projectMembers)) {
    return res.status(400).json({
        message: "Project members must be provided as an array"
    });
}

    try {
        const leaderId = new ObjectId(projectLeader);

        const leader = await(users).findOne({
            _id: leaderId
        });

        if(!leader){
            return res.status(404).json ({
                message: "Leader not found"
            });
        }

        const project = {
            name: projectName.trim(),
            description: description.trim(),
            status: status,
            project_lead_id: leaderId
        };

        const result = await projects.insertOne(project);

        await memberships.insertOne({
            project_id: result.insertedId,
            user_id: leaderId
        });

        const memberIds = projectMembers.filter((id) => id !== projectLeader).map((id) => ({
            project_id: result.insertedId,
            user_id: new ObjectId(id)
        }));

        if(memberIds.length > 0) {
            await memberships.insertMany(memberIds);
        }

    } catch(error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }

    return res.status(201).json({
    message: "Project created successfully!"
});

});


// Route for adding a member to existing project
app.post("/api/projects/:projectId/members", async (req, res) => {
    try {
        const {projectId} = req.params;
        const {userId} = req.body;

        if (!ObjectId.isValid(projectId) || !ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid project or user ID"
            });
        }

        const db = client.db("pa2");
        const projects = db.collection("projects");
        const users = db.collection("users");
        const memberships = db.collection("projectMemberships");

        const projectObjectId = new ObjectId(projectId);
        const userObjectId = new ObjectId(userId);

        const project = await projects.findOne({
            _id: projectObjectId
        });

        if(!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const user = await users.findOne({
            _id: userObjectId
        });

        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }

        const exisitingMembership = await memberships.findOne({
            project_id: projectObjectId,
            user_id: userObjectId
        });

        if(exisitingMembership) {
            return res.status(409).json({
                message: "User is already a member"
            });
        } 
           
        await memberships.insertOne({
            project_id: projectObjectId,
            user_id: userObjectId
        });

        res.status(201).json({
            message: "Member added successfully"
        });
        
            
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Server error"
            });
    }
});


app.delete("/api/projects/:projectId/members/:userId", async (req, res) => {
    try {
        const { projectId, userId } = req.params;

        if (!ObjectId.isValid(projectId) ||
            !ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid project or user ID"
            });
        }

        const db = client.db("pa2");
        const projects = db.collection("projects");
        const memberships = db.collection("projectMemberships");

        const projectObjectId = new ObjectId(projectId);
        const userObjectId = new ObjectId(userId);

        const project = await projects.findOne({
            _id: projectObjectId
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (project.project_lead_id.equals(userObjectId)) {
            return res.status(400).json({
                message: "Cannot remove the project leader"
            });
        }

        const result = await memberships.deleteOne({
            project_id: projectObjectId,
            user_id: userObjectId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Membership not found"
            });
        }

        res.status(200).json({
            message: "Member removed successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
    
});


// Get list of users
app.get("/api/users", async (req, res) => {
    
    // obtains only the id and usernames
    try {
        const db = client.db("pa2");
        const usersCollection = db.collection("users");

        const users = await usersCollection.find({}).project({_id: 1, username: 1}).toArray();
        res.json(users)
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// GET route for projects
app.get("/api/projects", async (req, res) => {
    try{
        const db = client.db("pa2");
        const projectsCollection = db.collection("projects");

        const projects = await projectsCollection.find({}).toArray();

        res.status(200).json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        })
    }

});

// GET route for project members
app.get("/api/projects/:projectId/members", async (req, res) => {
    try {
        const db = client.db("pa2");
        const memberships = db.collection("projectMemberships");
        const users = db.collection("users");

        if(!ObjectId.isValid(req.params.projectId)) {
            return res.status(400).json({
                message: "Invalid project ID"
            });
        }

        const projectId = new ObjectId(req.params.projectId);

        const memberRecords = await memberships.find({ project_id: projectId }).toArray();

        const userIds = memberRecords.map(
            (member) => member.user_id
        );

        const members = await users.find({
            _id: { $in: userIds}
        }).project({
            _id: 1,
            username: 1,
            firstname: 1,
            lastname: 1
        }).toArray();

        res.status(200).json(members);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});



/**************************************
        * IMPLEMENT BELOW *
**************************************/

const validPriorities = ["High", "Medium", "Low"];
const validStatuses = ["To Do", "In Progress", "Done"];

function validObjectId(id) {
    return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
}

async function isProjectMember(db, projectId, userId) {
    const membership = await db.collection("projectMemberships").findOne({
        project_id: projectId,
        user_id: userId
    });

    return membership !== null;
}


// Link existing projects
app.get("/api/projects", async (req, res) => {
    try {
        const db = client.db("pa2");

        const projects = await db.collection("projects")
            .find({})
            .toArray();
        
        res.json(projects);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// List a current project's members
app.get("/api/projects/:projectId/members", async (req, res) => {
    try {
        const db = client.db("pa2");

        if (!validObjectId(req.params.projectId)) {
            return res.status(400).json({
                message: "Invalid project ID"
            });
        }

        const projectId = new ObjectId(req.params.projectId);

        const project = await db.collection("projects").findOne({
            _id: projectId
        });

        if(!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const memberships = await db.collection("projectMemberships")
            .find({project_id: projectId})
            .toArray();

            const userIds = memberships.map(membership => membership.user_id);

            const members = await db.collection("users")
                .find(
                    { _id: { $in: userIds } },
                    { projection: { password: 0 } }
                )
                .toArray();
            
                res.json(members);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});


// List a project's stories
app.get("/api/projects/:projectId/stories", async (req, res) => {
    try {
        const db = client.db("pa2");

        if(!validObjectId(req.params.projectId)) {
            return res.status(400).json({
                message: "Invalid project ID"
            });
        }

        const projectId = new ObjectId(req.params.projectId);

        const project = await db.collection("projects").findOne({
            _id: projectId
        });

        if(!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const userStories = await db.collection("userStories")
            .find({ project_id: projectId})
            .toArray();
        
        res.json(userStories);  

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});


// Create a story
app.post("/api/projects/:projectId/stories", async (req, res) => {
    try {
        const db = client.db("pa2");

        const { title, description, priority, assigned_user_id } = req.body;

        if(!validObjectId(req.params.projectId)) {
            return res.status(400).json({
                message: "Invalid project ID"
            });
        }

        const projectId = new ObjectId(req.params.projectId);

        const project = await db.collection("projects").findOne({
            _id: projectId
        });

        if(!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (typeof title !== "string" || !title.trim() || 
            typeof description !== "string" || !description.trim()) {
                return res.status(400).json({
                    message: "Title and description required"
                });
            }
        
        if(!validPriorities.includes(priority)) {
            return res.status(400).json({
                message: "Invalid priority"
            });
        }

        let assignedUserId = null;

        if(assigned_user_id !== null && assigned_user_id !== undefined && assigned_user_id !== "") {
            if(!validObjectId(assigned_user_id)) {
                return res.status(400).json({
                    message: "Invalid assigned user ID"
                });
            }
    
            assignedUserId = new ObjectId(assigned_user_id);

            const isMember = await isProjectMember(
                db, projectId, assignedUserId
            );

            if(!isMember) {
                return res.status(400).json({
                    message: "Assigned user is not a member of this project"
                });
            }
        }

        const newStory = {
            project_id: projectId,
            title: title.trim(),
            description: description.trim(),
            priority: priority,
            status: "To Do",
            assigned_user_id: assignedUserId
        };

        const result = await db.collection("userStories").insertOne(newStory);

        res.status(201).json({
            message: "User story created successfully",
            _id: result.insertedId
        });
        
        


    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});


// Save an edited story
app.put("/api/projects/:projectId/stories/:storyId", async (req, res) => {
    try {
        const db = client.db("pa2");

        const { title, description, priority, status, assigned_user_id } = req.body;

        if (!validObjectId(req.params.projectId) ||
            !validObjectId(req.params.storyId)) {
            return res.status(400).json({
                message: "Invalid project or story ID"
            });
        }

        const projectId = new ObjectId(req.params.projectId);
        const storyId = new ObjectId(req.params.storyId);

        const project = await db.collection("projects").findOne({
            _id: projectId
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const story = await db.collection("userStories").findOne({
            _id: storyId,
            project_id: projectId
        });

        if (!story) {
            return res.status(404).json({
                message: "User story not found in this project"
            });
        }

        if (typeof title !== "string" || !title.trim() ||
            typeof description !== "string" || !description.trim()) {
            return res.status(400).json({
                message: "Title and description are required"
            });
        }

        if (!validPriorities.includes(priority)) {
            return res.status(400).json({
                message: "Invalid priority"
            });
        }

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        let assignedUserId = null;

        if (assigned_user_id !== null && assigned_user_id !== undefined && assigned_user_id !== "") {

            if (!validObjectId(assigned_user_id)) {
                return res.status(400).json({
                    message: "Invalid assigned user ID"
                });
            }

            assignedUserId = new ObjectId(assigned_user_id);

            const isMember = await isProjectMember(
                db, projectId, assignedUserId
            );

            if (!isMember) {
                return res.status(400).json({
                    message: "Assigned user is not a member of this project"
                });
            }
        }

        await db.collection("userStories").updateOne(
            { _id: storyId, project_id: projectId },
            {
                $set: {
                    title: title.trim(),
                    description: description.trim(),
                    priority: priority,
                    status: status,
                    assigned_user_id: assignedUserId
                }
            }
        );

        res.json({
            message: "User story updated successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});


// Delete a story
app.delete("/api/projects/:projectId/stories/:storyId", async (req, res) => {
    try {
        const db = client.db("pa2");

        if (!validObjectId(req.params.projectId) ||
            !validObjectId(req.params.storyId)) {
            return res.status(400).json({
                message: "Invalid project or story ID"
            });
        }

        const projectId = new ObjectId(req.params.projectId);
        const storyId = new ObjectId(req.params.storyId);

        const result = await db.collection("userStories").deleteOne({
            _id: storyId,
            project_id: projectId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "User story not found in this project"
            });
        }

        res.json({
            message: "User story deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});





app.listen(9000, () => {
    console.log("Server running on port 9000");
});

connectDatabase();

async function connectDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB");
        console.error(error);
    }
}


