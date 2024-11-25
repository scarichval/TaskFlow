const loginModal = document.getElementById('login-modal');
const loginBtn = document.getElementById('login-btn');
const loginForm = document.getElementById('login-form');
const taskCreationZone = document.getElementById('task-creation');
const taskForm = document.getElementById('task-form');
const createProjectBtn = document.getElementById('create-project-btn');
const createProjectModal = document.getElementById('create-project-modal');
const closeProjectModalBtn = document.getElementById('close-project-modal');
const projectForm = document.getElementById('project-form');
const serverUrl = "http://localhost:3000";
const createTaskModal = document.getElementById('create-task-modal');
const closeTaskModalBtn = document.getElementById('close-task-modal');
const createTaskForm = document.getElementById('create-task-form');
let currentProjectId = null; // To track which project tasks are being added to
const taskAssignedToSelect = document.getElementById('task-assigned-to');



createProjectBtn.addEventListener('click', () => {
    createProjectModal.style.display = 'flex';
});

closeProjectModalBtn.addEventListener('click', () => {
    createProjectModal.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', loadDOM);

loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex';
});

// login
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Stops form submission

    // Get form Data
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Make the API call
        const response = await fetch(`${serverUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        //handle response
        if (response.ok) {
            const token = await response.json();
            console.log('Login successful, token:', token);

            // Store the token locally
            localStorage.setItem('authToken', token);

            // Update th UI
            alert('Login successful!');
            loginModal.style.display = 'none';
            // taskCreationZone.style.display = 'flex';

            // Load projects for the logged-in user
            loadProjects(); // This will immediately display the user's projects
        } else {
            const error = await response.text();
            alert(`Login failed: ${error}`);
        }

    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred while logging in. Please try again.');
    }
});


// Handle project form submission

projectForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get project details from the form
    const name = document.getElementById('project-name').value;
    const description = document.getElementById('project-description').value;

    try {
        // Get the authentication token (ensure the user is logged in) 
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('You must be logged in to create a project.');
            return;
        }

        // Make the API request to create the project
        const response = await fetch(`${serverUrl}/api/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ name, description }),
        });

        if (response.ok) {
            const project = await response.json();
            console.log('Project created:', project);
            alert('Project created successfully!');

            // Update the UI
            loadProjects();

            // Reset and close the modal
            projectForm.reset();
            createProjectModal.style.display = 'none';
        } else {
            const errorMessage = await response.text();
            console.error('Error creating project:', errorMessage);
            alert('Failed to create project: ' + errorMessage);
        }

    } catch (error) {
        console.error('Error while creating the project:', error);
        alert('An error occurred. Please try again.');
    }
})

async function loadProjects() {
    try {
        // Get the authentication token
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('You must be logged in to view projects.');
            return;
        }

        // Fetch the projects from the backend 
        const response = await fetch(`${serverUrl}/api/projects`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const projects = await response.json();
            console.log('Projects:', projects);

            if (projects.length === 0) {
                projectsContainer.innerHTML = '<p>No projects available. Create a new project!</p>';
                return;
            }
            

            // Clear the projects container
            const projectsContainer = document.getElementById('projects-container');
            if (!projectsContainer) {
                console.error('projectsContainer not found in the DOM.');
                return;
            }
            projectsContainer.innerHTML = '';

            // Render each project
            projects.forEach((project) => {
                const projectItem = document.createElement('div');
                projectItem.classList.add('project-item');
                projectItem.dataset.projectId = project._id;        // dataset ?? how does this give 'data-project-id' <div class="project-item" data-project-id="673e7473573bd1cc670ea7bd">Produce a movie </div>
                // projectItem.textContent = project.name;
                projectItem.innerHTML = `
                    <h3>${project.name}</h3>
                    <button class="add-task-btn">Add task</button>
                `;

                const addTaskBtn = projectItem.querySelector('.add-task-btn');
                console.log('Add Task button created:', addTaskBtn);

                addTaskBtn.addEventListener('click', async (event) => {
                    event.stopPropagation();
                    currentProjectId = project._id;
                    createTaskModal.style.display = 'flex';
                    await populateAssignToDropdown();
                });

                // Create a container for tasks (initially hidden)
                const taskContainer = document.createElement('div');
                taskContainer.classList.add('task-container');
                taskContainer.style.display = 'none';

                // listener to toggle tasks visibility
                projectItem.addEventListener('click', () => {
                    toggleTasks(project._id, taskContainer);
                });

                // Append the task container below the project
                projectsContainer.appendChild(projectItem);
                projectsContainer.appendChild(taskContainer);
            })
        } else {
            const errorMessage = await response.text();
            console.error('Error loading projects:', errorMessage);
        }

    } catch (error) {
        console.error('Error fetching projects:', error);
    }
};

createTaskForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const taskTitle = document.getElementById('task-title').value;
    const taskDescription = document.getElementById('task-description').value;
    const taskAssignation = document.getElementById('task-assigned-to').value;
    const taskStatus = document.getElementById('task-status').value;

    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('You are not authenticated. Please log in.');
        return;
    }

    try {
        const response = await fetch(`${serverUrl}/api/tasks/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                title: taskTitle,
                description: taskDescription,
                assignedTo: taskAssignation,
                status: taskStatus,
                project: currentProjectId,
            }),
        });

        if (response.ok) {
            const createdTask = await response.json();
            console.log('Task created successfully:', createdTask);
            alert('Task created successfully!');
            createTaskModal.style.display = 'none';
            createTaskForm.reset();
        } else {
            const error = await response.text();
            console.log('Error creating task: ', error);
            alert('Failed to create task', error);
        }
    } catch (error) {
        console.error('Error while creating the task:', error);
        alert('An error occurred. Please try again.');
    }
});

closeTaskModalBtn.addEventListener('click', () => {
    createTaskModal.style.display = 'none';
});

async function populateAssignToDropdown() {
    console.log('Fetching users for task assignment...');

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('You are not authenticated. Please log in.');
            return;
        }

        const response = await fetch(`${serverUrl}/api/auth/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const users = await response.json();
            console.log('Fetched users:', users);

            if (taskAssignedToSelect) {
                taskAssignedToSelect.innerHTML = '<option value="" disabled selected>Select a user</option>';
                users.forEach((user) => {
                    const option = document.createElement('option');
                    option.value = user._id;
                    option.textContent = user.username;
                    taskAssignedToSelect.appendChild(option);
                });
            } else {
                console.error('Dropdown element not found.');
            }

        } else {
            const error = await response.text();
            console.error('Error fetching users:', error);
            alert('Failed to load users.');
        }

    } catch (error) {
        console.error('Error while retrieving users:', error);
        alert('An error occurred. Please try again.');
    }
}


async function toggleTasks(projectId, taskContainer) {
    if (taskContainer.style.display === 'none') {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('You must be logged in to view tasks.');
                return;
            }

            const response = await fetch(`${serverUrl}/api/tasks/${projectId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const tasks = await response.json();
                console.log('Tasks for project:', tasks);

                // Clear any existing tasks
                taskContainer.innerHTML = '';

                if (tasks.length === 0) {
                    taskContainer.textContent = 'No tasks for this project.';
                } else {
                    tasks.forEach((task) => {
                        const taskItem = document.createElement('div');
                        taskItem.classList.add('task-item');
                        taskItem.textContent = `${task.title} - ${task.status}`;
                        taskContainer.appendChild(taskItem);
                    });
                }

                taskContainer.style.display = 'block'; // Show the task container
            } else {
                const errorMessage = await response.text();
                console.error('Error loading tasks:', errorMessage);
                alert('Failed to load tasks: ' + errorMessage);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    } else {
        taskContainer.style.display = 'none'; // Hide the task container
    }
}


function loadDOM() {
    loadProjects();
    const token = localStorage.getItem('authToken');
}



