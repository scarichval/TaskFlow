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
            taskCreationZone.style.display = 'flex';
        } else {
            const error = await response.text();
            alert(`Login failed: ${error}`);
        }

    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred while logging in. Please try again.');
    }
});


taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const taskTitle = document.getElementById('task-title').value;
    const taskDescription = document.getElementById('task-description').value;
    const taskAssignation = document.getElementById('task-assigned-to').value;
    const taskStatus = document.getElementById('task-status').value;

    // Get the token from localStorage
    const token = localStorage.getItem('authToken'); // Ensure this is set during login

    if (!token) {
        alert('You are not authenticated. Please log in.');
        return;
    }

    try {
        // const projectId = 
        const response = await fetch(`${serverUrl}/api/tasks/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ title: taskTitle, description: taskDescription, assignedTo: taskAssignation, status: taskStatus, project: projectId })
        });

        if (response.ok) {
            const createdTask = await response.json();
            console.log('Here is the task that have been created: ', createdTask);
            alert('Task created successfully!');
            taskForm.reset();
        } else {
            const error = await response.text();
            console.error('Error response:', error);
            alert('Failed to create task: ' + error);
        }

    } catch (error) {
        console.error('Error while creating the task:', error);
        alert('An error occurred while creating the task. Please try again.');
    }
})

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
            //  loadProjects();

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

            // Clear the projects container
            const projectsContainer = document.getElementById('projects-container');
            projectsContainer.innerHTML = '';

            // Render each project
            projects.forEach((project) => {
                const projectItem = document.createElement('div');
                projectItem.classList.add('project-item');
                projectItem.dataset.projectId = project._id;        // dataset ??
                projectItem.textContent = project.name;

                    // Add click listener to select the project
                    // projectItem.addEventListener('click', () => {
                    //     selectProject(project._id);
                    // });

                    projectsContainer.appendChild(projectItem);
            })
        } else {
            const errorMessage = await response.text();
            console.error('Error loading projects:', errorMessage);
        }

    } catch (error) {
        console.error('Error fetching projects:', error);
    }
}

// function selectProject(projectId) {
//     console.log('Selected Project ID:', projectId);
//     sessionStorage.setItem('currentProjectId', projectId);

//     // Optionally load tasks for the selected project
//     loadTasksForProject(projectId);
// }


function loadDOM() {
    loadProjects();
    const token = localStorage.getItem('authToken');

    if (token && taskCreationZone) {
        taskCreationZone.style.display = 'flex';
    }
    
}







// loginModal.addEventListener('click', (event) => {
//     console.log('Clicked element:', event.target); // Logs the clicked element
//     if (event.target === loginModal) {
//         loginModal.style.display = 'none';
//     }
// });
