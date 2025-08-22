import "./Register.css";
import { useRef, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase.js";


function Register() {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [profiePic, setProfilePic] = useState(
        "https://firebasestorage.googleapis.com/v0/b/pixgram-469807.firebasestorage.app/o/User%2FProfilePictures%2FDefault%2Fdefault.webp?alt=media&token=fae64a84-57b3-4637-990f-349dd6d91207"
    );
    const [error, setError] = useState("");

    const fileInputRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(
        "https://firebasestorage.googleapis.com/v0/b/pixgram-469807.firebasestorage.app/o/User%2FProfilePictures%2FDefault%2Fdefault.webp?alt=media&token=fae64a84-57b3-4637-990f-349dd6d91207"
    );

    const handleImageUpload = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        console.log("Selected file:", file);

        const storageRef = ref(storage, `User/ProfilePictures/${username}/${file.name}`);

        await uploadBytes(storageRef, file);

        const url = await getDownloadURL(storageRef);

        setImageSrc(url);
    };

    async function handleSubmit() {

        setProfilePic(imageSrc);

        const jsonData = {
            username: username,
            email: email,
            password: password,
            profilePicture: imageSrc
        };

        const response = await fetch('users/register', {
            method: "POST",
            body: JSON.stringify(jsonData),
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            window.location.replace('/login')
        }

        if (!response.ok) {
            setError('User Already Exists!')
        }

    }

    return (
        <>
            <div className="rootComponent">
                <div className="registerPanel">
                    <div className="title">
                        <h1 className="pix">Pix</h1>
                        <h1 className="gram">Gram</h1>
                    </div>
                    <div className="registerForm">
                        <h2>Register</h2>
                        <img className="image" srcSet={imageSrc} onClick={handleImageUpload} />
                        <input type="text" placeholder="Username" required onChange={(e) => { setUsername(e.target.value); }} />
                        <input type="email" placeholder="Email" required onChange={(e) => { setEmail(e.target.value); }} />
                        <input type="password" placeholder="Password" required onChange={(e) => { setPassword(e.target.value); }} />
                        <button onClick={handleSubmit}>Register</button>
                    </div>

                    <div className="error">
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                    </div>

                    <div className="hiddenFile">
                        <input
                            type="file"
                            id="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            style={{ display: "none" }}
                        />
                    </div>
                    <div className="loginSwitch">
                        <p>Already Have An Account? : </p>
                        <a href="/login"> Login</a>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Register;