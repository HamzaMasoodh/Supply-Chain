import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = ({ setuser }) => {
  const Navigate = useNavigate();
  const [name, setName] = useState();
  const [password, setPassword] = useState();
  const [loader, setLoader] = useState(false);
  const URL = process.env.REACT_APP_URL;

  const handleLogin = (e) => {
    e.preventDefault()

    setLoader(true);
    if (!name || !password) {
      setLoader(false)
      return toast.error("Please fill all the fields!");
    }

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
      "email": name,
      "password": password
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(`${URL}:3006/api/auth/login`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.status) {
          toast.success("Login Successfully!")
          localStorage.setItem('UserData', JSON.stringify(result));
          Navigate("/Home")
          setuser(true)
        }
        else {
          toast.error(result)
          setPassword("")
          setLoader(false)
        }
      })
      .catch((error) => console.log("error", error));
  };

  return (
    <>
      <div className="form-design">
        <div className="form_div">
          <h1 className="loginTitle">Login</h1>
          <form className="form__container" onSubmit={handleLogin}>
            <div className="form__group">
              <input
                type="text"
                id="name"
                className="form__input"
                placeholder=" "
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label htmlFor="name" className="form__label">
                Email:
              </label>
              <span className="form__line"></span>
            </div>
            <div className="form__group">
              <input
                type="password"
                id="user"
                className="form__input"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="user" className="form__label">
                Password:
              </label>
              <span className="form__line"></span>
            </div>
            <button className="form__submit" disabled={loader} >
              {!loader ? <>Login</> : <p>Please Wait...</p>}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
