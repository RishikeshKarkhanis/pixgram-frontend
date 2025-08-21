import "./Register.css";
import { useRef, useState } from "react";


function Register () {
    const fileInputRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
  );

    const handleImageUpload = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log("Selected file:", file);
            setImageSrc(URL.createObjectURL(file));
        }
    };

    return (
        <>
            <div className="rootComponent">
                <div className="registerPanel">
                    <div className="title">
                        <h1 className="pix">Pix</h1>
                        <h1 className="gram">Gram</h1>
                    </div>
                    <form className="registerForm">
                        <h2>Register</h2>
                        <img className="image" srcSet={imageSrc} onClick={handleImageUpload} />
                        <input type="text" placeholder="Username" required />
                        <input type="email" placeholder="Email" required />
                        <input type="password" placeholder="Password" required />
                        <button type="submit">Register</button>
                    </form>
                    <div className="hiddenFile">
                        <input
                            type="file"
                            id="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            ref={fileInputRef} 
                            style={{display:"none"}} 
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