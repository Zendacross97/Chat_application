const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/user/login';
}
function sendMessage(event) {
    event.preventDefault();
    const message = event.target.message.value.trim();
    axios.post(`/chat/message`,{ message }, { headers: { 'Authorization': token } })
    .then((res) => {
        postMessage(res.data.message);
    })
    .catch((err) => {
        const messageInput = document.querySelector('.message-input');
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = (err.response && err.response.data && err.response.data.error) ? err.response.data.error : 'An error occurred';
        errorMessage.style.color = 'red';
        console.log(err.message);
    });
    event.target.reset();
}

window.addEventListener('DOMContentLoaded', () => {
    axios.get('/chat/message', { headers: { 'Authorization': token } })
    .then((res) => {
        res.data.messages.forEach(message => {
            postMessage(message);
        });
    })
    .catch((err) => {
        errorMessage.innerHTML = (err.response && err.response.data && err.response.data.error) ? err.response.data.error : 'An error occurred';
        errorMessage.style.color = 'red';
        console.log(err.message);
    });
    showMessages();
});

function postMessage(message) {
    const ul = document.querySelector('.messages');
    const li = document.createElement('li');
    li.innerHTML = `<p>${message}</p>`;
    ul.appendChild(messageElement);
}

function showMessages() {
    const ul = document.querySelector('.messages');
    ul.style.display = 'block';
}