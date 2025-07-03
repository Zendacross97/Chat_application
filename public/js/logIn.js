function logIn(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    const logInDetails = { email, password };
    
    axios.post('/user/login', logInDetails)
        .then((res) => {
            localStorage.setItem('token', res.data.token);
            alert(res.data.message);
            window.location.href = '/chat';
        })
        .catch((err) => {
            const p = document.querySelector('.logIn-message');
            p.innerHTML = '';
            p.innerHTML = (err.response && err.response.data && err.response.data.error) ? err.response.data.error : 'An error occurred';
            p.style.color = 'red';
            console.log(err.message);
        });
    
    event.target.reset();
}