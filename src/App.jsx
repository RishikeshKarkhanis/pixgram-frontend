import { Routes, Route } from "react-router-dom";
import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import Logout from "./pages/Logout/Logout.jsx";
import Edit from "./pages/Edit/Edit.jsx";
import DeleteUser from "./pages/DeleteUser/DeleteUser.jsx"
import './App.css';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/edit" element={<Edit />} />
      <Route path="/delete_user" element={<DeleteUser />} />
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

export default App;
