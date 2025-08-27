import "./Home.css";
import { useEffect, useState } from 'react';

function Home() {

    const [user, setUser] = useState('');
    const [post, setPost] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);
    const [isPDropActive, setIsPDropActive] = useState(false);

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
            } else {
                setProfilePicture('default-profile-picture-url'); // Set a default picture if none exists
            }
            console.log("Profile Picture:", json.profilePicture);
        }

        fetchUserData();
    }, []);

    //Fetch Posts Of People User Follows

    useEffect(() => {
        const fetchPostsData = async () => {
            if (!user || !user._id) return; // guard

            console.log("user id in fetchPostsData:", user._id);

            const response = await fetch("/posts/feed/" + user._id);

            const json = await response.json();

            if (!response.ok) {
                alert("Error Fetching Posts");
                console.log(response);
            }

            setPost(json);
            console.log("Posts Data:", json);
        }

        fetchPostsData();
    }, [user]);

    const handleProfileClick = () => {
        const dropdown = document.querySelector('.dropdown');

        if (isPDropActive === true) {
            setIsPDropActive(false);
            dropdown.style.display = 'none';
        }
        if (isPDropActive === false) {
            setIsPDropActive(true);
            dropdown.style.display = 'flex';
        }
    }

    return (
        <>
            <nav className="navbar">
                <div className="left">
                    <button className="title">
                        <h1 className="pix">Pix</h1>
                        <h1 className="gram">Gram</h1>
                    </button>
                </div>
                <div className="right">
                    <div className="profile">
                        <img srcSet={profilePicture} alt="Profile" onClick={handleProfileClick} className="profile-picture" />
                        <div className="dropdown">
                            <ul>
                                <li><a href="/edit">Profile</a></li>
                                <li><a style={{ color: "red", cursor: "pointer" }} href="/logout">Logout</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="contentPane">
                {post && post.length > 0 ? (
                    post.map((p) => (
                        <div key={p._id} className="post">
                            <div className="postedBy">
                                <img srcSet={p.postedBy.profilePicture} alt="" />
                                <h6>{p.postedBy.username}</h6>
                            </div>
                            <div className="imageContainer">
                                <img srcSet={p.imageUrl} alt="Post" className="post-image" />
                            </div>
                            <div className="captionContainer">
                                <p>{p.caption}</p>
                            </div>
                            <div className="optionContainer">

                                <div className="likeContainer">
                                    <button className="like-button">
                                        <i className="fa-regular fa-heart text-3xl text-red-600"></i>
                                    </button>

                                    <div className="likeCount">
                                        <p>{p.likes}</p>
                                    </div>
                                </div>

                                <div className="commentContainer">
                                    <button className="comment-button">
                                        <i className="fa-regular fa-comment"></i>
                                    </button>

                                    <div className="commentCount">
                                        <p>{p.comments}</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))
                ) : (
                    <p>No posts available.</p>
                )}
            </div>
        </>
    );
}

export default Home;