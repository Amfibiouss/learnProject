import ConfigChecker from "./ConfigChecker.js";

class Engine {
	
	calcExpressionByTree(node) {
		if (!node) 
			return 0;
			
		if (node.type === "all")
			return this.state.all_mask;
		
		if (node.type === "and") {
			
			return this.calcExpressionByTree(node.operand1) & this.calcExpressionByTree(node.operand2);
		}
		
		if (node.type === "or") {
			return this.calcExpressionByTree(node.operand1) | this.calcExpressionByTree(node.operand2);
		}
		
		if (node.type === "not") {
			return this.state.all_mask ^ this.calcExpressionByTree(node.operand1);
		}
		
		if (node.fraction)
			return this.state.fraction_mask[node.fraction];
		
		if (node.role)
			return this.state.role_mask[node.role];
		
		if (node.effect)
			return this.state.effect_mask[node.effect];
		
		if (node.time)
			return (this.state.time === node.time)? this.state.all_mask : 0;
	}
	
	getMaskFromSelector(selector) {
		if (!selector) {
			return 0;
		}
		
		selector = selector.replaceAll(" ", "");
		
		let res = this.expMap.get(selector);
		
		if (res) {
			return this.calcExpressionByTree(res);
		}
		else {
			let tree = this.checker.checkExpression(selector, this.config);
			this.expMap.set(selector, tree);
			let res = this.calcExpressionByTree(tree);
			return res;
		}
	}
	
	toCandidateList(mask) {
		var candidate_list = [];
		
		for (var i = 0; i < 30; i++) {
			if (mask & (1 << i)) {
				candidate_list.push({id: i, name: "Игрок #" + i});
			}
		}
		
		return candidate_list;
	}
	
	getAbility(id) {
		return this.config.abilities.find((ability) => ability.id === id);
	}
	
	getRole(id) {
		return this.config.roles.find((role) => role.id === id);
	}
	
	getEffect(id) {
		return this.config.effects.find((effect) => effect.id === id);
	}
	
	formatText(text, ability, effect, pindex, host) {
		text = text.replace("$target.name", "Игрок #" + pindex);
		text = text.replace("$target.fraction", this.state.fractions[pindex]);
		text = text.replace("$target.role", this.state.roles[pindex]);
		if (host) {
			text = text.replace("$host.name", "Игрок #" + host);
			text = text.replace("$host.fraction", this.state.fractions[host]);
			text = text.replace("$host.role", this.state.roles[host]);		
		}
		text = text.replace("$effect", effect.id);
		text = text.replace("$ability", ability.id);
		return text + "\n";
	}
	
	tryApplyEffect(pindex, pollers, effect, ability, messages, host) {
		
		if(this.state.effects[pindex].find((player_effect) =>
			 player_effect.protectFrom && player_effect.protectFrom.includes(effect.id))) {
			return;
		}
		

		if (effect.duration !== 0) {
			this.state.effect_mask[effect.id] |= 1 << pindex;
			this.state.effects[pindex].push({id: effect.id, 
											duration: effect.duration, 
											protectFrom: effect.protectFrom});
		}
										
		if (effect.text_to_user)
			messages[pindex] += this.formatText(effect.text_to_user, ability, effect, pindex, host);	
		
		if (effect.text_to_pollers) {
			pollers.forEach((poller) => {
				messages[poller] += this.formatText(effect.text_to_pollers, ability, effect, pindex, host);
			});
		}		
		
		if (effect.text_to_all) {
			for (var i = 0; i < this.count; i++) {
				messages[i] += this.formatText(effect.text_to_all, ability, effect, pindex, host);	
			}
		}
	}
	
	updateEffects() {
		
		this.state.effect_mask = {};
		this.config.effects.forEach((effect) => {
			this.state.effect_mask[effect.id] = 0;
		});
		
		for (var pindex = 0; pindex < this.count; pindex++) {
			
			var effects = this.state.effects[pindex];
			var updated_effects = [];
			
			effects.forEach((effect) => {
				if (effect.duration !== 1) {
					if (effect.duration > 0)
						effect.duration--;
					
					updated_effects.push(effect);
					this.state.effect_mask[effect.id] |= 1 << pindex;
				}
			});
			
			this.state.effects[pindex] = updated_effects;
		}
	}
	
	initChannels() {
		let channels = [];
		this.config.channels.forEach((channel) => {		
			channels.push({id: channel.id, color: channel.color});
		});
		
		return channels;
	}
	
	handleChannels(output) {
		output.channelStates = [];
		this.config.channels.forEach((channel) => {
			
			let read_mask = this.getMaskFromSelector(channel.canRead);
			let write_mask = this.getMaskFromSelector(channel.canWrite);
			let anonymous_read_mask = this.getMaskFromSelector(channel.canAnonymousRead);
			let anonymous_write_mask = this.getMaskFromSelector(channel.canAnonymousWrite);
			
			output.channelStates.push({id: channel.id, 
								canRead: read_mask, 
								canXRayRead: 0,
								canAnonymousRead: anonymous_read_mask,
								canWrite: write_mask,
								canXRayWrite: 0,
								canAnonymousWrite: anonymous_write_mask,
								color: channel.color});
		});
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
	
	handlePolls(output) {
		output.pollStates = [];
		this.config.abilities.forEach((ability) => {
			
			let candidate_mask = this.getMaskFromSelector(ability.candidates);
			let user_mask = this.getMaskFromSelector(ability.canUse);
			
			output.pollStates.push({
				id: ability.id,
				candidates: this.toCandidateList(candidate_mask),
				can_vote: user_mask
			});
		});
	}
	
	start(config) {
		this.config = config;
		this.expMap = new Map();
		this.checker = new ConfigChecker();
		this.state = {};
		this.count = 0;
		this.branch = 0;
		this.config.roles.forEach((role) => {this.count += role.count;});
		
		this.state.time = this.config.times[0].id;
		this.state.day_counter = 1;
		this.state.all_mask = (1 << this.count) - 1;
		
		this.state.fraction_mask = {};
		this.config.fractions.forEach((fraction) => {
			this.state.fraction_mask[fraction.id] = 0;
		});
		
		this.state.effect_mask = {};
		this.config.effects.forEach((effect) => {
			this.state.effect_mask[effect.id] = 0;
		});
		
		this.state.output = {};
		this.state.output.messages = [];
		this.state.role_mask = {};
		this.state.fractions = [];
		this.state.roles = [];
		this.state.effects = [];
		var index = 0;
		this.config.roles.forEach((role) => {
			this.state.role_mask[role.id] = 0;
			
			for (var i = 0; i < role.count; i++) {
				this.state.roles.push(role.id);
				this.state.fractions.push(role.fraction);
				this.state.effects.push([]);
				this.state.output.messages.push(role.description);
				
				this.state.fraction_mask[role.fraction] |= 1 << index;
				this.state.role_mask[role.id] |= 1 << index;
				index++;
			}
		});
		
		this.handleChannels(this.state.output);
		this.handlePolls(this.state.output);
		this.state.output.stage = this.state.time + " #" + this.state.day_counter + " @" + this.branch;
		this.state.output.duration = this.config.times[0].duration;
		this.state.output.win_fractions = [];
		
		return {initState: this.state.output, channels: this.initChannels(), polls: this.initPolls()};
	}
	
	update(poll_results) {
		//console.log(this.state);
		this.state.old_state = JSON.parse(JSON.stringify(this.state));
		this.updateEffects();
		
		this.state.output = {};
		this.state.output.messages = Array(30).fill("");
		
		let visitors = [];
		for (let i = 0; i < 30; i++) {
			visitors.push([]);	
		}
		
		poll_results.forEach((poll_result) => {
			var ability = this.getAbility(poll_result.id);
			
			var candidate_mask = this.getMaskFromSelector(ability.candidates);
			var user_mask = this.getMaskFromSelector(ability.canUse);
			
			var votes = Array(30).fill(0);
			
			for (var i = 0; i < 30; i++) {
				for (var j = 0; j < 30; j++) {
					
					if (!(user_mask & (1 << i))) { /* || !(candidate_mask & (1 << j))*/
						continue;	
					}
					
					if (poll_result.table[i] & (1 << j)) {
						votes[j]++;	
					}
				}
			}
			
			var selected = [];
			if (ability.rule === "most_voted") {
				var max = -1, second_max = -1, max_index;
				for (var i = 0; i < 30; i++) {
					if (votes[i] > max) {
						second_max = max;
						max = votes[i];
						max_index = i;
					} else {
						if (votes[i] > second_max) {
							second_max = votes[i];
						}
					}
				}
				
				if (second_max !== max && max > 0) {
					selected = [max_index];
				}
			}

			if (ability.rule === "each_voted") {
				for (var i = 0; i < 30; i++) {
					if (votes[i])
						selected.push(i);
				}
			}
			
			selected.forEach((candidate) => {		
				
				var pollers = [];
				
				for (let i = 0; i < 30; i++) {
					if ((poll_result.table[i] & (1 << candidate)) && (user_mask & (1 << i))) {
						pollers.push(i);
					}
				}		
				
				pollers.forEach((poller) => {
					if (!visitors[candidate].includes(poller)) {
						visitors[candidate].push(poller);
					}
				});
				
				if (ability.effects) {
					ability.effects.forEach((effect_id) => {
						let effect = this.getEffect(effect_id);
						this.tryApplyEffect(candidate, pollers, effect, ability, this.state.output.messages, null);
					});
				}
				
				if (ability.visitor_effects) {
					
					visitors[candidate].forEach(
						(visitor) => {
							ability.visitor_effects.forEach((effect_id) => {
								let effect = this.getEffect(effect_id);
								this.tryApplyEffect(visitor, pollers, effect, ability, this.state.output.messages, candidate);
							});
						}
					);
				}
			});
		});
		
		var time_index = this.config.times.findIndex((time) => time.id === this.state.time);

		if (time_index + 1 === this.config.times.length) {
			time_index = 0;
			this.state.day_counter++;
		}
		else 
			time_index++;
		
		this.state.time = this.config.times[time_index].id;
		this.state.output.duration = this.config.times[time_index].duration;
		
		this.state.output.win_fractions = [];
		this.config.fractions.forEach((fraction) => {
			
			if(!this.getMaskFromSelector(fraction.win_condition)) {

				this.state.output.win_fractions.push(fraction.id);		
				
				for (var i = 0; i < this.count; i++)
					this.state.output.messages[i] += fraction.win_text + "\n";
			}
		});
		
		this.handleChannels(this.state.output);
		this.state.output.polls = [];
		
		if (!this.state.output.win_fractions.length)
			this.handlePolls(this.state.output);
		else
			this.state.output.pollStates = []; 
		
		this.state.output.stage = this.state.time + " #" + this.state.day_counter + " @" + this.branch;
		
		return this.state.output;
	}
	
	toPast() {
		if (this.state.old_state) {
			this.state = this.state.old_state;
			this.branch++;
			this.state.output.stage = this.state.time + " #" + this.state.day_counter + " @" + this.branch;
			return this.state.output;
		}	
		
		return null;
	}
}

export default Engine;