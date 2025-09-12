document.addEventListener('DOMContentLoaded', function(){
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const loginButton = document.querySelector('.btn-login');

    const validCredentials = { username: 'admin', password: '1234' };

    loginForm.addEventListener('submit', handleLogin);

    [usernameInput, passwordInput].forEach(input=>{
        input.addEventListener('focus', ()=>{hideErrorMessage();});
        input.addEventListener('input', e=>{
            e.target.style.transform = e.target.value.length>0 ? 'scale(1.02)' : 'scale(1)';
        });
        input.addEventListener('blur', e=>{e.target.style.transform='scale(1)';});
    });

    function handleLogin(e){
        e.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if(!username || !password){
            showErrorMessage('Preencha todos os campos');
            shakeForm();
            return;
        }

        showLoadingState();

        setTimeout(()=>{
            hideLoadingState();
            if(username === validCredentials.username && password === validCredentials.password){
                loginButton.style.background='linear-gradient(135deg,#10b981 0%,#059669 100%)';
                loginButton.innerHTML='<span class="btn-text">✓ Sucesso!</span>';
                localStorage.setItem('droneDeliveryAuth','true');
                localStorage.setItem('droneDeliveryUser', username);
                document.body.style.background='linear-gradient(135deg,#10b981 0%,#059669 100%)';
                setTimeout(()=> window.location.href='index.html',1000);
            } else {
                showErrorMessage('Usuário ou senha incorretos');
                passwordInput.value='';
                passwordInput.focus();
                shakeForm();
            }
        },1500);
    }

    function showLoadingState(){
        loginButton.classList.add('loading');
        loginButton.style.pointerEvents='none';
    }

    function hideLoadingState(){
        loginButton.classList.remove('loading');
        loginButton.style.pointerEvents='auto';
    }

    function showErrorMessage(msg='Usuário ou senha incorretos'){
        errorMessage.textContent=msg;
        errorMessage.classList.add('show');
        setTimeout(()=> hideErrorMessage(),5000);
    }

    function hideErrorMessage(){
        errorMessage.classList.remove('show');
    }

    function shakeForm(){
        const container=document.querySelector('.login-container');
        container.style.animation='shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)';
        setTimeout(()=> container.style.animation='',600);
    }

    // Shake CSS dinamicamente
    const shakeAnimation = document.createElement('style');
    shakeAnimation.textContent='@keyframes shake{10%,90%{transform:translate3d(-1px,0,0);}20%,80%{transform:translate3d(2px,0,0);}30%,50%,70%{transform:translate3d(-4px,0,0);}40%,60%{transform:translate3d(4px,0,0);}}';
    document.head.appendChild(shakeAnimation);

    // Parallax
    document.addEventListener('mousemove', e=>{
        const container=document.querySelector('.login-container');
        const x=(e.clientX/window.innerWidth)*10;
        const y=(e.clientY/window.innerHeight)*10;
        container.style.transform=`translate(${x}px, ${y}px)`;
    });

    if(localStorage.getItem('droneDeliveryAuth')==='true'){
        console.log('Usuário já autenticado, redirecionando...');
        // window.location.href='index.html'; // descomente se quiser auto redirect
    }
});
