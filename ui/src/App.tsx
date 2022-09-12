import React, {createContext, useReducer} from 'react';
import './App.css';
import {initialState, reducer} from "./store/auth_reducer";
import {HashRouter as Router, Route, Routes} from "react-router-dom";
import {Login} from "./components/auth/Login";
import {Home} from "./components/Home";
import Navbar from "./components/navbar/Navbar";

export const AuthContext = createContext(null);

export const App = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return <AuthContext.Provider
        value={{
            state,
            dispatch
        }}>
        <Router>
            <Navbar/>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route path="/" element={<Home/>}/>
            </Routes>
        </Router>
    </AuthContext.Provider>
}