const token = localStorage.getItem('token');
let chats = [], groups = [], users = [], userIds = [], lastId = -1, chatInterval= null;

window.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '/user/login';
    }
    // const section = document.querySelector('#section');
    // section.value = 'groups'; // Default to 'groups'
    showSearch('Search Groups ...');
    showGroupHeader();
    const chatHeading = document.querySelector('#chat-heading');
    chatHeading.textContent = 'Select on of the groups to start chatting';
    getAllUsers(); // Fetch all users on page load
    getAllGroups().then(() => {
        showAllGroups();
    });
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

// const section = document.querySelector('#section');
// section.addEventListener('change', (event) => {
//     lastId = -1; // Reset id to -1 to fetch new messages
//     if (chatInterval) {
//         clearInterval(chatInterval); // Clear previous interval if exists
//         chatInterval = null; // Reset chatInterval
//     }
//     const chatForm = document.querySelector('#chatForm');
//     chatForm.innerHTML = ''; // Clear chat form
//     const ul = document.querySelector('.messages');
//     ul.innerHTML = ''; // Clear chat messages
//     const errorMessage = document.querySelector('.error-message');
//     errorMessage.innerHTML = ''; // Clear error messages
//     const value = event.target.value;
//     const groupHeader = document.querySelector('.section-header');
//     const chatHeading = document.querySelector('#chat-heading');
//     let placeholder
//     if (value === 'groups') {
//         placeholder = 'Search Groups ...';
//         showSearch(placeholder);
//         showGroupHeader();
//         showAllGroups();
//         chatHeading.textContent = `Select on of the ${ value } to start chatting`;
//     }
//     else if (value === 'users') {
//         placeholder = 'Search Users ...';
//         showSearch(placeholder);
//         groupHeader.innerHTML = '<h3>Users</h3>';
//         showAllUsers();
//         chatHeading.textContent = `Select on of the ${ value } to start chatting`;
//     }
// });

function showSearch(placeholder) {
    const searchForm = document.querySelector('#search');
    searchForm.innerHTML = `<input type="text" id="searchInput" placeholder="${placeholder}">`;
    const searchInput = document.querySelector('#searchInput');
    searchInput.addEventListener('input', (event) => {
        const searchValue = event.target.value.toLowerCase();
        const sectionList = document.querySelector('.section-list');
        const items = sectionList.querySelectorAll('li');
        items.forEach(item => {
            const nameSpan = item.querySelector('.name');
            const numberSpan = item.querySelector('.number');
            const name = nameSpan ? nameSpan.textContent.toLowerCase() : '';
            const number = numberSpan ? numberSpan.textContent.toLowerCase() : '';
            if (name.includes(searchValue) || number.includes(searchValue)) {
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
        li.innerHTML = `
            <span class="name">${user.name}</span>
            <span class="number" style="display:none">${user.number}</span>
        `;
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
    const groupHeader = document.querySelector('.section-header');
    const chatHeading = document.querySelector('#chat-heading');
    groupHeader.innerHTML = '<h3>Groups <button class="user">Users</button></h3>';
    const p = document.querySelector('.section-headerPara');
    p.innerHTML = 'Create a new group <button id="createGroupFormButton">Create</button>';
    const userButton = document.querySelector('.user');
    userButton.addEventListener('click', () => {
        refreshChat();
        let placeholder = 'Search Users ...';
        showSearch(placeholder);
        groupHeader.innerHTML = '<h3>Users <button class="group">Groups</button></h3>';
        p.innerHTML = 'Users in your contact list:';
        const groupButton = document.querySelector('.group');
        groupButton.addEventListener('click', () => {
            refreshChat();
            placeholder = 'Search Groups ...';
            showSearch(placeholder);
            showGroupHeader();
            showAllGroups();
            chatHeading.textContent = `Select on of the ${ groupButton.className } to start chatting`;
        });
        showAllUsers();
        chatHeading.textContent = `Select on of the ${ userButton.className } to start chatting`;
    });
    const createGroupFormButton = document.querySelector('#createGroupFormButton');
    createGroupFormButton.addEventListener('click', () => {
        createGroupForm();
    });
}

function refreshChat() {
    lastId = -1; // Reset id to -1 to fetch new messages
    if (chatInterval) {
        clearInterval(chatInterval); // Clear previous interval if exists
        chatInterval = null; // Reset chatInterval
    }
    const chatForm = document.querySelector('#chatForm');
    chatForm.innerHTML = ''; // Clear chat form
    const ul = document.querySelector('.messages');
    ul.innerHTML = ''; // Clear chat messages
    const errorMessage = document.querySelector('.error-message');
    errorMessage.innerHTML = ''; // Clear error messages
}

function createGroupForm() {
    const groupHeader = document.querySelector('.section-header');
    groupHeader.innerHTML = '<h3>Groups</h3>';
    const p = document.querySelector('.section-headerPara');
    p.innerHTML = '';
    const groupForm = document.createElement('form');
    groupForm.id = 'createGroupForm';
    groupForm.innerHTML = `<input type="text" id="groupName" placeholder="New group name" required>
    <button type="submit">Create</button><button class="cancel">Cancel</button><br>`;
    p.appendChild(groupForm);
    groupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const groupName = event.target.groupName.value.trim();
        if (groupName) {
            createGroup(groupName);
            // Remove the form after submission (optional, handled in createGroup)
        }
    });
    const cancelButton = groupForm.querySelector('.cancel');
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
            showGroupHeader();
            showSearch('Search Groups ...');
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
        li.innerHTML = `
            <span class="name">${group.name}</span>
        `;
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
    chatHeading.innerHTML = `${groupName} <button id="showMembersBtn">Members</button> <button id="leaveGroupBtn">Leave</button>`;
    const showMembersBtn = document.querySelector('#showMembersBtn');
    showMembersBtn.addEventListener('click', () => {
        showGroupMemebers(groupId);
    });
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
    showSearch('Search Members ...');
    const groupHeader = document.querySelector('.section-header');
    groupHeader.innerHTML = '<h3>Group Members <button class="groups">Groups</button></h3>';
    const p = document.querySelector('.section-headerPara');
    p.innerHTML = 'Members in this group:';
    const groupsBtn = document.querySelector('.groups');
    groupsBtn.addEventListener('click', () => {
        showSearch('Search Groups ...');
        showGroupHeader();
        showAllGroups();
    });
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    const group = groups.find(g => g.id === groupId);
    if (group.isAdmin) {
        showAdminControls(groupId);
    }
    const memberList = document.querySelector('.section-list');
    memberList.innerHTML = ''; // Clear existing members
    group.members.forEach(member => {
        const li = document.createElement('li');
        li.id = member.id; // Set the id of the li to the user id
        li.innerHTML = `<p>${member.name} ${ member.isAdmin ? '(Admin)' : '' }</p>`;
        memberList.appendChild(li);
    });
    if (group.members.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No members in this group except you';
        memberList.appendChild(li);
    }
}

function showAdminControls(groupId) {
    const p = document.querySelector('.section-headerPara');
    p.innerHTML = '<button id="addUserToGroupBtn">Add</button> <button id="removeUserFromGroupBtn">Remove</button> <button class="makeAdminBtn">Promote</button> <button class="removeAdminBtn">Demote</button>';
    const addUserToGroupBtn = document.querySelector('#addUserToGroupBtn');
    addUserToGroupBtn.addEventListener('click', () => {
        showUnaddedUsers(groupId);
    });
    const removeUserFromGroupBtn = document.querySelector('#removeUserFromGroupBtn');
    removeUserFromGroupBtn.addEventListener('click', () => {
        showRemovableUsers(groupId);
    });
    const makeAdminBtn = document.querySelector('.makeAdminBtn');
    makeAdminBtn.addEventListener('click', () => {
        showPromotableUsers(groupId);
    });
    const removeAdminBtn = document.querySelector('.removeAdminBtn');
    removeAdminBtn.addEventListener('click', () => {
        showDemotableUsers(groupId);
    });
}

function showUnaddedUsers(groupId) {
    const groupHeader = document.querySelector('.section-header');
    groupHeader.innerHTML = '<h3>Unadded Users</h3>';
    const p = document.querySelector('.section-headerPara');
    p.innerHTML = 'Add users in this group: <button class="cancel">cancel</button>';
    const cancelBtn = document.querySelector('.cancel');
    cancelBtn.addEventListener('click', () => {
        showGroupMemebers(groupId);
    });
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    const group = groups.find(g => g.id === groupId);
    showRequiredUsers(group.non_members);
    const form = document.getElementById('usersForm');
    if (form) {
        const confirmButton = document.querySelector('#confirmBtn');
        confirmButton.onclick = function() {
            const checked = form.querySelectorAll('.user-checkbox:checked');
            checked.forEach(cb => {
                userIds.push(cb.value);
            });
            if (userIds.length > 0) {
                addUserToGroup(groupId, userIds).then(() => {
                    getAllGroups().then(() => {
                        showGroupMemebers(groupId);// Refresh the member list
                        userIds = []; // Clear userIds after adding users
                    });
                });
            }
        };
    }
}

function addUserToGroup(groupId, userIds) {
    return axios.post(`/group/addUserToGroup/${groupId}`, { userIds }, { headers: { 'Authorization': token } })
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

function showRemovableUsers(groupId) {
    const groupHeader = document.querySelector('.section-header');
    groupHeader.innerHTML = '<h3>Remove Members</h3>';
    const p = document.querySelector('.section-headerPara');
    p.innerHTML = 'Remove users from this group: <button class="cancel">cancel</button>';
    const cancelBtn = document.querySelector('.cancel');
    cancelBtn.addEventListener('click', () => {
        showGroupMemebers(groupId);
    });
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    const group = groups.find(g => g.id === groupId);
    showRequiredUsers(group.members);
    const form = document.getElementById('usersForm');
    if (form) {
        const confirmButton = document.querySelector('#confirmBtn');
        confirmButton.onclick = function() {
            const checked = form.querySelectorAll('.user-checkbox:checked');
            checked.forEach(cb => {
                userIds.push(cb.value);
            });
            if (userIds.length > 0) {
                removeUserFromGroup(groupId, userIds).then(() => {
                    getAllGroups().then(() => {
                        showGroupMemebers(groupId);// Refresh the member list
                        userIds = []; // Clear userIds after removing users
                    });
                });
            }
        };
    }
}

function removeUserFromGroup(groupId, userIds) {
    return axios.post(`/group/removeUserFromGroup/${groupId}`, { userIds }, { headers: { 'Authorization': token } })
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

function showPromotableUsers(groupId) {
    const groupHeader = document.querySelector('.section-header');
    groupHeader.innerHTML = '<h3>Promote Members</h3>';
    const p = document.querySelector('.section-headerPara');
    p.innerHTML = 'Promote users to admin: <button class="cancel">cancel</button>';
    const cancelBtn = document.querySelector('.cancel');
    cancelBtn.addEventListener('click', () => {
        showGroupMemebers(groupId);
    });
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    const group = groups.find(g => g.id === groupId);
    showRequiredUsers(group.non_admins);
    const form = document.getElementById('usersForm');
    if (form) {
        const confirmButton = document.querySelector('#confirmBtn');
        confirmButton.onclick = function() {
            const checked = form.querySelectorAll('.user-checkbox:checked');
            checked.forEach(cb => {
                userIds.push(cb.value);
            });
            if (userIds.length > 0) {
                promoteMembers(groupId, userIds).then(() => {
                    getAllGroups().then(() => {
                        showGroupMemebers(groupId);// Refresh the member list
                        userIds = []; // Clear userIds after adding users
                    });
                });
            }
        };
    }
    
}

function promoteMembers(groupId, userIds) {
    return axios.post(`/group/promoteMembers/${groupId}`, { userIds }, { headers: { 'Authorization': token } })
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

function showDemotableUsers(groupId) {
    const groupHeader = document.querySelector('.section-header');
    groupHeader.innerHTML = '<h3>Demote Members</h3>';
    const p = document.querySelector('.section-headerPara');
    p.innerHTML = 'Demote admins to members: <button class="cancel">cancel</button>'
    const cancelBtn = document.querySelector('.cancel');
    cancelBtn.addEventListener('click', () => {
        showGroupMemebers(groupId);
    });
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    const group = groups.find(g => g.id === groupId);
    showRequiredUsers(group.admins);
    const form = document.getElementById('usersForm');
    if (form) {
        const confirmButton = document.querySelector('#confirmBtn');
        confirmButton.onclick = function() {
            const checked = form.querySelectorAll('.user-checkbox:checked');
            checked.forEach(cb => {
                userIds.push(cb.value);
            });
            if (userIds.length > 0) {
                demoteMembers(groupId, userIds).then(() => {
                    getAllGroups().then(() => {
                        showGroupMemebers(groupId);// Refresh the member list
                        userIds = []; // Clear userIds after adding users
                    });
                });
            }
        };
    }
}

function demoteMembers(groupId, userIds) {
    return axios.post(`/group/demoteMembers/${groupId}`, { userIds }, { headers: { 'Authorization': token } })
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

function showRequiredUsers(users) {
    const userList = document.querySelector('.section-list');
    userList.innerHTML = ''; // Clear existing users
    const form = document.createElement('form');
    form.id = 'usersForm';
    users.forEach(user => {
        const div = document.createElement('div');
        div.style.marginBottom = '8px';
        div.innerHTML = `
            <input type="checkbox" class="user-checkbox" id="user-${user.id}" value="${user.id}">
            <label for="user-${user.id}">
                <span class="user-name">${user.name}</span>
                <span class="user-number" style="display:none">${user.number}</span>
            </label>`;
        form.appendChild(div);
    });
    const search = document.querySelector('#search');
    search.innerHTML = `<input type="text" id="searchInput" placeholder="Search Users ...">`;
    const searchInput = document.querySelector('#searchInput');
    searchInput.addEventListener('input', (event) => {
        const searchValue = event.target.value.toLowerCase();
        const checkboxes = form.querySelectorAll('div');
        checkboxes.forEach(checkbox => {
            const nameSpan = checkbox.querySelector('.user-name');
            const numberSpan = checkbox.querySelector('.user-number');
            const name = nameSpan ? nameSpan.textContent.toLowerCase() : '';
            const number = numberSpan ? numberSpan.textContent.toLowerCase() : '';
            if (name.includes(searchValue) || number.includes(searchValue)) {
                checkbox.style.display = '';
            } else {
                checkbox.style.display = 'none';
            }
        });
    });
    if (users.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No such users available';
        userList.appendChild(li);
    } else {
        const confirmButton = document.createElement('button');
        confirmButton.id = 'confirmBtn';
        confirmButton.type = 'button';
        confirmButton.textContent = 'Confirm';
        confirmButton.style.marginTop = '10px';
        form.appendChild(confirmButton);
        userList.appendChild(form);
    }
}

function leaveGroup(groupId) {
    axios.delete(`/group/leaveGroup/${groupId}`, { headers: { 'Authorization': token } })
    .then((res) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = '';
        if (chatInterval) {
            clearInterval(chatInterval); // Clear the chat interval
        }
        getAllGroups().then(() => {
            showAllGroups();
        });
        const memberBtn = document.querySelector('#showMembersBtn');
        memberBtn.remove(); // Remove the 'Members' button
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
        refreshChat();
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
        console.log(err.message);
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