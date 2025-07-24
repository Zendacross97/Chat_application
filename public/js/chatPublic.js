const token = localStorage.getItem('token');
let chats = [];
let id = -1; // Initialize id to -1 to indicate no messages fetched yet

function sendMessage(event) {
    event.preventDefault();
    const message = event.target.message.value.trim();
    axios.post(`/chat/sendChat`,{ message }, { headers: { 'Authorization': token } })
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

window.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '/user/login';
    }
    setInterval(getMessages, 1000);    // Calls getMessages every 1 second
    setInterval(showMessages, 1000); // Calls getMessages every 1000ms (second)
});

function getMessages() {
    axios.get(`/chat/getChat?lastMessageId=${id}`, { headers: { 'Authorization': token } })
    .then((res) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = '';
        if (id === -1) {
            localStorage.removeItem('chats'); // Clear previous chats if id is -1
            chats = []; // Reset chats array
            res.data.forEach(chat => {
                chats.push(chat);
            });
            id = res.data[0].id; // Update id to the last message's id as data is in descending order
        }
        else {
            if (res.data.length !== 0) {
                res.data.forEach(chat => {
                chats.unshift(chat);
                chats.pop(); // Remove the oldest chat if more than 10
                });
                id = res.data[res.data.length - 1].id; // Update id to the last message's id
            }
            else {
                return; // No new messages, exit the function
            }
        }
        localStorage.setItem('chats', JSON.stringify(chats));
    })
    .catch((err) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = (err.response && err.response.data && err.response.data.error) ? err.response.data.error : 'An error occurred';
        errorMessage.style.color = 'red';
     });
}

function showMessages() {
    localStorage.getItem('chats');
    const localChats = JSON.parse(localStorage.getItem('chats')) || [];
    if (localChats === chats){
        return; // No new messages to display
    }
    const ul = document.querySelector('.messages');
    ul.innerHTML = ''; // Clear existing messages
    chats.forEach(chat => {
        const li = document.createElement('li');
        li.innerHTML = `<p><strong>${chat.name}</strong>: ${chat.message}</p>`;
        ul.appendChild(li);
    });
}