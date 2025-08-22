import "./Login.css";
import { useState } from "react";

function Login () {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin () {
        const user = {"email": email, "password": password};

        const response = await fetch('/users/login', {
            method: "POST",
            body: JSON.stringify(user),
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            console.log(response);
            window.location.href = "/";
        }

        if (!response.ok) {
            setError("Incorrect Username Or Password!");
        }

    }

    return (
        <>
            <div className="rootComponent">
                <div className="loginPanel">
                    <div className="title">
                        <h1 className="pix">Pix</h1>
                        <h1 className="gram">Gram</h1>
                    </div>

                    <div className="loginForm">
                        <h2>Login</h2>
                        <input type="email" placeholder="Email" onChange={(e) => { setEmail(e.target.value); }} required />
                        <input type="password" placeholder="Password" onChange={(e) => { setPassword(e.target.value); }} required />
                        <button onClick={handleLogin}>Login</button>
                    </div>

                    <div className="error">
                        {error && <p className="errorMessage">{error}</p>}
                    </div>

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