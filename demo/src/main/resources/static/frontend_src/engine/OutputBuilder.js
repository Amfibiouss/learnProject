class OutputBuilder {
	
	constructor(config, expressionChecker) {
		this.expressionChecker = expressionChecker;
		this.config = config;
		this.finish = false;
		this.count = this.config.roles.reduce((acc, item) => (acc + item.count), 0);
		this.messages = [];
		
		for (let i = 0; i < this.count; i++)
			this.messages.push([]);
		
		
		this.controlledByMap = new Map();
		for (const ability of this.config.abilities) {
			let arr = [];
			for (let i = 0; i < this.count; i++) {
				arr.push(i);
			}
			this.controlledByMap.set(ability.id, arr);
		}
		
		this.earsControlledByMap = new Map();
		this.tongueControlledByMap = new Map();
		for (const channel of this.config.channels) {
			let arr1 = [], arr2 = [];
			for (let i = 0; i < this.count; i++) {
				arr1.push(i);
				arr2.push(i);
			}
			this.earsControlledByMap.set(channel.id, arr1);
			this.tongueControlledByMap.set(channel.id, arr1);
		}
	}
	
	initChannels() {
		let channels = [];
		this.config.channels.forEach((channel) => {		
			channels.push({id: channel.id, color: channel.color});
		});
		
		return channels;
	}
	
	handleChannels(context) {
		let channelStates = [];
		
		for (const channel of this.config.channels) {
			let reader_list = [];
			
			for (let i = 0; i < this.count; i++) {
				context.user = i;
				
				let can_read = this.expressionChecker.getMaskFromSelector(channel.canRead, context) > 0;
				let can_write = this.expressionChecker.getMaskFromSelector(channel.canWrite, context) > 0;
				let can_anonymous_read =  this.expressionChecker.getMaskFromSelector(channel.canAnonymousRead, context) > 0;
				let can_anonymous_write = this.expressionChecker.getMaskFromSelector(channel.canAnonymousWrite, context) > 0;
					
				reader_list.push({
					id: i, 
					tongueControlledBy: this.tongueControlledByMap.get(channel.id)[i],
					earsControlledBy: this.earsControlledByMap.get(channel.id)[i],
					canRead: can_read, 
					canXRayRead: false,
					canAnonymousRead: can_anonymous_read,
					canWrite: can_write,
					canXRayWrite: false,
					canAnonymousWrite: can_anonymous_write,
					color: channel.color
				});
			}
			
			channelStates.push({id: channel.id, readers: reader_list})
			
			//console.log(channel.id + " " + write_mask + " " + anonymous_write_mask);
		}
		
		return channelStates;
	}
	
	initPolls() {
		let polls = [];
		this.config.abilities.filter(ability => ability.rule !== "start").forEach((ability) => {
			
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
	
	handlePolls(context) {
		let pollStates = [];
		
		this.config.abilities.filter(ability => ability.rule !== "start").forEach((ability) => {
			
			let candidate_list = [];
			
			for (let i = 0; i < this.count; i++) {
				context.user = i;
				let candidate_mask = this.expressionChecker.getMaskFromSelector(ability.candidates, context);
				let canUse = this.expressionChecker.getMaskFromSelector(ability.canUse, context) !== 0;
				
				
				candidate_list.push({
					id: i, 
					name: "Игрок #" + i,
					weight: 1,
					controlledBy: this.controlledByMap.get(ability.id)[i],
					canVote: canUse,
					candidates: candidate_mask
				});
			}

			pollStates.push({
				id: ability.id,
				candidates: candidate_list,
			});
		});
		
		return pollStates;
	}
	
	setTongueControlledBy(target, user, channel_id) {
		if (!channel_id) {
			for (const channel of this.config.channels) {
				this.tongueControlledByMap.get(channel.id)[target] = user;
			}
		} else {
			let channel = this.config.channels.find((item) => item.id === channel_id);
			
			if (!channel)
				return;
			
			this.tongueControlledByMap.get(channel.id)[target] = user;	
		}
	}
	
	setEarsControlledBy(target, user, channel_id) {
		if (!channel_id) {
			for (const channel of this.config.channels) {
				this.earsControlledByMap.get(channel.id)[target] = user;
			}
		} else {
			let channel = this.config.channels.find((item) => item.id === channel_id);
			
			if (!channel)
				return;
			
			this.earsControlledByMap.get(channel.id)[target] = user;	
		}
	}
	
	setControlledBy(target, user, ability_id) {
		
		if (!ability_id) {
			for (const ability of this.config.abilities) {
				this.controlledByMap.get(ability.id)[target] = user;
			}
		} else {
			let ability = this.config.abilities.find((item) => item.id === ability_id);
			
			if (!ability)
				return;
			
			this.controlledByMap.get(ability.id)[target] = user;	
		}
	}
	
	addMessage(pindex, text) {
		this.messages[pindex].push(text + "\n");
	}
	
	setFinish() {
		this.finish = true;
	}
	
	build(context, init) {
			
		for (let i = 0; i < this.count; i++) {
			//this.messages[i].sort();
			this.messages[i] = this.messages[i].join("");
		}
		
		let state = {
			pollStates: (this.finish)? [] : this.handlePolls(context),
			channelStates: this.handleChannels(context),
			messages: this.messages,
			finish: this.finish,
			stage: context.time + " #" + context.day_counter + " @" + context.branch,
			duration: this.config.times.find((time) => time.id === context.time).duration
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