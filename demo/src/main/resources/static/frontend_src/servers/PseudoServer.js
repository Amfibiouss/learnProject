class PseudoServer {
	constructor(onReceiveMessage, onChangeStatus, room_id) {
		this.onReceiveMessage = onReceiveMessage;
		this.onChangeStatus = onChangeStatus;
		this.room_id = room_id;
		this.pindex = 0;
		
		this.cnt_polls = 0;
		this.cnt_messages = 0;
		this.cnt_stages = 1;
		this.channels = [{id: -1, name: "Лобби", canRead: true, canWrite: true}];
		this.polls = [];
		this.stages = [{id: 0, name: "Лобби", messages: []}];
		this.status = "waiting";
	}
	
	start() {
		this.status = "initializing";
		this.onChangeStatus({status: "initializing"});
	}
	
	pause() {
		this.status = "pause";
		this.onChangeStatus({status: "pause"});
	}
	
	unpause(timeout) {
		this.status = "run";
		this.onChangeStatus({status: "run", duration: timeout});
	}
	
	getPolls() {
		var user_polls = [];
		this.polls.forEach((poll) => {
			if (poll.can_vote & (1 << this.pindex)) {
				
				user_polls.push({id: poll.id, 
							name: poll.name, 
							description: poll.description,
							candidates: (poll.self_use)? poll.candidates : 
								poll.candidates.filter((candidate) => candidate.id !== this.pindex),
							min_selection: poll.min_selection,
							max_selection: poll.max_selection
				});
			}
		});
		
		return user_polls;
	}
	
	getChannels() {
		var user_channels = [];
		this.channels.forEach((channel) => {
			user_channels.push({id: channel.id, 
							name: channel.name, 
							canRead: (channel.canRead & (1 << this.pindex)) !== 0,
							canWrite: (channel.canWrite & (1 << this.pindex)) !== 0,
							color: channel.color
						});
		});

		return user_channels;
	}
	
	getInfoForUser() {
		return {status: this.status, 
			stage: {id: this.cnt_stages, 
					name: this.stage}, 
			channels: this.getChannels(), 
			polls: this.getPolls(),
			duration: this.duration};	
	}
	
	initPolls(data) {
		var polls = [];

		data.polls.forEach((poll) => {
			
			polls.push({id: this.cnt_polls++, 
						name: poll.id, 
						description: poll.description,
						candidates: poll.candidates,
						can_vote: poll.can_vote,
						min_selection: poll.min_selection,
						max_selection: poll.max_selection,
						self_use: poll.self_use,
						table: Array(30).fill(0)
			});
		});

		this.polls = polls;
	}
	
	init(data) {
	
		this.initPolls(data);
		
		var channels = [];
		
		data.channels.forEach((channel, index) => {
			channels.push({id: index, 
						name: channel.id, 
						canRead: channel.canRead,
						canWrite: channel.canWrite,
						color: channel.color
			});
		});
		
		this.channels = channels;
		
		this.stages.push({id: this.cnt_stages++, name: data.stage, messages: []});
		this.stage = data.stage;
		this.duration = data.duration;
		this.status = "run";
		
		this.onChangeStatus(this.getInfoForUser());
		
		data.messages.forEach((message, pindex) => {
			if (message != "")
				this.sendMessageFromSystem(message, pindex); 
		});
	}
	
	update(data) {
		
		this.initPolls(data);
		data.channels.forEach((new_channel) => {	
			var old_channel = this.channels.find((channel) => channel.name === new_channel.id)		
			old_channel.canRead = new_channel.canRead;
			old_channel.canWrite = new_channel.canWrite;
		});
			
		if (data.toPast) {
			this.stages.pop();
			this.stages.pop();
		} 
			
		this.stages.push({id: this.cnt_stages++, name: data.stage, messages: []});	
		this.stage = data.stage;
		this.duration = data.duration;
			
		
		if (data.win_fractions.length) {
			this.status = "finished";
		} else {
			this.status = "run";
		}
		
		if (data.toPast) {
			var info = this.getInfoForUser();
			info.toPast = true;
			this.onChangeStatus(info);
		}
		else {
			this.onChangeStatus(this.getInfoForUser());	
		}
			
		data.messages.forEach((message, pindex) => {
			if (message != "")
				this.sendMessageFromSystem(message, pindex); 
		});
	}
	
	toPast(data) {
		data.toPast = true;
		this.update(data);
	}
	
	getPollResults() {
		this.status =  "proccesing";
		this.onChangeStatus({status: "proccesing"});
		var poll_results = [];
		
		this.polls.forEach((poll) => {
			poll_results.push({id: poll.name, table: poll.table});	
		});
		
		return poll_results;
	}
	
	sendVote(id, selected) {
		var poll = this.polls.find((poll) => poll.id === id);
		
		selected.forEach((option) => {
			poll.table[this.pindex] |= 1 << option;
		});
	}
	
	sendMessageFromSystem(text, pindex) {	
		this.cnt_messages++; 
		this.stages.at(-1).messages.push({id: this.cnt_messages, 
								text: text, 
								username: "Система", 
								channel_name: "Система",
								channel_color: "#0000ff",
								date: new Date(),
								canRead: 1 << pindex});

		if (this.pindex === pindex) {
			this.onReceiveMessage({id: this.cnt_messages, 
							text: text, 
							username: "Система", 
							channel_name: "Система",
							channel_color: "#0000ff",
							date: new Date()});
		}
	}
	
	sendMessage(message) {	
		
		this.cnt_messages++; 
		var channel = this.channels.find((channel) => channel.id === message.channel_id);
		
		this.stages.at(-1).messages.push({id: this.cnt_messages, 
								text: message.text, 
								username: this.pindex, 
								channel_name: channel.name,
								channel_color: channel.color,
								date: new Date(),
								canRead: channel.canRead});
		
		this.onReceiveMessage({id: this.cnt_messages, 
							text: message.text, 
							username: this.pindex, 
							channel_name: channel.name,
							channel_color: channel.color,
							date: new Date()});
	}
	
	useMagic(spell, pindex) {
		if (spell === "imperius") {
			console.log("MAGIC " + this.pindex);
			this.pindex = pindex;
			this.onChangeStatus({pindex: this.pindex, polls: this.getPolls(), channels: this.getChannels()});
		}
	}
	
	getMessages() {
		console.log(this.channels);
		console.log(this.stages);
							
		return this.stages.map((stage) => {
			return {id: stage.id, 
					name: stage.name, 
					messages: stage.messages
							.filter((message) => (message.canRead & (1 << this.pindex)))
							.map((message) => {
								return {id: message.id, 
										text: message.text, 
										username: message.username, 
										channel_name: message.channel_name,
										channel_color: message.channel_color,
										date: message.date
									};
								}
							)	
			};
		});
	}
}

export default PseudoServer;