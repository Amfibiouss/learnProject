class OutputBuilder {
	
	constructor(config, getMaskFromSelector, formatText) {
		this.getMaskFromSelector = getMaskFromSelector;
		this.formatText = formatText;
		this.config = config;
		this.count = 0;
		this.finish = false;
		config.roles.forEach((role) => {this.count += role.count;});
		this.messages = [];
		
		for (let i = 0; i < this.count; i++)
			this.messages.push([]);
	}
	
	toCandidateList(user_mask, candidate_selector) {
		var candidate_list = [];
		
		for (var i = 0; i < this.count; i++) {
			let candidate_mask = this.getMaskFromSelector(this.formatText(candidate_selector, null, i));
			
			candidate_list.push({
				id: i, 
				name: "Игрок #" + i,
				weight: 1,
				alias: i,
				canVote: (user_mask & (1 << i)) != 0,
				candidates: candidate_mask
			});
		}
		
		return candidate_list;
	}
	
	initChannels() {
		let channels = [];
		this.config.channels.forEach((channel) => {		
			channels.push({id: channel.id, color: channel.color});
		});
		
		return channels;
	}
	
	handleChannels(output) {
		let channelStates = [];
		this.config.channels.forEach((channel) => {
			
			let read_mask = this.getMaskFromSelector(channel.canRead);
			let write_mask = this.getMaskFromSelector(channel.canWrite);
			let anonymous_read_mask = this.getMaskFromSelector(channel.canAnonymousRead);
			let anonymous_write_mask = this.getMaskFromSelector(channel.canAnonymousWrite);
			
			channelStates.push({id: channel.id, 
								canRead: read_mask, 
								canXRayRead: 0,
								canAnonymousRead: anonymous_read_mask,
								canWrite: write_mask,
								canXRayWrite: 0,
								canAnonymousWrite: anonymous_write_mask,
								color: channel.color});
		});
		
		return channelStates;
	}
	
	initPolls() {
		let polls = [];
		this.config.abilities.forEach((ability) => {
			
			polls.push({
				id: ability.id, 
				description: ability.description, 
				channel: ability.channel,
				showVotes: ability.showVotes,
				min_selection: 1, 
				max_selection: 1,
				self_use: ability.self_use});
		});
		
		return polls;
	}
	
	handlePolls() {
		let pollStates = [];
		this.config.abilities.forEach((ability) => {
			
			//let candidate_mask = this.getMaskFromSelector(ability.candidates);
			let user_mask = this.getMaskFromSelector(ability.canUse);
			
			pollStates.push({
				id: ability.id,
				candidates: this.toCandidateList(user_mask, ability.candidates),
			});
		});
		
		return pollStates;
	}
	
	addMessage(pindex, text) {
		this.messages[pindex].push(text + "\n");
	}
	
	setFinish() {
		this.finish = true;
	}
	
	build(stage, duration, init) {
		
		for (let i = 0; i < this.count; i++) {
			this.messages[i].sort();
			this.messages[i] = this.messages[i].join();
		}
		
		let state = {
			pollStates: (this.finish)? [] : this.handlePolls(),
			channelStates: this.handleChannels(),
			messages: this.messages,
			finish: this.finish,
			stage: stage,
			duration: duration
		}
		
		if (init) {
			return {
				polls: this.initPolls(),
				channels: this.initChannels(),
				initState: state
			};
		}
		 
		return state;	
	}

}

export default OutputBuilder;