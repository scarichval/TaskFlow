const loginModal = document.getElementById('login-modal');
const loginBtn = document.getElementById('login-btn');
const loginForm = document.getElementById('login-form');
const taskCreationZone = document.getElementById('task-creation');
const taskForm = document.getElementById('task-form');
const serverUrl = "http://localhost:3000";

document.addEventListener('DOMContentLoaded', loadDOM());

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
        const response = await fetch(`${serverUrl}/api/tasks/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ title: taskTitle, description: taskDescription, assignedTo: taskAssignation, status: taskStatus })
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


function loadDOM() {
    const token = localStorage.getItem('authToken');

    if (token) {
        taskCreationZone.style.display = 'flex';
    }
}

















// loginModal.addEventListener('click', (event) => {
//     console.log('Clicked element:', event.target); // Logs the clicked element
//     if (event.target === loginModal) {
//         loginModal.style.display = 'none';
//     }
// });
