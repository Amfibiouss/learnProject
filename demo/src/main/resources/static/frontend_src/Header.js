import React from "react";
import './Main.css';

class Header extends React.Component {
	
	constructor(props) {
	    super(props);
	    this.state = {showMenu: false, theme: localStorage.theme};
		document.body.addEventListener('click', (event)=>{this.setState({showMenu: false})});
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
	
	render() {
		
		var username = document.getElementById("username").value;
		
    	return <div className="flex-none flex justify-center bg-gray-300 dark:bg-gray-800 gap-3 flex-wrap">
			<a href="/public/rooms" className="max-h-10"><span className="text-3xl font-bold">FFFFFORUM 2.0</span></a>
			<div className="flex gap-2 items-center text-lg max-h-10 relative" 
				onClick={(event)=>{this.setState({showMenu: !this.state.showMenu}); event.stopPropagation();}}>
				
				<button>				
					<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" className="h-8 w-8">
					  <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
					</svg>
				</button>
				
				{!this.state.showMenu? (<></>) :  
					(<div onClick={(event)=>{event.stopPropagation();}} 
				className="bg-gray-400 dark:bg-gray-700 absolute top-[2rem] right-0 flex flex-col items-center p-3 rounded-md z-50 text-xl gap-1 min-w-[150px]">
					<span className={"text-lg " + ((username === "")? "" : "mb-5")}>{username}</span>
					<a href="/public/profile">Аккаунт</a>
					<a href="/public/rules">Правила</a>
					<a href="/public/logout">Выход</a>
				</div>)}
			</div>
			<button onClick={this.changeTheme}>
				{(this.state.theme === "dark")?
				<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" className="h-8 w-8">
				  <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278M4.858 1.311A7.27 7.27 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.32 7.32 0 0 0 5.205-2.162q-.506.063-1.029.063c-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286"/>
				</svg> :
				<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" className="h-8 w-8">
				  <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
				</svg>}				
			</button>
		</div>;
  	}
}

export default Header;