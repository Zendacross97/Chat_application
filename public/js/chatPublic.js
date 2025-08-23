const token = localStorage.getItem('token');
let chats = [], groups = [], users = [], lastId = -1, chatInterval= null;

window.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '/user/login';
    }
    getAllGroups();// Fetch all groups on page load
    const section = document.querySelector('#section');
    section.value = 'groups'; // Default to 'groups'
    showSearch('Search Groups ...');
    showGroupHeader();
    showAllGroups(); // Fetch all groups on page load
    const chatHeading = document.querySelector('#chat-heading');
    chatHeading.textContent = 'Select on of the groups to start chatting';
    getAllUsers(); // Fetch all users on page load
});

function getAllGroups() {
    return axios.get('/group/getAllGroups', { headers: { 'Authorization': token } })
    .then((res) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = '';
        groups = []; // Reset groups array
        res.data.forEach(group => {
            groups.push(group);
        });
        localStorage.setItem('groups', JSON.stringify(groups));
    })
    .catch((err) => {
        console.log(err.message);
    });
}

function getAllUsers() {
    axios.get('/user/getAllUsers', { headers: { 'Authorization': token } })
    .then((res) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = '';
        users = []; // Reset users array
        res.data.forEach(user => {
            users.push(user);
        });
        localStorage.setItem('users', JSON.stringify(users));
    })
    .catch((err) => {
        console.log(err.message);
    });
}

const section = document.querySelector('#section');
section.addEventListener('change', (event) => {
    lastId = -1; // Reset id to -1 to fetch new messages
    if (chatInterval) {
        clearInterval(chatInterval); // Clear previous interval if exists
        chatInterval = null; // Reset chatInterval
    }
    const chatForm = document.querySelector('#chatForm');
    chatForm.innerHTML = ''; // Clear chat form
    const ul = document.querySelector('.messages');
    ul.innerHTML = ''; // Clear chat messages
    const value = event.target.value;
    const groupHeader = document.querySelector('.groupHeader');
    const chatHeading = document.querySelector('#chat-heading');
    let placeholder
    if (value === 'groups') {
        placeholder = 'Search Groups ...';
        showSearch(placeholder);
        showGroupHeader();
        showAllGroups();
        chatHeading.textContent = `Select on of the ${ value } to start chatting`;
    }
    else if (value === 'users') {
        placeholder = 'Search Users ...';
        showSearch(placeholder);
        groupHeader.innerHTML = '<h3>Users</h3>';
        showAllUsers();
        chatHeading.textContent = `Select on of the ${ value } to start chatting`;
    }
});

function showSearch(placeholder) {
    const searchForm = document.querySelector('#search');
    searchForm.innerHTML = `<input type="text" id="searchInput" placeholder="${placeholder}">`;
    const searchInput = document.querySelector('#searchInput');
    searchInput.addEventListener('input', (event) => {
        const searchValue = event.target.value.toLowerCase();
        const sectionList = document.querySelector('.section-list');
        const items = sectionList.querySelectorAll('li');
        items.forEach(item => {
            const itemText = item.textContent.toLowerCase();
            if (itemText.includes(searchValue)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

function showAllUsers() {
    const userList = document.querySelector('.section-list');
    userList.innerHTML = ''; // Clear existing users
    users.forEach(user => {
        const li = document.createElement('li');
        li.id = user.id; // Set the id of the li to the user id
        li.classList.add('user-item'); // Add a class for styling
        li.textContent = user.name;
        li.addEventListener('click', () => {
            lastId = -1; // Reset id to -1 to fetch new messages
            const chatHeading = document.querySelector('#chat-heading');
            chatHeading.innerHTML = `${user.name}`;
            const chatForm = document.querySelector('#chatForm');
            chatForm.innerHTML = `<input type="text" id="message" name="message" placeholder="Type your message here" required>
            <button type="submit">Send</button>`;
            chatForm.addEventListener('submit', (event) => {
                sendChat(event, user.id, user.type);
            });
            if (chatInterval) {
                clearInterval(chatInterval); // Clear previous interval if exists
                chatInterval = null; // Reset chatInterval
            }
            chatInterval = setInterval(() => getChats(user.id, user.type), 1000); // Fetch chats every 1 second
        });
        userList.appendChild(li);
    });
    if (users.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No users found';
        userList.appendChild(li);
    }
}

function showGroupHeader() {
    const groupHeader = document.querySelector('.groupHeader');
    groupHeader.innerHTML = '<h3>Groups</h3><p>Create a new group <button id="createGroupFormButton">Create</button></p>';
    const createGroupFormButton = document.querySelector('#createGroupFormButton');
    createGroupFormButton.addEventListener('click', () => {
        createGroupForm();
    });
}

function createGroupForm() {
    const groupHeader = document.querySelector('.groupHeader');
    groupHeader.innerHTML = '<h3>Groups</h3>';
    const groupForm = document.createElement('form');
    groupForm.id = 'createGroupForm';
    groupForm.innerHTML = `<input type="text" id="groupName" placeholder="New group name" required>
    <button type="submit">Create</button><button class="cancel">Cancel</button><br><br>`;
    groupHeader.appendChild(groupForm);
    const createGroupForm = document.querySelector('#createGroupForm');
    createGroupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const groupName = event.target.groupName.value.trim();
        if (groupName) {
            createGroup(groupName);
            event.target.delete; // Remove the form after submission
        }
    });
    const cancelButton = document.querySelector('.cancel');
    cancelButton.addEventListener('click', (event) => {
        event.preventDefault();
        showSearch('Search Groups ...');
        showGroupHeader();
        showAllGroups(); // Refresh the group list
    });
}

function createGroup(groupName) {
    axios.post('/group/createGroup', { name: groupName }, { headers: { 'Authorization': token } })
    .then((res) => {
        const groupForm = document.querySelector('#createGroupForm');
        groupForm.remove(); // Remove the form after successful creation
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = '';
        getAllGroups().then(() => {
            showAllGroups();
        });
    })
    .catch((err) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = (err.response && err.response.data && err.response.data.error) ? err.response.data.error : 'An error occurred';
        errorMessage.style.color = 'red';
    });
}

function showAllGroups() {
    const groupList = document.querySelector('.section-list');
    groupList.innerHTML = ''; // Clear existing groups
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    groups.forEach(group => {
        const li = document.createElement('li');
        li.id = group.id; // Set the id of the li to the group id
        li.classList.add('group-item'); // Add a class for styling
        li.textContent = group.name;
        li.addEventListener('click', () => {
            showGroupChatSection(group.id, group.name, group.type);
        });
        groupList.appendChild(li);
    });
    if (groups.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No groups found';
        groupList.appendChild(li);
    }
}

function showGroupChatSection(groupId, groupName, groupType) {
    lastId = -1; // Reset id to -1 to fetch new messages
    const chatHeading = document.querySelector('#chat-heading');
    chatHeading.innerHTML = `${groupName} <button id="showMembersBtn">Members</button> <button id="addUserToGroupBtn">Add</button> <button id="leaveGroupBtn">Leave</button>`;
    const showMembersBtn = document.querySelector('#showMembersBtn');
    showMembersBtn.addEventListener('click', () => {
        showGroupMemebers(groupId);
    });
    const addUserToGroupBtn = document.querySelector('#addUserToGroupBtn');
    addUserToGroupBtn.addEventListener('click', () => {
        showUnaddedUsers(groupId);
    })
    const leaveGroupBtn = document.querySelector('#leaveGroupBtn');
    leaveGroupBtn.addEventListener('click', () => {
        leaveGroup(groupId);
    })
    const chatForm = document.querySelector('#chatForm');
    chatForm.innerHTML = `<input type="text" id="message" name="message" placeholder="Type your message here" required>
    <button type="submit">Send</button>`;
    chatForm.addEventListener('submit', (event) => {
        sendChat(event, groupId, groupType);
    });
    if (chatInterval) {
        clearInterval(chatInterval); // Clear previous interval if exists
    }
    chatInterval = setInterval(() => getChats(groupId, groupType), 1000); // Fetch chats every 1 second
}

function showGroupMemebers(groupId) {
    axios.get(`/group/getGroupMembers/${groupId}`, { headers: { 'Authorization': token } })
    .then((res) => {
        showSearch('Search Members ...');
        const groupHeader = document.querySelector('.groupHeader');
        groupHeader.innerHTML = '<h3>Group Members</h3><p>Members in this group: <button class="done">Done</button></p>';
        const doneBtn = document.querySelector('.done');
        doneBtn.addEventListener('click', () => {
            showSearch('Search Groups ...');
            showGroupHeader();
            showAllGroups();
        });
        const memberList = document.querySelector('.section-list');
        memberList.innerHTML = ''; // Clear existing members
        res.data.forEach(group => {
            const li = document.createElement('li');
            li.id = group.user.id; // Set the id of the li to the user id
            li.innerHTML = `<p>${group.user.name}</p>`;
            memberList.appendChild(li);
        });
        if (res.data.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No members in this group';
            memberList.appendChild(li);
        }
    })
    .catch((err) => {
        console.log(err.message);
    });
}

function showUnaddedUsers(groupId) {
    axios.get(`/group/getUnaddedUsers/${groupId}`, { headers: { 'Authorization': token } })
    .then((res) => {
        showSearch('Search Users ...');
        const groupHeader = document.querySelector('.groupHeader');
        groupHeader.innerHTML = '<h3>Unadded Users</h3><p>Add users in this group: <button class="done">Done</button></p>';
        const doneBtn = document.querySelector('.done');
        doneBtn.addEventListener('click', () => {
            showSearch('Search Groups ...');
            showGroupHeader();
            showAllGroups();
        });
        const userList = document.querySelector('.section-list');
        userList.innerHTML = ''; // Clear existing users
        res.data.forEach(user => {
            const li = document.createElement('li');
            li.innerHTML = `<p>${user.name} <button class="add-user-btn" id="${user.id}">Add</button></p>`;
            const addUserBtn = li.querySelector('.add-user-btn')
            addUserBtn.style.color = 'red';
            addUserBtn.addEventListener('click', () => {
                addUserToGroup(groupId, user.id);
                addUserBtn.textContent = 'Added'; // Change button text to 'Added'
                addUserBtn.style.color = 'green'; // Change button color to green
                addUserBtn.disabled = true; // Disable the button after adding
            });
            userList.appendChild(li);
        });
        if (res.data.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No users available to add';
            userList.appendChild(li);
        }
    })
    .catch((err) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = (err.response && err.response.data && err.response.data.error) ? err.response.data.error : 'An error occurred';
        errorMessage.style.color = 'red';
        console.log(err.message);
    });
}

function addUserToGroup(groupId, userId) {
    axios.post(`/group/addUserToGroup/${groupId}/${userId}`, {}, { headers: { 'Authorization': token } })
    .then((res) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = '';
    })
    .catch((err) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = (err.response && err.response.data && err.response.data.error) ? err.response.data.error : 'An error occurred';
        errorMessage.style.color = 'red';
        console.log(err.message);
    });
}

function leaveGroup(groupId) {
    axios.delete(`/group/leaveGroup/${groupId}`, { headers: { 'Authorization': token } })
    .then((res) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = '';
        if (chatInterval) {
            clearInterval(chatInterval); // Clear the chat interval
        }
        getAllGroups(); // Refresh the group list after leaving a group
        showAllGroups();
        const addUserToGroupBtn = document.querySelector('#addUserToGroupBtn');
        addUserToGroupBtn.remove(); // Remove the 'Add User' button
        const leaveGroupBtn = document.querySelector('#leaveGroupBtn');
        leaveGroupBtn.remove(); // Remove the 'Leave Group' button
        const chatForm = document.querySelector('#chatForm');
        chatForm.innerHTML = ''; // Clear chat form
        const ul = document.querySelector('.messages');
        ul.innerHTML = ''; // Clear chat messages
        const li = document.createElement('li');
        li.textContent = res.data.message; // Show success message
        li.style.color = 'green';
        ul.appendChild(li);
    })
    .catch((err) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = (err.response && err.response.data && err.response.data.error) ? err.response.data.error : 'An error occurred';
        errorMessage.style.color = 'red';
        console.log(err.message);
    });
}

function sendChat(event, id, type) {
    event.preventDefault();
    const message = event.target.message.value.trim();
    axios.post(`/chat/sendChat/${id}`,{ message, type }, { headers: { 'Authorization': token } })
    .then((res) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = '';
    })
    .catch((err) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = (err.response && err.response.data && err.response.data.error) ? err.response.data.error : 'An error occurred';
        errorMessage.style.color = 'red';
        console.log(err.message);
    });
    event.target.reset();
}

function getChats(id, chatType) {
    axios.get(`/chat/getChats/${id}?type=${chatType}&lastMessageId=${lastId}`, { headers: { 'Authorization': token } })
    .then((res) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = '';
        if (lastId === -1) {
            localStorage.removeItem('chats'); // Clear previous chats if id is -1
            chats = []; // Reset chats array
            res.data.forEach(chat => {
                chats.push(chat);
            });
            lastId = res.data[0].id; // Update id to the last message's id as data is in descending order
        }
        else {
            if (res.data.length !== 0) {
                res.data.forEach(chat => {
                    chats.unshift(chat);
                    if (chats.length > 10) // Limit to last 10 chats
                    chats.pop(); // Remove the oldest chat if more than 10
                });
                lastId = res.data[res.data.length - 1].id; // Update id to the last message's id
                localStorage.setItem('chats', JSON.stringify(chats));
            }
            else {
                return; // No new messages, exit the function
            }
        }
        localStorage.setItem('chats', JSON.stringify(chats));
        showChats();
    })
    .catch((err) => {
        const errorMessage = document.querySelector('.error-message');
        const ul = document.querySelector('.messages');
        ul.innerHTML = ''; // Clear chat messages
        errorMessage.innerHTML = (err.response && err.response.data && err.response.data.error) ? err.response.data.error : 'An error occurred';
        errorMessage.style.color = 'red';
     });
}

function showChats() {
    localStorage.getItem('chats');
    const localChats = JSON.parse(localStorage.getItem('chats')) || [];
    const ul = document.querySelector('.messages');
    ul.innerHTML = ''; // Clear existing messages
    localChats.forEach(chat => {
        const li = document.createElement('li');
        li.innerHTML = `<p><strong>${chat.name}</strong>: ${chat.message}</p>`;
        ul.appendChild(li);
    });
}