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
	
	can_vote(poll_id, player, controlled_player) {
		this.actions.push({type: "can_vote", poll_id: poll_id, target: player, controlled_player: controlled_player});
		return this;
	}

	cant_vote(poll_id, player, controlled_player) {
		this.actions.push({type: "cant_vote", poll_id: poll_id, target: player, controlled_player: controlled_player});
		return this;
	}
	
	start_vote(poll_id, player) {
		this.actions.push({type: "start_vote", poll_id: poll_id, target: player});
		return this;
	}
	
	vote(poll_id, player, controlled_player) {
		this.actions.push({type: "vote", poll_id: poll_id, target: player, controlled_player: controlled_player});
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
	
	cant_read(channel_id) {
		this.actions.push({type: "cant_read", channel_id: channel_id});
		return this;
	}

	cant_write(channel_id) {
		this.actions.push({type: "cant_write", channel_id: channel_id});
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
		this.config = JSON.parse(JSON.stringify(require("./default_room_config.json")));
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
		//let data = this.engine.start(this.config);
			
		this.engine.firstPartStart(this.config);
			
		let poll_results = this.config.abilities
							.filter(ability => ability.rule === "start")
							.map(ability => ({id: ability.id, table: new Array(30).fill(0)}));
		
		for (let i = 0; i < this.players.length; i++) {
			let player = this.players.find((player) => (player.pindex === -1 && this.engine.state.status_count[i].has("role/" + player.role)));
			player.pindex = i;
		}
		
		for (let player of this.players) {
			player.actions.reverse();
			
			while (player.actions.length > 0 && player.actions[0].type === "start_vote") {
				let action = player.actions.pop();
				let poll_result = poll_results.find((poll_result) => poll_result.id === action.poll_id);
				poll_result.table[player.pindex] |= 1 << action.target.pindex;
				console.log(action.target.pindex);
			}
			
			player.actions.reverse();
		}
		
		return this.engine.secondPartStart(poll_results);
	}
	
	play(initial_data) {
		
		this.players.forEach((player) => {
			player.actions.reverse();
		});
		
		var data = initial_data.initState;
		while(this.players.find((player) => player.actions.length)) {
			
			//console.log(data);
			
			let poll_results = data.pollStates.map((poll) => {return {id: poll.id, table: new Array(30).fill(0)};});
			
			//console.log(JSON.stringify(data.pollStates.find(item => item.id === "Ночное голосование")));
			for (let player of this.players) {
				while (player.actions.length > 0) {
					
					let action = player.actions.pop();
					
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
					
					let poll, poll_state, voter;
					let channel;
					
					switch(action.type) {
						case "can_vote":
						case "vote":	
							let poll_result = poll_results.find((poll_result) => poll_result.id === action.poll_id);
							poll_state = data.pollStates.find((poll) => poll.id === action.poll_id);
							poll = initial_data.polls.find((poll) => poll.id === action.poll_id);
							
							if (action.controlled_player)
								voter = poll_state.candidates.find((item) => item.id === action.controlled_player.pindex);
							else 
								voter = poll_state.candidates.find((item) => item.id === player.pindex);
							
							if (voter.controlledBy !== player.pindex) {
								throw new Error("Ошибка, игрок " + player.name
									 + " почему-то не может контролировать способность " + action.poll_id
									 + " другого игрока " + ((action.controlled_player)? action.controlled_player.name : player.name));
							}
							
							if (!voter.canVote) {
								throw new Error("Ошибка, игрок " + player.name + " почему-то не может использовать способность " + action.poll_id);
							}

							if (action.target) {

								if(!(voter.candidates & (1 << action.target.pindex)) || !voter.canVote)
									throw new Error("Ошибка, игрок " + player.name + " почему-то не может использовать способность " + action.poll_id + " на игроке " + action.target.name);
									
								if (action.type === "vote")
									poll_result.table[voter.id] |= 1 << action.target.pindex;
							} else {
								if (action.type === "vote") {
									throw new Error("Ошибка, игрок " + player.name + " не выбрал цель для способности " + action.poll_id);
								}
							}
							
							break;

						case "cant_vote":	
							poll_state = data.pollStates.find((poll) => poll.id === action.poll_id);
							poll = initial_data.polls.find((poll) => poll.id === action.poll_id);
							
							if (action.controlled_player)
								voter = poll_state.candidates.find((item) => item.id === action.controlled_player.pindex);
							else 
								voter = poll_state.candidates.find((item) => item.id === player.pindex);

							if (voter.controlledBy != player.pindex)
								break;
							
							if (voter.canVote) {
								throw new Error("Ошибка, игрок " + player.name + " почему-то может использовать способность " + action.poll_id);
							}
							
							if (action.target && voter.canVote && (voter.candidates & (1 << action.target.pindex))) {
								throw new Error("Ошибка, игрок " + player.name + " почему-то может использовать способность " + action.poll_id + " на игроке " + action.target.name);
							}
							
							break;						
						
						case "no_status":
							if (this.engine.state.status_count[player.pindex].get(action.status_id)) {
								throw new Error("Ошибка, у игрока " + player.name + " статус " + action.status_id);
							}
							break;
						
						case "status":
							if (!this.engine.state.status_count[player.pindex].get(action.status_id)) {
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
							
							if (!channel.readers.some(reader => (reader.earsControlledBy === player.pindex 
								&& (reader.canRead || reader.canXRayRead || reader.canAnonymousRead))))
								throw new Error("Ошибка, Игрок " + player.name + " не может читать канал " + action.channel_id);
							
							break;
							
						case "can_write":
							channel = data.channelStates.find((channel) => channel.id === action.channel_id);	
							if (!channel.readers.some(reader => (reader.tongueControlledBy === player.pindex 
								&& (reader.canWrite || reader.canXRayWrite || reader.canAnonymousWrite))))
								throw new Error("Ошибка, Игрок " + player.name + " не может писать в канал " + action.channel_id);	
						
							break;
							
						case "cant_read":
							channel = data.channelStates.find((channel) => channel.id === action.channel_id);
							
							if (channel.readers.some(reader => (reader.earsControlledBy === player.pindex
								 && (reader.canRead || reader.canXRayRead || reader.canAnonymousRead))))
								throw new Error("Ошибка, Игрок " + player.name + " может читать канал " + action.channel_id);
							
							break;
							
						case "cant_write":
							channel = data.channelStates.find((channel) => channel.id === action.channel_id);	
							if (channel.readers.some(reader => (reader.tongueControlledBy === player.pindex
								 && (reader.canWrite || reader.canXRayWrite || reader.canAnonymousWrite))))
								throw new Error("Ошибка, Игрок " + player.name + " может писать в канал " + action.channel_id);	

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
			
			data = this.engine.toFuture(poll_results);
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