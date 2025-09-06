import "./Edit.css";
import { useRef, useEffect, useState } from 'react';

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function Edit() {

    const [user, setUser] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [uid, setUid] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [doc, setDoc] = useState('');
    const [bio, setBio] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const response = await fetch("/users/currentUser");
            const json = await response.json();

            if (!response.ok) {
                window.location.href = "/login";
            }

            setUser(json);
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

    const handleDelete = async () => {
        window.location.href = "/delete_user";
    }

    const handleUpdate = async () => {
        const user = {
            "email": email,
            "password": password,
            "username": username,
            "profilePicture": profilePicture,
            "bio": bio
        };
        const response = await fetch("/users/update/" + uid, {
            method: 'PUT',
            body: JSON.stringify(user),
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            setEmail(data.email);
            setPassword(data.password);
            setBio(data.bio)
            setProfilePicture(data.profilePicture);
            setUsername(data.username);
        }

        if (!response.ok) {
            alert("Not OK!")
        }
    }

    const handleImageUpload = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        console.log("Selected file:", file);
        setLoading(true);
        const storageRef = ref(storage, `${username}/Profile Pictures/${username}`);

        await uploadBytes(storageRef, file);

        const url = await getDownloadURL(storageRef);

        setProfilePicture(url);
        setLoading(false);

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
                            <button
                                style={{ backgroundImage: "url(" + `${profilePicture}` + ")" }}
                                onClick={handleImageUpload}
                                className="dp">{loading ? "Uploading..." : "Click To Change Profile Picture"}
                            </button>
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
                        </div>
                        <div className="right">
                            <div className="entries">
                                <div className="entry">
                                    <label name="uidlabel" htmlFor="uid">UID: </label>
                                    <input type="text" id="uid" name="uid" className="readonly" readOnly value={uid} />
                                </div>
                                <div className="entry">
                                    <label name="doclabel" htmlFor="doc"> Created At: </label>
                                    <input type="text" id="doc" name="doc" className="readonly" readOnly value={doc} />
                                </div>
                                <div className="entry">
                                    <label name="usernamelabel" htmlFor="username">Username: </label>
                                    <input type="email" id="username" name="username" autoComplete="username" className="readonly" readOnly value={username} />
                                </div>
                                <div className="entry">
                                    <label name="emaillabel" htmlFor="email"> Email: </label>
                                    <input type="email" id="email" name="email" autoComplete="email" readOnly className="readonly" value={email} />
                                </div>
                                <div className="entry">
                                    <label name="passwordlabel" htmlFor="password"> Password: </label>
                                    <input type="password" id="password" name="password" onChange={(e) => { setPassword(e.target.value); }} value={password} />
                                </div>
                                <div className="entry">
                                    <label name="biolabel" htmlFor="bio"> Bio: </label>
                                    <input type="text" name="bio" id="bio" onChange={(e) => { setBio(e.target.value); }} value={bio} />
                                </div>
                            </div>
                            <div className="buttonPanel">
                                <button className="update" onClick={handleUpdate}>Update</button>
                                <button className="delete" onClick={handleDelete} style={{ backgroundColor: "red" }}>Delete Account</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default Edit;