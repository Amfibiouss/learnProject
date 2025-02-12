import Engine from "./Engine.js";

class Player {
	
	constructor(name, role) {
		this.role = role
		this.actions = [];
		this.pindex = -1;
		this.name = name;
	}
	
	toString() {
		return "Игрок #" + this.pindex;
	}
	
	next() {
		this.actions.push({type: "next"});
		return this;
	}
	
	vote(poll_id, player) {
		this.actions.push({type: "vote", poll_id: poll_id, target: player});
		return this;
	}
	
	no_vote(poll_id, player) {
		this.actions.push({type: "no_vote", poll_id: poll_id, target: player});
		return this;
	}
	
	no_status(status_id) {
		this.actions.push({type: "no_status", status_id: status_id});
		return this;
	}
	
	status(status_id) {
		this.actions.push({type: "status", status_id: status_id});
		return this;
	}
	
	can_read(channel_id) {
		this.actions.push({type: "can_read", channel_id: channel_id});
		return this;
	}
	
	can_write(channel_id) {
		this.actions.push({type: "can_write", channel_id: channel_id});
		return this;
	}
	
	message(pattern) {
		this.actions.push({type: "message", pattern: pattern});
		return this;
	}
	
	lose() {
		this.actions.push({type: "lose"});
		return this;
	}
	
	win() {
		this.actions.push({type: "win"});
		return this;
	}
}

class EngineTester {
	
	constructor() {
		this.engine = new Engine();
		this.config = require("./default_room_config.json");
		this.config.roles.forEach((role) => {role.count = 0;});
		this.players = [];
	}
	
	createPlayer(name, player_role) {
		var role = this.config.roles.find((role) => role.id === player_role);
		
		if (role) {
			role.count++;
			var player = new Player(name, player_role);
			this.players.push(player);
			return player;
		} else {
			throw new Error("Роли \"" + player_role + "\" не существует!");
		}
	}
	
	initialize() {
		var data = this.engine.start(this.config);
				
		for (var i = 0; i < this.players.length; i++) {
			var player = this.players.find((player) => (player.pindex === -1 && player.role === this.engine.state.roles[i]));
			player.pindex = i;
		}
		
		return data;
	}
	
	play(initial_data) {
		
		this.players.forEach((player) => {
			player.actions.reverse();
		});
		
		var data = initial_data.initState;
		while(this.players.find((player) => player.actions.length)) {
			
			var poll_results = data.pollStates.map((poll) => {return {id: poll.id, table: new Array(30).fill(0)};});
			
			//console.log(data);
			for (let player of this.players) {
				while (player.actions.length > 0) {
					
					var action = player.actions.pop()
					
					if (action.type === "next") {
						for (let poll_result of poll_results) {
							let poll = initial_data.polls.find((poll) => poll.id === poll_result.id);
							
							for (let i = 0; i < 30; i++) {
								let cnt = 0;
								
								for (let j = 0; j < 30; j++) {
									if (poll_result.table[i] & (1 << j))
										cnt++;
								}
								
								if (cnt != 0 && cnt < poll.min_selection) {
									throw new Error("Ошибка, в голосовании " + poll.id + " не было выбрано минимальное количество вариантов.");
								}
								
								if (cnt > poll.max_selection) {
									throw new Error("Ошибка, в голосовании " + poll.id + " было выбрано слишком много вариантов.");
								}
							}
						}
						break;
					}
					
					let poll, poll_state;
					let channel;
					
					switch(action.type) {
						
						case "vote":	
							let poll_result = poll_results.find((poll_result) => poll_result.id === action.poll_id);
							poll_state = data.pollStates.find((poll) => poll.id === action.poll_id);
							poll = initial_data.polls.find((poll) => poll.id === action.poll_id);
							
							if (!(poll_state.can_vote & (1 << player.pindex))) {
								throw new Error("Ошибка, игрок " + player.name + " почему-то не может использовать способность " + action.poll_id);
							}

							if (action.target) {
								
								if(!poll.self_use && player.pindex === action.target.pindex) 
									throw new Error("Ошибка, игрок " + player.name + " не может использовать на себе способность " + action.poll_id);
								
								//console.log(JSON.stringify(poll_state));
								
								if(!poll_state.candidates.find((candidate) => (candidate.id === action.target.pindex)))
									throw new Error("Ошибка, игрок " + player.name + " почему-то не может использовать способность " + action.poll_id + " на игроке " + action.target.name);
									
								poll_result.table[player.pindex] |= 1 << action.target.pindex;
							}
							
							break;

						case "no_vote":	
							poll_state = data.pollStates.find((poll) => poll.id === action.poll_id);
							poll = initial_data.polls.find((poll) => poll.id === action.poll_id);
							
							if ((poll_state.can_vote & (1 << player.pindex))) {
								throw new Error("Ошибка, игрок " + player.name + " почему-то может использовать способность " + action.poll_id);
							}
							
							if (action.target && (poll_state.candidates.find((candidate) => (candidate.id === action.target.pindex)))
								 && !(!poll.self_use && action.target.pindex === player.pindex)) {
								throw new Error("Ошибка, игрок " + player.name + " почему-то может использовать способность " + action.poll_id + " на игроке " + action.target.name);
							}
							
							break;						
						
						case "no_status":
							if (this.engine.state.players[player.pindex].status_count.get(action.status_id)) {
								throw new Error("Ошибка, у игрока " + player.name + " статус " + action.status_id);
							}
							break;
						
						case "status":
							if (!this.engine.state.players[player.pindex].status_count.get(action.status_id)) {
								throw new Error("Ошибка, у игрока  " + player.name + " нету статуса " + action.status_id);
							}
							break;
							
						case "message":
							if (!data.messages[player.pindex].match(action.pattern)) {
								throw new Error("Ошибка, у игрока  " + player.name + " нет сообщения " + action.pattern);
							}
							break;
						
						case "can_read":
							channel = data.channelStates.find((channel) => channel.id === action.channel_id);
							
							if (!((channel.canRead | channel.canXRayRead | channel.canAnonymousRead) & (1 << player.pindex)))
								throw new Error("Ошибка, Игрок " + player.name + " не может читать канал " + action.channel_id);
							
							break;
							
						case "can_write":
							channel = data.channelStates.find((channel) => channel.id === action.channel_id);	
							if (!((channel.canWrite | channel.canXRayWrite | channel.canAnonymousWrite) & (1 << player.pindex)))
								throw new Error("Ошибка, Игрок " + player.name + " не может писать в канал " + action.channel_id);	
						
							break;
							
						case "win":
						case "lose":
							if (!data.finish)
								throw new Error("Игра еще не закончена");
					}
				}
			};
			
			if (data.finish)
				break;
			
			data = this.engine.update(poll_results);
			if (data.finish) {
				for (let player of this.players) {
					while (player.actions.length > 0) {
						var action = player.actions.pop();
						switch(action.type) {
							case "win":
								if (!data.messages[player.pindex].match("Вы победили!"))
									throw new Error("Ошибка, игрок " + player.name + " не победил, хотя должен");
								break;
								
							case "lose":
								if (!data.messages[player.pindex].match("Вы проиграли!"))
									throw new Error("Ошибка, игрок " + player.name + " не проиграл, хотя должен");
								break;
						}
					}
				}
			}
		}
		
	}
}

export default EngineTester;