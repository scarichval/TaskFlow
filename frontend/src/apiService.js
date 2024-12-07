const server = 'http://localhost:3000';

export async function login(username, password){
    const response = await fetch(`${serverUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify({username, password}),
    });

    if(!response.ok){
        throw new Error(await response.text());
    }
    const token = response.json();
    return token;
}

export async function fetchProject(token){
    const response = await fetch(`${serverUrl}/api/projects`,  {
        method: 'GET',
        headers: {

            'Authorization': `Bearer ${token}`,
        },
    });

    if(!response.ok){
        throw new Error(await response.text());
    }

    const projects = response.json();
    return projects;
}

export async function createProject(token, name, description){
    const response = await fetch(`${serverUrl}/api/projects`, {
        method: 'POST',
        headers: {
            
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({name, description}),
    });

    if(!response.ok){
        throw new Error(await response.text());
    }
    
    const createdProject = response.json();
    return createdProject;
}


export  async function deleteProject(token, projectId){
    const deletedProject = await fetch(`${serverUrl}/api/tasks/${projectId}`, {
        method: 'DELETE',
        headers: {
            
            'Authorization': `Bearer ${token}`,
        },
    });

    if(!deleteProject.ok){
        throw new Error(deleteProject.text());
    }

    return deleteProject;
}

export async function fetchTasks(token){
    const fetchedTasks = await fetch(`${serverUrl}/api/tasks`, {
        method: 'GET',
        headers: {

            'Authorization': `Bearer ${token}`
        },
    });

    if(!fetchTasks.ok){
        throw new Error(fetchTasks.text());
    }

    return fetchedTasks;
}

export async function createTask(token, title, description, assignedTo, status, project){
    const createdTask =  await fetch(`${serverUrl}/api/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({title, description, assignedTo, status, project})
    });

    if(!createdTask.ok){
        throw new Error(createdTask.text());
    }

    return createTask;
}