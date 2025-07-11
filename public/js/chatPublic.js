const token = localStorage.getItem('token');

function sendMessage(event) {
    event.preventDefault();
    const message = event.target.message.value.trim();
    axios.post(`/chat/sendChat`,{ message }, { headers: { 'Authorization': token } })
    .then((res) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = '';
        postMessage(res.data);
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
    showMessages();
});

function showMessages() {
    axios.get('/chat/getChat', { headers: { 'Authorization': token } })
    .then((res) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = '';
        res.data.forEach(chat => {
            postMessage(chat);
        });
    })
    .catch((err) => {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.innerHTML = (err.response && err.response.data && err.response.data.error) ? err.response.data.error : 'An error occurred';
        errorMessage.style.color = 'red';
     });
}

function postMessage(chat) {
    const ul = document.querySelector('.messages');
    const li = document.createElement('li');
    li.innerHTML = `<p><strong>${chat.name}</strong>: ${chat.message}</p>`;
    ul.appendChild(li);
}