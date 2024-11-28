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
let currentTaskId = null; // To track the task being edited



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
});

function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('You must be logged in to view projects.');
        return null;
    }
    return token;
}

async function fetchProjects(token) {
    const response = await fetch(`${serverUrl}/api/projects`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }

    return await response.json();
}


function clearProjectsContainer(container) {
    if (!container) {
        console.error('projectsContainer not found in the DOM.');
        return;
    }

    container.innerHTML = '';
}

function renderNoProjectsMessage(container) {
    container.innerHTML = '<p>No projects available. Create a new project!</p>';
}

function renderProjectItem(project, container) {
    const projectItem = document.createElement('div');
    projectItem.classList.add('project-item');
    projectItem.dataset.projectId = project._id;
    projectItem.innerHTML = `
        <h3>${project.name}</h3>
        <h4>${project.description}</h4>
        <button class="add-task-btn">Add task</button>
    `;

    const addTaskBtn = projectItem.querySelector('.add-task-btn');

    addTaskBtn.addEventListener('click', async (event) => {
        event.stopPropagation();
        currentProjectId = project._id;
        createTaskModal.style.display = 'flex';
        await populateAssignToDropdown(document.getElementById('task-assigned-to'), null, currentProjectId);
    });

    const taskContainer = document.createElement('div');
    taskContainer.classList.add('task-container');
    taskContainer.style.display = 'none';

    projectItem.addEventListener('click', () => {
        toggleTasks(project._id, taskContainer);
    });

    container.appendChild(projectItem);
    container.appendChild(taskContainer);
}

async function loadProjects() {
    try {
        const token = checkAuthentication();
        if (!token) return;

        const projects = await fetchProjects(token);
        const projectsContainer = document.getElementById('projects-container');
        clearProjectsContainer(projectsContainer);

        if (projects.length === 0) {
            renderNoProjectsMessage(projectsContainer);
            return;
        }

        projects.forEach((project) => renderProjectItem(project, projectsContainer));
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}


// async function loadProjects() {
//     try {
//         // Get the authentication token
//         const token = checkAuthentication();

//         // Fetch the projects from the backend 
//         const response = await fetch(`${serverUrl}/api/projects`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//             },
//         });

//         if (response.ok) {
//             const projects = await response.json();
//             console.log('Projects:', projects);


//             // Clear the projects container
//             const projectsContainer = document.getElementById('projects-container');

//             if (!projectsContainer) {
//                 console.error('projectsContainer not found in the DOM.');
//                 return;
//             }

//             if (projects.length === 0) {
//                 projectsContainer.innerHTML = '<p>No projects available. Create a new project!</p>';
//                 return;
//             }
//             projectsContainer.innerHTML = '';

//             // Render each project
//             projects.forEach((project) => {
//                 const projectItem = document.createElement('div');
//                 projectItem.classList.add('project-item');
//                 projectItem.dataset.projectId = project._id;        // dataset ?? how does this give 'data-project-id' <div class="project-item" data-project-id="673e7473573bd1cc670ea7bd">Produce a movie </div>
//                 projectItem.innerHTML = `
//                     <h3>${project.name}</h3>
//                     <h4>${project.description}</h4>
//                     <button class="add-task-btn">Add task</button>
//                 `;

//                 const addTaskBtn = projectItem.querySelector('.add-task-btn');
//                 console.log('Add Task button created:', addTaskBtn);

//                 addTaskBtn.addEventListener('click', async (event) => {
//                     event.stopPropagation();                            // more details on stopPropagation()
//                     currentProjectId = project._id;                     // this, I think is redundant find a way to centralize it, we already have the projectId in another variable
//                     createTaskModal.style.display = 'flex';
//                     await populateAssignToDropdown();
//                 });

//                 // Create a container for tasks (initially hidden)
//                 const taskContainer = document.createElement('div');
//                 taskContainer.classList.add('task-container');
//                 taskContainer.style.display = 'none';

//                 // listener to toggle tasks visibility
//                 projectItem.addEventListener('click', () => {
//                     toggleTasks(project._id, taskContainer);
//                 });

//                 // Append the task container below the project
//                 projectsContainer.appendChild(projectItem);
//                 projectsContainer.appendChild(taskContainer);
//             })
//         } else {
//             const errorMessage = await response.text();
//             console.error('Error loading projects:', errorMessage);
//         }

//     } catch (error) {
//         console.error('Error fetching projects:', error);
//     }
// };


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



// async function toggleTasks(projectId, taskContainer) {

//     if (taskContainer.style.display === 'none') {
//         try {
//             const token = localStorage.getItem('authToken');
//             if (!token) {
//                 alert('You must be logged in to view tasks.');
//                 return;
//             }

//             const response = await fetch(`${serverUrl}/api/tasks/${projectId}`, {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (response.ok) {
//                 const tasks = await response.json();
//                 console.log('Tasks for project:', tasks);

//                 // Clear any existing tasks
//                 taskContainer.innerHTML = '';

//                 if (tasks.length === 0) {
//                     taskContainer.textContent = 'No tasks for this project.';
//                 } else {
//                     tasks.forEach((task) => {
//                         const taskItem = document.createElement('div');
//                         taskItem.classList.add('task-item');
//                         taskItem.innerHTML = `
//                         <h3>${task.title}</h3> 
//                         <p><b>Status:</b> ${task.status}</p>
//                         <button class="view-task-details-btn">View details</button>
//                         <div class="task-details" style="display: none;">
//                             <p>Assigned To: ${task.assignedTo?.username || 'Unassigned'}</p>
//                             <p>Description: ${task.description}</p>
//                         </div>`;

//                         taskContainer.appendChild(taskItem);
//                     });
//                 }
//                 taskContainer.style.display = 'block'; // Show the task container

//                 document.querySelectorAll('.view-task-details-btn').forEach(button => {
//                     button.addEventListener('click', (event) => {
//                         const details = event.target.nextElementSibling;
//                         if (details.style.display === 'none') {
//                             details.style.display = 'block';
//                             event.target.textContent = 'Hide Details';
//                         } else {
//                             details.style.display = 'none';
//                             event.target.textContent = 'View Details';
//                         }
//                     });
//                 });
                
//             } else {
//                 const errorMessage = await response.text();
//                 console.error('Error loading tasks:', errorMessage);
//                 alert('Failed to load tasks: ' + errorMessage);
//             }
//         } catch (error) {
//             console.error('Error fetching tasks:', error);
//         }
//     } else {
//         taskContainer.style.display = 'none'; // Hide the task container
//     }
// }

// Toggle the visibility of the task container
// If the container is hidden, it fetches and displays the tasks; otherwise, it hides the container.
async function toggleTasks(projectId, taskContainer) {
    if (taskContainer.style.display === 'none') {
        await loadTasks(projectId, taskContainer); // Fetch and render tasks
    } else {
        taskContainer.style.display = 'none'; // Hide the task container
    }
}

// Load tasks for a specific project and display them in the task container
async function loadTasks(projectId, taskContainer) {
    try {
        const tasks = await fetchTasks(projectId); // Fetch tasks from the API
        renderTasks(tasks, taskContainer); // Render tasks in the UI
        taskContainer.style.display = 'block'; // Show the task container
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Fetch tasks from the API for a specific project
async function fetchTasks(projectId) {
    const token = localStorage.getItem('authToken'); // Retrieve the authentication token
    if (!token) throw new Error('User not authenticated.'); // Throw an error if the user is not logged in

    const response = await fetch(`${serverUrl}/api/tasks/${projectId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }, // Pass the token for authentication
    });

    if (!response.ok) {
        const errorMessage = await response.text(); // Get the error message from the response
        throw new Error(errorMessage); // Throw an error with the message
    }

    return await response.json(); // Return the JSON response (list of tasks)
}

async function deleteTask(taskId) {
    const token = localStorage.getItem('authToken');
    if(!token){
        alert('Must be logged to delete');
        return;
    }

    if (!taskId) return ;

    try {
        const response = await fetch(`${serverUrl}/api/tasks/${taskId}`,  {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if(response.ok){
            console.log(response.json());
            alert('Task deleted successfully');
            
            // we gonne update the UI here after deletion
            
        }else{
            const error = response.text();
            console.log('Error deleting the task', error);
            alert('Failed to delete tasks.');
        }

    } catch (error) {
        console.error('Error while deleting task', error);
        alert('An error occurred. Please try again.');
    }
}

// Render the tasks into the task container
function renderTasks(tasks, taskContainer) {
    taskContainer.innerHTML = ''; // Clear existing content

    if (tasks.length === 0) {
        taskContainer.textContent = 'No tasks for this project.'; // Display a message if no tasks are found
        return;
    }

    tasks.forEach((task) => {
        const taskItem = document.createElement('div'); // Create a task element
        taskItem.classList.add('task-item');
        taskItem.dataset.taskId = task._id;
        taskItem.innerHTML = `
            <h3>${task.title}</h3> 
            <p><b>Status:</b> ${task.status}</p>
            <button class="view-task-details-btn">View Details</button>
            <button class="edit-task-btn">Edit</button>
            <button class="delete-btn">Delete</button>
            <div class="task-details" style="display: none;">
                <p>Assigned To: ${task.assignedTo?.username || 'Unassigned'}
                <p>Description: ${task.description || 'No description provided.'}
            </div>`;
        taskContainer.appendChild(taskItem); // Add the task element to the container
        addDetailsToggle(taskItem); // Attach the toggle event for showing/hiding details
        addDeleteListener(taskItem);
        addEditTaskListener(taskItem, task);
    });
}

function addEditTaskListener(taskItem, task){
    const editButton = taskItem.querySelector('.edit-task-btn');
    editButton.addEventListener('click', () => {
        currentTaskId = task._id;
        populateEditTaskModal(task);
        document.getElementById('edit-task-modal').style.display = 'flex';
    })
}

function populateEditTaskModal(task){
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-description').value = task.description || '';
    document.getElementById('edit-task-status').value = task.status;

    const assignToSelect = document.getElementById('edit-task-assigned-to');
    populateAssignToDropdown(assignToSelect, task.assignedTo?._id, task.project);

}

document.getElementById('edit-task-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('authToken');
    if(!token) {
        alert('Must be logged to update');
        return;
    }

    const updatedTask = {
        title: document.getElementById('edit-task-title').value,
        description: document.getElementById('edit-task-description').value,
        assignedTo: document.getElementById('edit-task-assigned-to').value,
        status: document.getElementById('edit-task-status').value,
    };

    
    if(currentTaskId){
        try {
            const response = await fetch(`${serverUrl}/api/tasks/${currentTaskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updatedTask),
            });
    
            if (response.ok) {
                alert('Task updated successfully!');
                document.getElementById('edit-task-modal').style.display = 'none';
                await loadProjects(); // Refresh the project and task lists
            } else {
                const error = await response.text();
                console.error('Error updating task:', error);
                alert('Failed to update task.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    }else {
        alert(`CurrentTaskId must be valid`);
        return;
    }
});

document.getElementById('close-edit-task-modal').addEventListener('click', () => {
    document.getElementById('edit-task-modal').style.display = 'none';
});



function addDeleteListener(taskItem){
    const deleteButton = taskItem.querySelector('.delete-btn')
    deleteButton.addEventListener('click', async (event) => {
        event.stopPropagation();
        const taskId = taskItem.dataset.taskId;
        if(confirm('Are you sure you want to delete this task?')){
            await deleteTask(taskId);
            taskItem.remove();
        }
    });
}


// Attach an event listener to toggle task details visibility
function addDetailsToggle(taskItem) {
    const button = taskItem.querySelector('.view-task-details-btn'); // Get the "View Details" button
    const details = taskItem.querySelector('.task-details'); // Get the task details container

    button.addEventListener('click', () => {
        const isVisible = details.style.display === 'block'; // Check if the details are currently visible
        details.style.display = isVisible ? 'none' : 'block'; // Toggle the display style
        button.textContent = isVisible ? 'View Details' : 'Hide Details'; // Update button text
    });
}


async function populateAssignToDropdown(dropdownElement, selectedUserId = null, projectId = null) {
    console.log('Fetching members for task assignment...');

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('You are not authenticated. Please log in.');
            return;
        }

        const response = await fetch(`${serverUrl}/api/projects/${projectId}/members`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const members = await response.json();
            console.log('Fetched members:', members);

            if (dropdownElement) {
                dropdownElement.innerHTML = '<option value="" disabled selected>Select a user</option>'; // explain this to me
                members.forEach((member) => {
                    const option = document.createElement('option');
                    option.value = member._id;
                    option.textContent = member.username;

                    if (selectedUserId === member._id) {
                        option.selected = true; // Preselect if editing an assigned task
                    }

                    dropdownElement.appendChild(option);
                });
            } else {
                console.error('Dropdown element not found.');
            }

        } else {
            const error = await response.text();
            console.error('Error fetching members:', error);
            alert('Failed to load members.');
        }

    } catch (error) {
        console.error('Error while retrieving members:', error);
        alert('An error occurred. Please try again.');
    }
}

function loadDOM() {
    loadProjects();
}



