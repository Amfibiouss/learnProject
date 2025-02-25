import React from "react";
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './Header.js';
import Footer from './Footer.js';
import LoginPage from './pages/LoginPage.js';
import RegistrationPage from './pages/RegistrationPage.js';
import RoomsPage from './pages/RoomsPage.js';
import GamePage from './pages/GamePage.js';
import './Main.css';

class App extends React.Component {

	render() {
		return <div className="flex flex-col min-h-screen p-0 dark:text-white dark:bg-gray-950">
			<Header></Header>
			<BrowserRouter>
				<Routes>
					<Route path="login" element={<LoginPage />} />
					<Route path="public/registration" element={<RegistrationPage />} />
					<Route path="public/rooms" element={<RoomsPage />} />
					<Route path="public/game/:room_id" element={<GamePage />} />
					<Route path="public/sandbox" element={<GamePage />} />
				</Routes>
			</BrowserRouter>
			<Footer></Footer>
		</div>
    }
}

createRoot(document.getElementById("react")).render(<App />);