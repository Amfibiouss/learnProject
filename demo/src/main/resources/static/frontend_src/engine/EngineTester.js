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
	
	no_effect(effect_id) {
		this.actions.push({type: "no_effect", effect_id: effect_id});
		return this;
	}
	
	effect(effect_id) {
		this.actions.push({type: "effect", effect_id: effect_id});
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
			console.log("Роли \"" + player_role + "\" не существует!");
			return null;
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
			
			this.players.forEach((player) => {
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
								
								if(!poll_state.candidates.find((candidate) => (candidate.id === action.target.pindex)))
									throw new Error("Ошибка, игрок " + player.name + " почему-то не может использовать способность " + action.poll_id + "на игроке " + action.target.name);
									
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
								throw new Error("Ошибка, игрок " + player.name + " почему-то может использовать способность " + action.poll_id + "на игроке " + action.target.name);
							}
							
							break;						
						
						case "no_effect":
							if (this.engine.state.effects[player.pindex].find((effect) => effect.id === action.effect_id)) {
								throw new Error("Ошибка, у игрока " + player.name + " эффект " + action.effect_id);
							}
							break;
						
						case "effect":
							if (!this.engine.state.effects[player.pindex].find((effect) => effect.id === action.effect_id)) {
								throw new Error("Ошибка, у игрока  " + player.name + " нету эффекта " + action.effect_id);
							}
							break;
							
						case "message":
							//console.log(data.messages[player.pindex]);
							//console.log(action.pattern);
							if (!data.messages[player.pindex].match(action.pattern)) {
								throw new Error("Ошибка, у игрока  " + player.name + " нет сообщения " + action.pattern);
							}
							break;
							
						case "win":
						case "lose":
							throw new Error("Игра еще не закончена");
					}
				}
			});
			
			
			data = this.engine.update(poll_results);
			if (data.win_fractions.length > 0) {
				this.players.forEach((player) => {
					while (player.actions.length > 0) {
						var action = player.actions.pop();
						switch(action.type) {
							case "win":
								if (!data.win_fractions.includes(this.engine.state.fractions[player.pindex]))
									throw new Error("Ошибка, игрок " + player.name + " не победил, хотя должен");
								break;
								
							case "lose":
								if (data.win_fractions.includes(this.engine.state.fractions[player.pindex]))
									throw new Error("Ошибка, игрок " + player.name + " не проиграл, хотя должен");
								break;
								
							default:
								throw new Error("Игра окончена");
						}
					}
				});
				
				break;
			}
		}
	}
}

export default EngineTester;