import React from "react";
import './Main.css';

class Header extends React.Component {
	
	constructor(props) {
	    super(props);
	    this.state = {theme: localStorage.theme};
	}		
	
	changeTheme = () => {
		
		
		if (localStorage.theme === "light") {
			localStorage.theme = "dark";
			document.documentElement.classList.add('dark');
		}
		else {
			localStorage.theme = "light";
			document.documentElement.classList.remove('dark');
		}

		this.setState({theme: localStorage.theme});
	}
	
	onLogout = (event) => {
		event.preventDefault();
		
		let csrf_token = document.getElementById("_csrf").value;
		
		fetch("/logout", {
			headers: {
				"X-CSRF-TOKEN": csrf_token,
			},
			method: "post"
		}).then(
			function(response) {
				
				if (response.status !== 204) {
					_this.setState({error: "Не удалось выйти из аккаунта."});
					return;
				}
				
				window.location.href = "/login";
			}
		);
	}
	
	render() {
		
		var username = document.getElementById("username").value;
		
    	return <div className="flex-none flex justify-between bg-gray-300 dark:bg-gray-800 gap-3 flex-wrap px-2 pb-1">
			
			<div className="flex gap-2">
				<button onClick={this.changeTheme}>
					{(this.state.theme === "dark")?
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" className="h-8 w-8">
					  <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278M4.858 1.311A7.27 7.27 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.32 7.32 0 0 0 5.205-2.162q-.506.063-1.029.063c-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286"/>
					</svg> :
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" className="h-8 w-8">
					  <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
					</svg>}				
				</button>
				<a href="/public/help" className="flex items-center">
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-8 w-8" viewBox="0 0 16 16">
					  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
					  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
					</svg>	
				</a>
			</div>
			<a href="/public/rooms" className="max-h-10"><span className="text-3xl font-bold">FFFFFORUM 2.0</span></a>
			
			{ username? 
			<div className="flex gap-2">
				<span className="flex items-center">{username}</span>
				<form onSubmit = {this.onLogout} className="flex items-center">
					<button>
						<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-8 h-8" viewBox="0 0 16 16">
						  <path d="M8.5 10c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1"/>
						  <path d="M10.828.122A.5.5 0 0 1 11 .5V1h.5A1.5 1.5 0 0 1 13 2.5V15h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V1.5a.5.5 0 0 1 .43-.495l7-1a.5.5 0 0 1 .398.117M11.5 2H11v13h1V2.5a.5.5 0 0 0-.5-.5M4 1.934V15h6V1.077z"/>
						</svg>
					</button>
				</form>
			</div> : <div className="w-16"></div>
			}
		</div>;
  	}
}

export default Header;