import "./Profile.css";
import { useEffect, useState } from 'react';

function Profile() {

    const [user, setUser] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [uid, setUid] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [doc, setDoc] = useState('');
    const [bio, setBio] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const response = await fetch("/users/currentUser");
            const json = await response.json();

            if (!response.ok) {
                window.location.href = "/login";
                console.log(response);
            }

            setUser(json);
            console.log(json);
            if (json && json.profilePicture) {
                setProfilePicture(json.profilePicture);
                setUid(json._id);
                setEmail(json.email);
                setUsername(json.username);
                setDoc(json.createdAt);
                setBio(json.bio);
                setPassword(json.password)
            } else {
                setProfilePicture('default-profile-picture-url'); // Set a default picture if none exists
            }
            console.log("Profile Picture:", json.profilePicture);
            const dp = document.querySelector(".dp");
            dp.style.backgroundImage = "url(" + `${json.profilePicture}` + ")"
        }

        fetchUserData();
    }, []);

    const handleUpdate = async () => {
        const user = {
            "email" : email, 
            "password" : password, 
            "username":username, 
            "profilePicture":profilePicture, 
            "bio":bio
        };
        const response = await fetch("/users/update/" + uid, {
            method:'PUT',
            body:JSON.stringify(user),
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            setEmail(data.email);
            setPassword(data.password);
            setBio(data.bio)
            setProfilePicture(data.profilePicture);
            setUsername(data.username);
            console.log(user);
            
        }

        if (!response.ok) {
            alert("Not OK!")
        }
    }

    return (
        <>
            <div className="rootContainer">
                <div className="profilePanel">
                    <div className="top">
                        <a href="/">←</a>
                    </div>

                    <div className="main">
                        <div className="left">
                            <img src={profilePicture} className="dp" alt="Profile Picture" />
                        </div>
                        <div className="right">
                            <div className="entries">
                                <div className="entry">
                                    <label>UID: </label>
                                    <input type="text" name="uid" id="readonly" readOnly value={uid} />
                                </div>
                                <div className="entry">
                                    <label> Created At: </label>
                                    <input type="text" name="doc" id="readonly" readOnly value={doc} />
                                </div>
                                <div className="entry">
                                    <label>Username: </label>
                                    <input type="email" name="uid" id="readonly" readOnly value={username} />
                                </div>
                                <div className="entry">
                                    <label> Email: </label>
                                    <input type="text" name="email" readOnly id="readonly" value={email} />
                                </div>
                                <div className="entry">
                                    <label> Password: </label>
                                    <input type="password" name="password" onChange={(e) => { setPassword(e.target.value); }} value={password} />
                                </div>
                                <div className="entry">
                                    <label> Bio: </label>
                                    <input type="text" name="bio" onChange={(e) => { setBio(e.target.value); }} value={bio} />
                                </div>
                            </div>
                            <div className="buttonPanel">
                                <button className="update" onClick={handleUpdate}>Update</button>
                                <button className="delete" style={{backgroundColor:"red"}}>Delete Account</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default Profile