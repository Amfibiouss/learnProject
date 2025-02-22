import React from "react";
import '../Main.css';
import Button from "../common_components/Button.js";
import Pagination from "../common_components/Pagination.js";
import NumberInput from "../common_components/NumberInput.js";
import ConfigChecker from "../engine/ConfigChecker.js";

class RoomsPage extends React.Component {
	
	constructor(props) {
	    super(props);
	    this.state = {
			showCreateForm: false, 
			showFilterForm: false, 
			rooms: [], 
			count: 0,
			current_room: null,
			active_tab: "rooms"
		};
		
		this.loadRooms(1);
		
		fetch('/api/rooms/current', {
			headers: {'Accept': 'application/json'}
		}).then(
			(response) => {
				if (response.status != 200) {
					console.log("Не удалось загрузить текущую комнату");
					return;
				}
				response.json().then(
					(data) => {this.setState({current_room: data});});
			}
		);
	}
	
	loadRooms = (index) => {
		fetch('/api/rooms?' + new URLSearchParams({start: index}), {
			headers: {'Accept': 'application/json'}
		}).then(
			(response) => {
				if (response.status != 200) {
					console.log("Не удалось загрузить комнаты");
					return;
				}
				response.json().then(
					(data) => {
						this.setState({
							rooms: data.rooms, 
							count: Math.max(this.state.count, data.count)	
						});
					}
				);
			}
		);
	}
	
	render() {
		const room_list = this.state.rooms
		.filter((room) => !this.state.current_room || room.id !== this.state.current_room.id)
		.map((room) =>
		  <Room name={room.name} 
				creator={room.creator}
				description={room.description} 
				status={room.status}
				population={room.population} 
				max_population={room.max_population}
				key={room.id}
				id={room.id} 
				current={false}>
				</Room>);
		
		return <div className="flex-1 flex flex-col">
				<div className = "flex">
					<button className = {"grow transition-colors duration-300 text-lg "
						 + ((this.state.active_tab === "rooms")? "dark:bg-gray-950" : "bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 hover:bg-gray-400")}
						onClick={()=>{this.setState({active_tab: "rooms"});}}>Комнаты</button>
						
					<button className = {"grow transition-colors duration-300 text-lg " 
						+ ((this.state.active_tab === "create")? "dark:bg-gray-950" : "bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 hover:bg-gray-400")}
						onClick={()=>{this.setState({active_tab: "create"});}}>Создать игру</button>
						
					<button className = {"grow transition-colors duration-300 text-lg "
						 + ((this.state.active_tab === "archive")? "dark:bg-gray-950" : "bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 hover:bg-gray-400")}
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
							id={this.state.current_room.id} 
							exit={() => {this.setState({current_room: null});}} 
							current={true}>
						</Room> : <></>}
						<ul className="flex flex-col gap-1">{room_list}</ul>
					</div>
					<Pagination changePage={this.loadRooms} count={this.state.count}></Pagination>
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
	
	statuses = [
		{key: "waiting", value: "ожидание"},
		{key: "initializing", value: "идет игра"},
		{key: "run", value: "идет игра"},
		{key: "processing", value: "идет игра"},
		{key: "pause", value: "идет игра"},
		{key: "finished", value: "игра завершена"},
		{key: "closed", value: "игра закрыта"},
	]
	
	constructor(props) {
		super(props);
		this.state = {
			error: null, 
			show_players: false, 
			players: [],
			revealDescription: false
		};
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
		let player_list = <div><span>Игроки: </span> {this.state.players.filter((player) => player.username).map((player, index) => 
				<span key={player.username} className = {(player.pindex)? "" : "text-orange-500"}>{(index? ", " : "") + player.username}</span>
		)}</div>;
		
		let description = <>{this.props.description}</>
		if (this.props.description.length > 150) {		
			if (!this.state.revealDescription) {
				let prefix = this.props.description.substr(0, 140) + ".....";
				description = <>{prefix}<a href="#" onClick = {() => {this.setState({revealDescription: true});}}> [Раскрыть]</a></>; 
			} else {
				description = <>{this.props.description}<a href="#" onClick = {() => {this.setState({revealDescription: false});}}> [Свернуть]</a></>; 
			}
		}
		
		return <li className={"rounded-2xl px-3 py-1 flex flex-col gap-2 " + ((this.props.current)? "dark:bg-gray-700 bg-gray-300" : "dark:bg-gray-800 bg-gray-200")} style={{width: "min(50rem, 90vw)"}}>
			{this.state.error? <div className = "text-red-500">{this.state.error}</div> : <></>}
			<div className="flex gap-2 p-0">
				<span className="font-semibold text-2xl">{this.props.name}</span>
				<span className="flex items-center">{' (Создатель ' + this.props.creator + ')'}</span>
			</div>
			<div className="break-words max-h-[150px]">{description}</div>
			<div className="flex justify-end gap-3 text-xl flex-wrap p-0">
				<span className="grow justify-self-end flex align-items">
					<a href="#" onClick = {this.getPlayers} className="bg-gray-300 dark:bg-gray-700 rounded-xl px-2 py-1 text-lg h-fit">
						Игроки {this.props.population + ' / ' + this.props.max_population}
					</a>
				</span>
				<span>{this.statuses.find(item => item.key === this.props.status).value}</span>
				{(this.props.current)? <Button value={"Выйти"} onClick={this.tryExit}></Button> : <div></div>}
				<Button value={"Войти"} onClick={this.tryEnter}></Button>
			</div>
			{(this.state.show_players)? player_list : <></>}
		</li>
    }
}

class CreateForm extends React.Component {

	
	roles = [
		{name: "citizen", fraction: "city", value: "Горожанин", default: 1},
		{name: "doctor", fraction: "city", value: "Доктор", default: 1},
		{name: "sheriff", fraction: "city", value: "Шериф", default: 1},
		{name: "mistress", fraction: "city", value: "Любовница", default: 1},
		{name: "tracker", fraction: "city", value: "Следопыт", default: 1},
		{name: "medium", fraction: "city", value: "Медиум", default: 1},
		{name: "radio_fan", fraction: "city", value: "Радиолюбитель", default: 1},
		{name: "vigilante", fraction: "city", value: "Вигилант", default: 1},
		{name: "fool", fraction: "neutral", value: "Дурак", default: 1},
		{name: "maniac", fraction: "neutral", value: "Маньяк", default: 1},
		{name: "witch", fraction: "neutral", value: "Ведьма", default: 1},
		{name: "mafia", fraction: "mafia", value: "Мафия", default: 1},
		{name: "don", fraction: "mafia", value: "Дон", default: 1},
		{name: "evil_personality", fraction: "mafia", value: "Злая личность", default: 1}
	];

	
	constructor(props) {
	    super(props);
	    this.state = {
			showCreateClassic: true,
			mode: "game",
			adminRole: true, 
			error: ""
		};
	}
	
	handleSubmit = (event) => {
		event.preventDefault();
		let formData = new FormData(event.target);
		let csrf_token = document.getElementById("_csrf").value;
		let config = null;	
		
		if (!this.state.showCreateClassic) {
			
			try {
				config = JSON.parse(formData.get("config"));
			} catch(err) {
				this.setState({error: "Введенные данные не являются json обьектом."});
				return;
			}
			let config_room_props = JSON.parse(document.getElementById("config_room_props").value);
			let checker = new ConfigChecker(config_room_props);
			
			if(!checker.checkConfig(config)) {
				this.setState({error: checker.error});
				return;
			}
		} else {
			config = require("../engine/default_room_config.json");
			//config = JSON.parse(JSON.stringify(default_room_config));
			
			config.roles.forEach((role, index) => {
				if (!this.state.adminRole || index > 0)
					role.count = 0;
			});
			
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
		
		let good_role_list = this.roles
				.filter((role) => role.fraction === "city")
				.map((role) => <NumberInput key={role.name} name={role.name} text={role.value} value={role.default}></NumberInput>);
				
		let bad_role_list = this.roles
				.filter((role) => role.fraction !== "city")
				.map((role) => <NumberInput key={role.name} name={role.name} text={role.value} value={role.default}></NumberInput>);
				
				
		return 	<div className="flex flex-col justify-center bg-gray-200 dark:bg-gray-800 rounded-xl mt-4" style={{width:"min(100%, 40rem)"}}>
			<div className="flex">
				<button className={"grow transition-colors duration-300 "
					 + ((this.state.showCreateClassic)? "bg-gray-200 dark:bg-gray-800" : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600")} 
						onClick={() => {this.setState({showCreateClassic: true});}} 
						type="button">Классика</button>
				<button className={"grow transition-colors duration-300 "
					+ ((this.state.showCreateClassic)? "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600" : "bg-gray-200 dark:bg-gray-800")} 
						onClick={() => {this.setState({showCreateClassic: false});}} 
						type="button">Моды</button>
			</div>
			<form className="flex flex-col flex-wrap gap-4 p-4" onSubmit={this.handleSubmit}>
				<input type="text" name="name" className="w-full border-2 border-black bg-gray-100 dark:bg-gray-500" placeholder="Название"/>
				<textarea name="description"  className="w-full bg-gray-100 dark:bg-gray-500" rows="4" placeholder="Описание"></textarea>
				<div className={"grid grid-cols-[auto_4rem_1fr] gap-x-4 overflow-hidden " + (this.state.showCreateClassic? "grid-rows-[auto_auto] gap-y-4" : "grid-rows-[auto_0px]")}>
					<span>Игра</span>
					<button type="button" className = {"flex w-16 h-8 rounded-2xl bg-gray-300 dark:bg-gray-700 "
							+ ((this.state.mode === "dev")? "flex-row-reverse" : "flex-row")}
						onClick={()=>{this.setState({mode: (this.state.mode === "game")? "dev" : "game"});}}>
					
						<div type="button" className="w-8 h-8 rounded-2xl bg-gray-400 dark:bg-gray-600"></div> 
					</button>
					<span>Песочница</span>
					
					<span>Админ роль</span>
					<button type="button" className = {"flex w-16 h-8 rounded-2xl bg-gray-300 dark:bg-gray-700 "
							+ (this.state.adminRole? "flex-row" : "flex-row-reverse")}
						onClick={()=>{this.setState({adminRole: !this.state.adminRole});}}>
					
						<div type="button" className="w-8 h-8 rounded-2xl bg-gray-400 dark:bg-gray-600"></div> 
					</button>
					<span>Равноправие</span>
				</div>
				<div className="flex flex-wrap justify-between" style={(this.state.showCreateClassic)? {} : {display: "none"}}>
					<div className="flex flex-col gap-1">
						{good_role_list}
					</div>
					<div className="flex flex-col gap-1">
						{bad_role_list}
					</div>
				</div>
				<textarea name="config" rows="10" className="w-full bg-gray-100 dark:bg-gray-500" 
				style={(!this.state.showCreateClassic)? {} : {display: "none"}} 
				placeholder="Конфигурация"></textarea>
				<div className="flex flex-col items-center">
					<div><label><Button value="Готово"/></label></div>
					<div className="text-red-500">{this.state.error}</div>
				</div>
			</form>
		</div>
    }
}

export default RoomsPage;