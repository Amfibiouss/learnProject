import React from "react";
import '../Main.css';
import Button from "../common_components/Button.js";
import InputText from "../common_components/InputText.js";

class LoginPage extends React.Component {

	handleSubmit = (event) => {
		event.preventDefault();
		var formData = new FormData(event.target);
		var csrf_token = document.getElementById("_csrf").value;
		
		fetch('/login', {
			headers: {
				"X-CSRF-TOKEN": csrf_token,
				"Content-Type": "application/x-www-form-urlencoded"
			},
			method: "post",
			body: new URLSearchParams(formData)
		}).then(
			function(response) {
				window.location.href = response.url;
			}
		);
	}
	
	render() {
		return <div className="flex-1 flex justify-center">
			<form className="flex flex-col gap-2 p-5 bg-gray-300 dark:bg-gray-800 rounded-md h-fit" 
					action="/login" method="post" onSubmit={this.handleSubmit}>
				<div><label>
					<p>Логин</p>
					<InputText name="username" type="text"></InputText>
				</label></div>
				<div><label>
					<p>Пароль</p>
					<InputText name="password" type="password"></InputText>
				</label></div>
				<div><label>
					<input className="border-2 border-black" name="remember-me" type="checkbox" />
					<span> Запомнить</span>
				</label></div>
				<div className="flex justify-center"><Button value="Войти"></Button></div>
				<div><a href="/registration/">Зарегестрироватся</a></div>
			</form>
		</div>
    }
}

export default LoginPage;