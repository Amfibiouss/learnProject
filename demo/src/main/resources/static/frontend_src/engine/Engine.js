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
		
		if (node.status) {	
			
			if (this.state.status_mask.has(node.status))
				return this.state.status_mask.get(node.status);
			else
				return 0;
		}
		
		if (node.time)
			return (this.state.time === node.time)? this.state.all_mask : 0;
	}
	
	getMaskFromSelector(selector, target, user) {
		if (!selector) {
			return 0;
		}
		
		selector = this.formatText(selector, target, user);
		
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
	
	getFraction(id) {
		return this.config.fractions.find((fraction) => fraction.id === id);
	}
	
	getAction(id) {
		return this.config.actions.find((action) => action.id === id);
	}
	
	getStatus(id) {
		let parts = id.split("/");
		return this.config.statuses.find((status) => status.id === parts[0]);
	}
	
	bitCount(num) {
		let count = 0;
		
		for (let i = 0; i < 32; i++) {
			if (num & (1 << i))
				count++;
		}
		
		return count;
	}
	
	getRandomIndexFromMask(num) {
		
		if (num === 0)
			return null;
		
		let index = Math.floor(Math.random() * this.bitCount(num));
		
		for (let i = 0; i < 32; i++) {
			if (num & (1 << i)) {
				
				if (!index)
					return i;
				
				index--;
			}
		}
		
		return null;
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
		
		this.state.status_mask = new Map();
		this.state.players = [];
		for (let i = 0; i < this.count; i++)
			this.state.players.push({status_count: new Map(), statuses: []});
		
		
		this.state.time = this.config.times[0].id;
		this.state.day_counter = 1;
		this.state.all_mask = (1 << this.count) - 1;
		
		this.state.fraction_mask = {};
		this.config.fractions.forEach((fraction) => {
			this.state.fraction_mask[fraction.id] = 0;
		});
		
		this.state.output = {};
		this.state.output.messages = [];
		this.state.role_mask = {};
		this.state.fractions = [];
		this.state.roles = [];
		let index = 0;
		for (const role of this.config.roles) {
			this.state.role_mask[role.id] = 0;
			
			for (let i = 0; i < role.count; i++) {
				this.state.roles.push(role.id.split("/")[0]);
				this.state.fractions.push(role.fraction.split("/")[0]);
				this.addStatus("role/$target.role", -1, index, index);
				this.addStatus("fraction/$target.fraction", -1, index, index);
				
				if (role.statuses) {
					for (let status of role.statuses) {
						this.addStatus(status, this.getStatus(status).duration, index, index);
					}
				}
				
				this.state.output.messages.push(role.description);
				
				this.state.fraction_mask[role.fraction] |= 1 << index;
				this.state.role_mask[role.id] |= 1 << index;
				index++;
			}
		}
		
		this.handleChannels(this.state.output);
		this.handlePolls(this.state.output);
		this.state.output.stage = this.state.time + " #" + this.state.day_counter + " @" + this.branch;
		this.state.output.duration = this.config.times[0].duration;
		this.state.output.finish = false;
		
		return {initState: this.state.output, channels: this.initChannels(), polls: this.initPolls()};
	}
	
	getSelected(user_mask, table,  ability) {
		let votes = Array(30).fill(0);
		let selected = [];
		
		for (var i = 0; i < 30; i++) {
			
			if (!(user_mask & (1 << i))) 
				continue;	
			
			for (var j = 0; j < 30; j++) {
				
				if (table[i] & (1 << j)) {
					votes[j]++;	
				}
			}
		}
		
		if (ability.rule === "most_voted") {
			let max = -1, second_max = -1, max_index;
			for (let i = 0; i < 30; i++) {
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
				let users = [];
				let direct_users = [];
				for (let i = 0; i < 30; i++) {
					if (user_mask & (1 << i)) {
						users.push(i);
						
						if (table[i] & (1 << max_index))
							direct_users.push(i);
					}
				}
				
				selected = [{id: max_index, users: users, direct_users: direct_users}];
			}
		} else if (ability.rule === "each_voted") {
			for (let i = 0; i < 30; i++) {
				if (!votes[i]) 
					continue;
				
				let users = [];
				let direct_users = [];
				for (let j = 0; j < 30; j++) {
					if (user_mask & (1 << j)) {
						users.push(j);
						
						if (table[j] & (1 << i)) {
							direct_users.push(j);
						}
					}
				}
				
				selected.push({id: i, users: users, direct_users: direct_users});
			}
		}
		
		return selected;
	}
	
	formatText(text, target, user) {
		text = text.replace("$target.name", "Игрок #" + target);
		text = text.replace("$target.fraction", this.state.fractions[target]);
		text = text.replace("$target.role", this.state.roles[target]);
		
		text = text.replace("$user.name", "Игрок #" + user);
		text = text.replace("$user.fraction", this.state.fractions[user]);
		text = text.replace("$user.role", this.state.roles[user]);
		
		
		return text;
	}
	
	addStatus(status, duration, target, user) {
		status = this.formatText(status, target, user);
		let parts = status.split("/");
		let path = "";
		let player = this.state.players[target];
		
		for (const part of parts) {
			path += part;
			if (player.status_count.has(path)) {
				let count = player.status_count.get(path);
				player.status_count.set(path, count + 1);
			} else {
				player.status_count.set(path, 1);
				
				if (this.state.status_mask.has(path)) {
					this.state.status_mask.set(path, this.state.status_mask.get(path) ^ (1 << target));
				} else {
					this.state.status_mask.set(path, 1 << target);
				}
			}
			
			path += "/";
		}
		
		//console.log("!!!!" + status + " " + target + " " + user);
		
		player.statuses.push({id: status, duration: duration, target: target, user: user});
	}
	
	removeStatus(status, target, user) {
		status = this.formatText(status, target, user);
		let player = this.state.players[target];
		
		let index = player.statuses.findIndex(item => item.id === status);

		if (index === -1)
			return;
		
		player.statuses.splice(index, 1);
		
		let parts = status.split("/");
		let path = "";
		
		for (const part of parts) {
			path += part;
			if (player.status_count.has(path)) {
				let count = player.status_count.get(path);
				player.status_count.set(path, count - 1);
				
				if (count === 1) {
					player.status_count.delete(path);
					this.state.status_mask.set(path, this.state.status_mask.get(path) ^ (1 << target));
					this.state.status_mask[path] ^= 1 << target;
				}
			}
			path += "/";
		}
	}
	
	updateStatusDuration(messages) {
		for (let pindex = 0; pindex < this.count; pindex++) {
			
			let player = this.state.players[pindex];
			
			for (let status of player.statuses) {
				if (status.duration < 0)
					continue;
				
				status.duration -= 0.5;
			}
			
			while(true) {
				let index = player.statuses.findIndex((item) => item.duration === 0);
				
				if (index === -1)
					break;

				let status = player.statuses[index];
				let action = this.getStatus(status.id).expireAction;
				
				if (action)
					this.tryAction({id: status.target, users: [status.user], direct_users: [status.user]}, status.user, action, messages);
				
				this.removeStatus(status.id, pindex, status.user);
			}
		}
	}
	
	getStatuses(pindex) {
		return this.state.player[pindex].statuses;
	}
	
	updateStatuses(target, user, addStatuses, removeStatuses) {
		if (addStatuses) {
			for (const status of addStatuses) {
				this.addStatus(status, this.getStatus(status).duration, target, user);
			}
		}

		if (removeStatuses) {
			for (const status of removeStatuses) {
				this.removeStatus(status, target, user);
			}
		}
	}
	
	tryAction(candidate, user, action, messages) {
		
		let target = candidate.id;
		let action_info = this.getAction(action);
		for (const reaction of action_info.reactions) {
			let condition = this.getMaskFromSelector(reaction.condition, target, user) & (1 << target);

			if (!condition)
				continue;
			
			this.updateStatuses(target, user, reaction.addTargetStatuses, reaction.removeTargetStatuses);
			this.updateStatuses(user, target, reaction.addUserStatuses, reaction.removeUserStatuses);
			
			for (const direct_user of candidate.direct_users)
				this.updateStatuses(direct_user, target, reaction.addDirectUsersStatuses, reaction.removeDirectUsersStatuses);
			
			for (const _user of candidate.users)
				this.updateStatuses(_user, target, reaction.addUsersStatuses, reaction.removeUsersStatuses);
			
			if (reaction.informTarget)
				messages[target] += this.formatText(reaction.informTarget, target, user) + "\n";	
			
			if (reaction.informUser)
				messages[user] += this.formatText(reaction.informUser, target, user) + "\n";	
			
			if (reaction.informDirectUsers) {
				for (const id of candidate.direct_users) 
					messages[id] += this.formatText(reaction.informDirectUsers, target, user) + "\n";	
			} 
			
			if (reaction.informUsers) {
				for (const id of candidate.users) 
					messages[id] += this.formatText(reaction.informUsers, target, user) + "\n";	
			}
			
			if (reaction.inform) {
				for (const group of reaction.inform) {
					let mask = this.getMaskFromSelector(group.address, target, user);

					//console.log("$$$" + action + " " + mask + " " + this.formatText(group.address, target, user));
					
					for (let i = 0; i < this.count; i++) {
						if (mask & (1 << i))
							messages[i] += this.formatText(group.text, target, user) + "\n";
					}	
				}
			}
			
			if (reaction.informAll) {
				for (let i = 0; i < this.count; i++)
					messages[i] += this.formatText(reaction.informAll, target, user) + "\n";	
			}
			
			if (reaction.stop === true)
				return true;
			
			if (!reaction.propagate)
				break;	
		}
		
		return false;
	}
	
	update(poll_results) {

		this.state.old_state = JSON.parse(JSON.stringify(this.state));
		
		//Обработка автоматического голосования вместо пользователя (например для Мести Дурака)
		for(const poll_result of poll_results) {
			for (let i = 0; i < this.count; i++) {
				let ability = this.getAbility(poll_result.id);
				let user_mask = this.getMaskFromSelector(ability.canUse);
				
				if (!(user_mask & (1 << i))) 
					continue;	
				
				if (ability.autoVote && poll_result.table[i] === 0) {
					let candidate_mask = this.getMaskFromSelector(ability.candidates);
					let random_index = this.getRandomIndexFromMask(candidate_mask);

					if (random_index !== null)
						poll_result.table[i] = 1 << random_index;
				}
			}
		}
		
		this.updateStatusDuration(this.state.output.messages);
		
		this.state.output = {};
		this.state.output.messages = Array(30).fill("");
		
		for(const poll_result of poll_results) {
			let ability = this.getAbility(poll_result.id);
			
			//let candidate_mask = this.getMaskFromSelector(ability.candidates);
			let user_mask = this.getMaskFromSelector(ability.canUse);
			let selected = this.getSelected(user_mask, poll_result.table, ability);
			
			for (const candidate of selected) {
				
				if (!ability.actions)
					continue;
				
				for (const action of ability.actions) {
					for (const user of candidate.users) {
						if (this.tryAction(candidate, user, action, this.state.output.messages))
							break;
					}
				}
			}
		}
		
		this.updateStatusDuration(this.state.output.messages);
		
		var time_index = this.config.times.findIndex((time) => time.id === this.state.time);

		if (time_index + 1 === this.config.times.length) {
			time_index = 0;
			this.state.day_counter++;
		}
		else 
			time_index++;
		
		this.state.time = this.config.times[time_index].id;
		this.state.output.duration = this.config.times[time_index].duration;
		
		this.state.output.finish = false;
		
		for (let winCase of this.config.finishConditions) {
			
			//console.log(winCase.condition + " $$$$ " + this.getMaskFromSelector(winCase.condition));
			
			if(!this.getMaskFromSelector(winCase.condition)) {
				
				let winners_mask = this.getMaskFromSelector(winCase.winners);
				
				for (let i = 0; i < this.count; i++) {
					if (winners_mask & (1 << i)) {
						this.state.output.messages[i] += winCase.winText + "\n";
					} else {
						this.state.output.messages[i] += winCase.loseText + "\n";
					}
					
					if (winCase.winTextAll)
						this.state.output.messages[i] += winCase.winTextAll + "\n";
				}
				
				this.state.output.finish = true;
				break;	
			}
		}
		
		this.handleChannels(this.state.output);
		this.state.output.polls = [];
		
		if (!this.state.output.finish)
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