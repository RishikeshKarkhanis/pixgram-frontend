import "./Login.css";

function Login () {

    return (
        <>
            <div className="rootComponent">
                <div className="loginPanel">
                    <div className="title">
                        <h1 className="pix">Pix</h1>
                        <h1 className="gram">Gram</h1>
                    </div>
                    <form className="loginForm">
                        <h2>Login</h2>
                        <input type="email" placeholder="Email" required />
                        <input type="password" placeholder="Password" required />
                        <button type="submit">Login</button>
                    </form>
                    <div className="loginSwitch">
                        <p>New To PixGram? : </p>
                        <a href="/register">Register</a>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;