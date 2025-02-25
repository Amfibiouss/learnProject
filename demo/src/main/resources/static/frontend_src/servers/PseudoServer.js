import ConfigChecker from "../engine/ConfigChecker.js";

class PseudoServer {
	
	constructor(onReceiveMessage, 
				onChangeStatus, 
				onChangeState, 
				onChangePlayer,
				onChangePoll,
				loadStateAndMessages, 
				loadInitialInfo,
				room_id) {
					
		this.onReceiveMessage = onReceiveMessage;
		this.onChangeState = onChangeState;
		this.onChangeStatus = onChangeStatus;
		this.onChangePlayer = onChangePlayer;
		this.onChangePoll = onChangePoll;
		this.loadStateAndMessages = loadStateAndMessages;
		this.room_id = room_id;
		setTimeout(loadInitialInfo, 100)
		
		this.username = document.getElementById("username").value;
		this.playerCount = Number(document.getElementById("players_limit").value);
		this.polls = new Map();
		this.channels = new Map();
		this.messages = [];
		
		this.status = "waiting";
		this.duration = -1;
		this.date = new Date();
		this.pindex = 0;
		this.version = 1;
		this.player_version = 1;
		this.currentStage = "Начало";
		
		this.channels.set("Лобби", {
			id: "Лобби",
			canXRayRead: (1 << this.playerCount) - 1,
			canRead: 0,
			canAnonymousRead: 0,
			color: "#ffa500",
			players: Array(this.playerCount).fill().map((_, index) => (
				{
					id: index,
					canWrite: true, 
					canXRayWrite: false, 
					canAnonymousWrite: false,
					tongueControlledBy: index
				}
			))
		});
		
		this.channels.set("Система", {
			id: "Система",
			canXRayRead: (1 << this.playerCount) - 1,
			canRead: 0,
			canAnonymousRead: 0,
			color: "#0000ff",
			players: Array(this.playerCount).fill().map((_, index) => (
				{
					id: index,
					canWrite: false, 
					canXRayWrite: false, 
					canAnonymousWrite: false,
					tongueControlledBy: index
				}
			))
		});
	}
	
	sendVote(data, onSuccess, onError) {

		let poll = this.polls.get(data.pollName);
		let voter = poll.players.find(item => (item.id === data.controlledPindex));
		
		if (voter.controlledBy !== data.pindex) {
			console.log("У Игрока " + data.pindex + " нет разрешения голосовать в опросе " + pollName + " от лица Игрока " + data.controlledPindex);
			onError();
		}		
		
		let names = "";
		for (const candidate of data.selected) {
			let target = poll.players.find(item => (item.id === candidate))
			target.inVotes |= 1 << voter.id;
			voter.outVotes |= 1 << target.id;
			
			if (names !== "")
				names += ", ";
				
			names += "Игрок #" + candidate;
		}
		
		if (poll.channel) {
			let new_message = {
				id: this.messages.length,
				channel: this.channels.get("Система"),
				username: this.username,
				stage: data.stage,
				pindex: -1,
				canRead: 0,
				canXRayRead: poll.channel.canRead | poll.channel.canXRayRead,
				canAnonymousRead: 0,
				XRayMessage: false,
				AnonymousMessage: false,
				date: new Date(),
				text: "Игрок #" + data.controlledPindex + " проголосовал за " + names + " в \"" + data.pollName + "\"",
			};
			
			this.messages.push(new_message);
			
			let output_message = this.#getOutputMessage(new_message, data.pindex);
					
			if (output_message)
				this.onReceiveMessage(output_message);
		}
		
		for (const candidate of data.selected) {
			let target = poll.players.find(item => (item.id === candidate))
			this.onChangePoll([{
				pollName: data.pollName,
				stage: data.stage,
				candidateId: candidate,
				votes: this.#bitCount(target.inVotes)
			}]);
		}
		
		onSuccess();
	}
	
	#getOutputMessage(message, pindex) {
		
		let output_message = {
			id: message.id,
			text: message.text,
			channel_name: message.channel.id,
			channel_color: message.channel.color,
			stage: message.stage,
			date: message.date	
		};
		
		if (message.channel.id === "Система") {
			
			if ((message.canRead | message.canAnonymousRead | message.canXRayRead) & (1 << pindex)) {
				output_message.username = "Система";
				output_message.imageText = "";
				return output_message;	
			}
			
			return null;
		}
		
		if ((message.canXRayRead & (1 << pindex)) || (((message.canRead | message.canAnonymousRead) & (1 << pindex)) && message.XRayMessage)) {
			output_message.username = message.username;
			output_message.imageText = "";
			return output_message;
		} 
		
		if ((message.canAnonymousRead & (1 << pindex)) || ((message.canRead & (1 << pindex)) && message.AnonymousMessage)) {
			output_message.username = "Неизвестный";
			output_message.imageText = "?";
			return output_message;
		}
		
		if (message.canRead & (1 << pindex)) {
			output_message.username = "Игрок #" + message.pindex;
			output_message.imageText = String(message.pindex);
			return output_message;
		}
		
		return null;
	}
	
	sendMessage(data, onSuccess, onError) {	
		
		let channel = this.channels.get(data.channelName);
		let channel_player = channel.players[data.controlledPindex];
		
		if ((channel_player.canXRayWrite | channel_player.canWrite | channel_player.canAnonymousWrite) === false) {
			console.log("У Игрока " + data.pindex + " нет разрешения писать в канал " + channelName);
			onError();
			return;
		}
		
		if (channel_player.tongueControlledBy !== data.pindex) {
			console.log("У Игрока " + data.pindex + " нет разрешения писать в канал " + channelName + " от лица Игрока " + data.controlledPindex);
			onError();
			return;
		}
		
		let new_message = {
			id: this.messages.length,
			channel: channel,
			username: this.username,
			stage: data.stage,
			pindex: data.controlledPindex,
			canRead: channel.canRead,
			canXRayRead: channel.canXRayRead,
			canAnonymousRead: channel.canAnonymousRead,
			XRayMessage: channel_player.canXRayWrite,
			AnonymousMessage: channel_player.canAnonymousWrite & !channel_player.canWrite & !channel_player.canXRayWrite,
			date: new Date(),
			text: data.text,
		};
		
		this.messages.push(new_message);
		
		let output_message = this.#getOutputMessage(new_message, data.pindex);
		
		if (output_message)
			this.onReceiveMessage(output_message);
		
		onSuccess();
	}
	
	getMessages(pindex, onComplete) {
		let messages = this.messages.map(message => this.#getOutputMessage(message, pindex)).filter(message => message !== null)
		let stages = Object.entries(Object.groupBy(messages, item => item.stage))
						.map(entry => ({name: entry[0], messages: entry[1], rowMessages: []}));
		
		onComplete({
			pindex: pindex,
			stages: stages
		});
	}
	
	#bitCount(num) {
		
		if (!num)
			return 0;
		
		let count = 0;
		while(num !== 0) {
			num = (num & (num - 1));
			count++;
		}
		
		return count;
	}

	#getPolls() {
		let output_polls = [];
		
		if (this.status === "finished")
			return [];
		
		for (const poll of this.polls.values()) {
			for (let i = 0; i < this.playerCount; i++) {	
				if (poll.players[i].controlledBy === this.pindex && poll.players[i].canVote) {
					
					output_polls.push({
						name: poll.id,
						candidates: poll.players.map(
							(player, index) => ({
								id: index,
								name: player.name,
								votes: this.#bitCount(player.inVotes),
								blocked: (poll.players[i].outVotes !== 0) || ((poll.players[i].candidates & (1 << index)) === 0),
								selected: (player.inVotes & (1 << i)) !== 0,
							})
						),
						description: poll.description,
						min_selection: poll.minSelection,
						max_selection: poll.maxSelection,
						showVotes: poll.showVotes,
						controlledPindex: i
					})
				}	
			}
		}
		
		return output_polls;
		/*
		private long id;

		private String name;

		private boolean blocked;

		private long votes;

		private boolean selected;
		 */
		
		/*
		private String name;

		private List<DCandidate> candidates;

		private String description;

		private long min_selection;

		private long max_selection;

		private boolean showVotes;

		private short controlledPindex;
		*/
	}
	
	#getChannels() {
		let output_channels = [];
		
		for (const channel of this.channels.values()) {
			let pindexes = [];
			
			for (let i = 0; i < this.playerCount; i++) {
				if (channel.players[i].tongueControlledBy === this.pindex
					 && (channel.players[i].canWrite | channel.players[i].canXRayWrite | channel.players[i].canAnonymousWrite)) {
					pindexes.push(i);
				}	
			}
			
			output_channels.push(
				{
					name: channel.id,
					canRead: (channel.canRead | channel.canXRayRead | channel.canAnonymousRead) & (1 << this.pindex),
					color: channel.color,
					pindexes: pindexes
				}
			);
		}
		
		return output_channels;
	}
		
	#getState() {
		return 	{
			polls: this.#getPolls(),
			channels: this.#getChannels(),
			status: this.status,
			duration: (this.status === "pause" || this.duration === -1)? this.duration : (this.duration - (new Date() - this.date)),
			pindex: this.pindex,
			version: this.version,
			stage: this.currentStage
		};
	}
	
	getState(onComplete) {
		
		onComplete(this.#getState());
	}
	
	start(onComplete) {
		try{
			var config = JSON.parse(localStorage.room_config);
		} catch(err) {
			console.log("Конфигурация не является обьектом json");
			return;
		}

		let config_room_props = JSON.parse(document.getElementById("config_room_props").value);
		let checker = new ConfigChecker(config_room_props);

		if (!checker.checkConfig(config)) {
			console.log("Конфигурация не корректна");
			return;
		}
		
		this.version++;

		this.onChangeStatus("initializing", -1, this.version);
		
		onComplete(config);	
	}
	
	getPollResults(onComplete) {
		
		let poll_results = [];
		
		for (let poll of this.polls.values()) {
			poll_results.push({
				id: poll.id,
				table: poll.players.map(player => player.outVotes)
			});
		}
		
		this.duration = -1;
		this.version++;
		
		this.onChangeStatus("processing", -1, this.version);
		
		onComplete(poll_results);
	}
	
	#setState(data) {
		this.currentStage = data.stage;
		this.status = (data.finish)? "finished" : "run";
		this.duration = data.duration;
		this.date = new Date();
		this.version++;

		for (const channel_state of data.channelStates) {
			let channel = this.channels.get(channel_state.id);

			channel.canRead = channel_state.readers
				.filter(player => player.canRead)
				.reduce((accum, player) => (accum | (1 << player.earsControlledBy)), 0);
				
			channel.canXRayRead = channel_state.readers
				.filter(player => player.canXRayRead)
				.reduce((accum, player) => (accum | (1 << player.earsControlledBy)), 0);
					
			channel.canAnonymousRead = channel_state.readers
				.filter(player => player.canAnonymousRead)
				.reduce((accum, player) => (accum | (1 << player.earsControlledBy)), 0);

			channel.players = channel_state.readers.map(
				(player) => ({
					id: player.id,
					tongueControlledBy: player.tongueControlledBy,
					canWrite: player.canWrite,
					canXRayWrite: player.canXRayWrite,					
					canAnonymousWrite: player.canAnonymousWrite			
				})
			);
		}

		for (const poll_state of data.pollStates) {
			let poll = this.polls.get(poll_state.id);
			
			poll.players = poll_state.candidates.map(
				player => ({
					id: player.id,
					name: player.name,
					controlledBy: player.controlledBy,
					canVote: player.canVote,
					candidates: player.candidates,
					inVotes: 0,
					outVotes: 0
				})
			);
		}
		
		//console.log(JSON.stringify(this.channels.get("Мафия")));
		//console.log(JSON.stringify(this.polls.get("Ночное голосование")));

		for (let i = 0; i < data.messages.length; i++) {
			if (data.messages[i].trim() === "")
				continue;
			
			let new_message = {				
				id: this.messages.length,
				channel: this.channels.get("Система"),
				username: null,
				stage: this.currentStage,
				pindex: -1,
				canXRayRead: 1 << i,
				canRead: 0,
				canAnonymousRead: 0,
				XRayMessage: false,
				AnonymousMessage: false,
				date: new Date(),
				text: data.messages[i]
			};

			this.messages.push(new_message);
			
			if (i === this.pindex) {
				let output_message = this.#getOutputMessage(new_message, this.pindex);
				
				if (output_message)
					this.onReceiveMessage(output_message);
			}
		}
	}
	
	init(data) {
		if (this.status !== "waiting")
			return;
		
		for (const channel of data.channels) {
			let new_channel = {
				id: channel.id,
				color: channel.color
			}
			this.channels.set(channel.id, new_channel);
		}
		
		this.channels.get("Лобби").canXRayRead = 0;
		this.channels.get("Лобби").players.forEach(player => {player.canWrite = false});
		
		for (const poll of data.polls) {
			let new_poll = {
				id: poll.id,
				description: poll.description,
				minSelection: poll.min_selection,
				maxSelection: poll.max_selection,
				channel: this.channels.get(poll.channel),
				showVotes: poll.showVotes
			}
			this.polls.set(poll.id, new_poll);
		}
		
		this.#setState(data.initState);
		
		this.onChangeState(this.#getState());
	}
	
	update(data) {
		if (this.status === "finished")
			return;

		this.#setState(data);
		
		this.onChangeState(this.#getState());
	}
		
	getPlayers(onComplete) {
		let players = [];
		
		for (let i = 0; i < this.playerCount; i++) {
			if (i === 0) {
				players.push({
					username: this.username,
					token: 0,
					version: this.player_version,
					online: true, 
					pindex: this.pindex
				});	
			} else {
				players.push({
					username: null,
					token: i,
					version: 1,
					online: null, 
					pindex: null
				});					
			}
		}
		onComplete(players);
	}	
	
	pause() {
		
		if (this.status !== "run")
			return;
		
		this.status = "pause";
		this.duration = this.duration - (new Date() - this.date);
		this.version++;
		
		this.onChangeStatus("pause", this.duration, this.version);
	}
	
	unpause() {
		
		if (this.status !== "pause")
			return;
		
		this.status = "run";
		this.date = new Date();
		this.version++;
		
		this.onChangeStatus("run", this.duration, this.version);
	}
	
	useMagic(spell, _, pindex) {
		
		if (spell === "imperius") {
			this.pindex = pindex;
			this.player_version++;
			
			this.onChangePlayer({
				username: this.username,
				token: 0,
				version: this.player_version,
				online: true, 
				pindex: this.pindex
			});	
			
			this.loadStateAndMessages({
				username: this.username,
				token: 0,
				version: this.player_version,
				online: true, 
				pindex: this.pindex
			});
		}
	}
	
	tryExit() {
		window.location.href = "/public/rooms";
	}
}

export default PseudoServer;