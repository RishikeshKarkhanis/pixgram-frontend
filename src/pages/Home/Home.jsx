import "./Home.css";
import { useEffect, useState } from 'react';

function Home () {

    const [user, setUser] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [isDropActive, setIsDropActive] = useState(false);

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
            if (json._doc && json._doc.profilePicture) {
                setProfilePicture(json._doc.profilePicture);
            } else {
                setProfilePicture('default-profile-picture-url'); // Set a default picture if none exists
            }
            console.log("Profile Picture:", json._doc.profilePicture);
        }

        fetchUserData();
    }, []);

    const handleProfileClick = () =>  {
        const dropdown = document.querySelector('.dropdown');

        if(isDropActive === true) {
            setIsDropActive(false);
            dropdown.style.display = 'none';
        }
        if(isDropActive === false) {
            setIsDropActive(true);
            dropdown.style.display = 'flex';
        }
    }

    return (
        <>
            <div className="navbar">
                <div className="left">
                    <div className="title">
                        <h1 className="pix">Pix</h1>
                        <h1 className="gram">Gram</h1>
                    </div>
                </div>
                <div className="right">
                    <div className="profile">
                        <img src={profilePicture} alt="Profile" onClick={handleProfileClick} className="profile-picture" />
                        <div className="dropdown">
                            <ul>
                                <li><a href="/profile">Profile</a></li>
                                <li><a style={{color:"red", cursor:"pointer"}} href="/logout">Logout</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;