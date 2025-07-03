function signUp(event) {
    event.preventDefault();
    const name = event.target.name.value;
    const email = event.target.email.value;
    const number = event.target.number.value;
    const password = event.target.password.value;
    const signUpDetails = { name, email, number, password };
    axios.post('/user/signUp', signUpDetails)
    .then((res) => {
        const p = document.querySelector('.signUp-message');
        p.innerHTML = '';
        alert(res.data.message);
        window.location.href = '/user/login';
    })
    .catch((err) => {
        const p = document.querySelector('.signUp-message');
        p.innerHTML = (err.response && err.response.data && err.response.data.error) ? err.response.data.error : 'An error occurred';
        p.style.color = 'red';
        console.log(err.message);
    });
    event.target.reset();
}