import React from "react";
import '../Main.css';
import Button from "../common_components/Button.js";
import NumberInput from "../common_components/NumberInput.js";
import ConfigChecker from "../engine/ConfigChecker.js";

class RoomsPage extends React.Component {
	
	constructor(props) {
	    super(props);
	    this.state = {
			showCreateForm: false, 
			showFilterForm: false, 
			rooms: [], 
			current_room: null,
			active_tab: "rooms"
		};
		
		const _this = this;
		fetch('/api/rooms', {
			headers: {'Accept': 'application/json'}
		}).then(
			function(response) {
				if (response.status != 200) {
					console.log("Не удалось загрузить комнаты");
					return;
				}
				response.json().then(
					(data) => {_this.setState({rooms: data});});
			}
		);
		fetch('/api/rooms/current', {
			headers: {'Accept': 'application/json'}
		}).then(
			function(response) {
				if (response.status != 200) {
					console.log("Не удалось загрузить текущую комнату");
					return;
				}
				response.json().then(
					(data) => {_this.setState({current_room: data});});
			}
		);
	}
	
	render() {
		/*
		const rooms = [
			{id: 1, name:'roomA', description: 'it is first room', population: 11, max_population: 15, favorite: false, creator:'Vasya', status: "Ожидание"},
			{id: 2, name:'roomB', description: 'it is second room', population: 2, max_population: 10, favorite: true, creator:'Petya', status: "Игра началась"},
			{id: 3, name:'roomC', description: 'it is a third room', population: 2, max_population: 5, favorite: false, creator:'Sasha', status: "Игра завершена"}
		];
		*/
		
		const listRooms = this.state.rooms
		.filter((room) => !this.state.current_room || room.id !== this.state.current_room.id)
		.map((room) =>
		  <Room name={room.name} 
				creator={room.creator}
				description={room.description} 
				status={room.status}
				population={room.population} 
				max_population={room.max_population}
				favorite={room.favorite}
				key={room.id}
				id={room.id} 
				current={false}>
				</Room>);
		
		return <div className="flex-1 flex flex-col">
					<div className = "flex">
						<button className = {"grow hover:bg-gray-400 transition-colors duration-300 text-lg "
							 + ((this.state.active_tab === "rooms")? "bg-gray-400 dark:bg-gray-700" : "bg-gray-300 dark:bg-gray-800")}
							onClick={()=>{this.setState({active_tab: "rooms"});}}>Комнаты</button>
							
						<button className = {"grow hover:bg-gray-400 transition-colors duration-300 text-lg " 
							+ ((this.state.active_tab === "create")? "bg-gray-400 dark:bg-gray-700" : "bg-gray-300 dark:bg-gray-800")}
							onClick={()=>{this.setState({active_tab: "create"});}}>Создать игру</button>
							
						<button className = {"grow hover:bg-gray-400 transition-colors duration-300 text-lg "
							 + ((this.state.active_tab === "archive")? "bg-gray-400 dark:bg-gray-700" : "bg-gray-300 dark:bg-gray-800")}
							onClick={()=>{this.setState({active_tab: "archive"});}}>Архив</button>
					</div>
					
					<div className="flex flex-col items-center" style={(this.state.active_tab !== "rooms")? {display: "none"} : {}}>
						<div className="flex flex-col gap-2 mt-4 mb-4" style={{width:"min(90vw, 960px)"}}>
							<div className="flex gap-2">
								<input type="text" className="grow border-2 border-black bg-gray-100 dark:bg-gray-500"/>
								<Button value={"Найти"}></Button>
							</div>
						</div>
						<div className="flex flex-col gap-4">
							{(this.state.current_room)? <Room name={this.state.current_room.name} 
								creator={this.state.current_room.creator}
								description={this.state.current_room.description} 
								status={this.state.current_room.status}
								population={this.state.current_room.population} 
								max_population={this.state.current_room.max_population}
								favorite={this.state.current_room.favorite}
								id={this.state.current_room.id} 
								exit={() => {this.setState({current_room: null});}} 
								current={true}>
							</Room> : <></>}
							<ul className="flex flex-col gap-1">{listRooms}</ul>
						</div>
					</div>
					<div className="flex flex-col items-center" style={(this.state.active_tab !== "create")? {display: "none"} : {}}>
						<CreateForm></CreateForm>
					</div>
					<div className="flex flex-col items-center" style={(this.state.active_tab !== "archive")? {display: "none"} : {}}>
						<div className="flex flex-col gap-2 mt-4 mb-4" style={{width:"min(90vw, 960px)"}}>
							<div className="flex gap-2">
								<input type="text" className="grow border-2 border-black bg-gray-100 dark:bg-gray-500"/>
								<Button value={"Найти"}></Button>
							</div>
						</div>
					</div>
					
				</div>
    }
}

class Room extends React.Component {
	
	
	constructor(props) {
		super(props);
		this.state = {error: "", show_players: false, players: []};
	}
	
	getPlayers = () => {
		const _this = this;
				
		if (!this.state.show_players) {
			fetch("/api/rooms/players/" + this.props.id, {
				method: "get",
			}).then(
				function(response) {
					
					if (response.status !== 200) {
						console.log("Не удалось загрузить список игроков");
						return;
					}
					
					response.json().then(
						(data) => {_this.setState({players: data});}
					);
				}
			);	
		}
		
		this.setState({show_players: !this.state.show_players});
	}
	
	tryExit = () => {
		let csrf_token = document.getElementById("_csrf").value;
		const _this = this;
		
		fetch("/api/rooms/exit/" + this.props.id, {
			headers: {
				"X-CSRF-TOKEN": csrf_token,
				"Content-Type": "application/x-www-form-urlencoded"
			},
			method: "post",
		}).then(
			function(response) {
				
				console.log(response);
				
				if (response.status !== 200) {
					_this.setState({error: "Не удалось покинуть комнату " +  this.props.id + "."});
					return;
				}
				
				_this.props.exit();
			}
		);
	}
	
	tryEnter = () => {
		let csrf_token = document.getElementById("_csrf").value;
		const _this = this;
		
		fetch("/api/rooms/enter/" + this.props.id, {
			headers: {
				"X-CSRF-TOKEN": csrf_token,
				"Content-Type": "application/x-www-form-urlencoded"
			},
			method: "post",
		}).then(
			function(response) {
				
				if (response.status !== 200) {
					_this.setState({error: "Мест нет."});
					return;
				}
				
				window.location.href = "/public/game/" + _this.props.id;	
			}
		);	
	}
	
	render() {
		let player_list = <div><span>Игроки: </span> {this.state.players.map((player) => 
				<span key={player.username} className = {(player.pindex)? "" : "text-orange-500"}>{player.username}</span>
		)}</div>;
		
		return <li className={"rounded-2xl p-3 flex flex-col gap-2 " + ((this.props.current)? "dark:bg-gray-700 bg-gray-300" : "dark:bg-gray-800 bg-gray-200")} style={{width: "min(50rem, 90vw)"}}>
			<div className = "text-red-500">{this.state.error}</div>
			<div className="flex justify-between p-0">
				<div>
					<div className="font-semibold text-2xl">{this.props.name}</div>
					<div>{' (Создатель ' + this.props.creator + ')'}</div>
				</div>
				<button className="text-4xl" style={{position:"relative", top: "-15px"}}>{this.props.favorite? '★': '☆'}</button>
			</div>
			<div className="break-words max-h-[150px]">{this.props.description}</div>
			<div className="flex justify-end gap-3 text-xl flex-wrap p-0">
				<span className="grow justify-self-end flex align-items">
					<a href="#" onClick = {this.getPlayers} className="bg-gray-300 dark:bg-gray-700 rounded-xl p-1 text-lg">
						Игроки {this.props.population + ' / ' + this.props.max_population}
					</a>
				</span>
				<span>{this.props.status}</span>
				{(this.props.current)? <Button value={"Выйти"} onClick={this.tryExit}></Button> : <div></div>}
				<Button value={"Войти"} onClick={this.tryEnter}></Button>
			</div>
			{(this.state.show_players)? player_list : <></>}
		</li>
    }
}

class CreateForm extends React.Component {

	
	roles = [
		{name: "citizen", value: "Горожанин", default: 1},
		{name: "doctor", value: "Доктор", default: 1},
		{name: "sheriff", value: "Шериф", default: 1},
		{name: "mistress", value: "Любовница", default: 1},
		{name: "tracker", value: "Следопыт", default: 1},
		{name: "medium", value: "Медиум", default: 1},
		{name: "radio_fan", value: "Радиолюбитель", default: 1},
		{name: "fool", value: "Дурак", default: 1},
		{name: "maniac", value: "Маньяк", default: 1},
		{name: "mafia", value: "Мафия", default: 1},
		{name: "don", value: "Дон", default: 1},
		{name: "witch", value: "Ведьма", default: 1},
	];

	
	constructor(props) {
		    super(props);
		    this.state = {showCreateClassic: true, mode: "game", error: ""};
	}
	
	handleSubmit = (event) => {
		event.preventDefault();
		let formData = new FormData(event.target);
		let csrf_token = document.getElementById("_csrf").value;
		let config = null;	
		
		if (!this.state.showCreateClassic) {
			try {
				config = JSON.parse(formData.get(config));
			} catch(err) {
				this.setState({error: "Введенные данные не являются json обьектом."});
				return;
			}
			let checker = ConfigChecker();
			
			if(!checker.checkConfig(config)) {
				this.setState({error: checker.error});
				return;
			}
		} else {
			config = require("../engine/default_room_config.json");
			//config = JSON.parse(JSON.stringify(default_room_config));
			
			config.roles.forEach((role) => {role.count = 0;});
			
			this.roles.forEach((entry) => {
				let role = config.roles.find((role) => role.id === entry.value);
				role.count = Number(formData.get(entry.name));
				formData.delete(entry.name);
			});
			
			formData.set("config", JSON.stringify(config));
		}
		
		let count = 0;
		config.roles.forEach((role) => {count += role.count;});
		formData.set("limit", count);
		formData.set("mode", this.state.mode);
		
		let _this = this;
		fetch("/api/rooms/create", {
			headers: {
				"X-CSRF-TOKEN": csrf_token,
				"Content-Type": "application/x-www-form-urlencoded"
			},
			method: "post",
			body: new URLSearchParams(formData)
		}).then(
			function(response) {
				
				if (response.status !== 200) {
					_this.setState({error: "Количество комнат уже достигло своего лимита."});
					return;
				}
				
				response.text().then(
					function(room_id) {
						window.location.href = "/public/game/" + room_id;	
					}
				);
			}
		);
	}

	
	render() {
		
		let role_list = this.roles.map(
			(role) => <NumberInput key={role.name} name={role.name} text={role.value} value={role.default}></NumberInput>
		);
		
		return 	<div className="flex flex-col justify-center bg-gray-200 dark:bg-gray-800 rounded-xl mt-4" style={{width:"min(100%, 40rem)"}}>
			<div className="flex">
				<button className={"grow hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors duration-300 "
					 + ((this.state.showCreateClassic)? "bg-gray-400 dark:bg-gray-600" : "bg-gray-300 dark:bg-gray-700")} 
						onClick={() => {this.setState({showCreateClassic: true});}} 
						type="button">Классика</button>
				<button className={"grow hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors duration-300 "
					+ ((this.state.showCreateClassic)? "bg-gray-300 dark:bg-gray-700" : "bg-gray-400 dark:bg-gray-600")} 
						onClick={() => {this.setState({showCreateClassic: false});}} 
						type="button">Моды</button>
			</div>
			<form className="flex flex-col flex-wrap gap-4 p-4" onSubmit={this.handleSubmit}>
				<input type="text" name="name" className="w-full border-2 border-black bg-gray-100 dark:bg-gray-500" placeholder="Название"/>
				<textarea name="description"  className="w-full bg-gray-100 dark:bg-gray-500" rows="4" placeholder="Описание"></textarea>
				<fieldset>
					<legend>Режим:</legend>
					<div className="flex">
						<button type="button" className={"grow p-2 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors duration-300 " + 
							((this.state.mode === "game")? "bg-gray-400 dark:bg-gray-600" : "bg-gray-300 dark:bg-gray-700")} 
							onClick={()=>{this.setState({mode:"game"});}}>Игра</button>
							
						<button type="button" className={"grow p-2 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors duration-300 " + 
							((this.state.mode === "dev")? "bg-gray-400 dark:bg-gray-600" : "bg-gray-300 dark:bg-gray-700")} 
							onClick={()=>{this.setState({mode:"dev"});}}>Разработка</button>
					</div>
				</fieldset>
				<div style={(this.state.showCreateClassic)? {} : {display: "none"}}>
					<fieldset>
						<legend>Число ролей:</legend>
						<div className="flex flex-col gap-1">
							{role_list}
						</div>
					</fieldset>
				</div>
				<textarea name="config" rows="10" className="w-full bg-gray-100 dark:bg-gray-500" 
				style={(!this.state.showCreateClassic)? {} : {display: "none"}} 
				placeholder="Конфигурация"></textarea>
				<div className="flex justify-center">
					<label><Button value="Готово"/></label>
					<div className="text-red-500">{this.state.error}</div>
				</div>
			</form>
		</div>
    }
}

export default RoomsPage;