import ConfigChecker from "./ConfigChecker.js";
import OutputBuilder from "./OutputBuilder.js";

class Engine {
	
	calcExpressionByTree = (node) => {
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
		
		if (node.type === "less") {
			return (this.bitCount(this.calcExpressionByTree(node.operand1)) < node.operand2)? this.state.all_mask : 0;
		}
		
		if (node.type === "greather") {
			return (this.bitCount(this.calcExpressionByTree(node.operand1)) > node.operand2)? this.state.all_mask : 0;
		}
		
		if (node.type === "equal") {
			//console.log(JSON.stringify(node.operand1) + " " + this.calcExpressionByTree(node.operand1) + " " + node.operand2);
			
			return (this.bitCount(this.calcExpressionByTree(node.operand1)) === node.operand2)? this.state.all_mask : 0;
		}
		
		if (node.fraction) {
			if (this.state.status_mask.has("fraction/" + node.fraction))
				return this.state.status_mask.get("fraction/" + node.fraction);
			else
				return 0;
		}
		
		if (node.role) {			
			if (this.state.status_mask.has("role/" + node.role))
				return this.state.status_mask.get("role/" + node.role);
			else
				return 0;
		}
		
		if (node.status) {	
			
			if (this.state.status_mask.has(node.status))
				return this.state.status_mask.get(node.status);
			else
				return 0;
		}
		
		if (node.time)
			return (this.state.time === node.time)? this.state.all_mask : 0;
	}
	
	getMaskFromSelector = (selector, target, user) => {
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
	
	bitCount = (num) => {
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
	
	randomShuffle(arr) {
		
		for (let i = 1; i < arr.length; i++) {
			let index = Math.floor(Math.random() * i);
			let temp = arr[i];
			arr[i] = arr[index];
			arr[index] = temp;
		}	
	}
	
	start(config) {
		this.config = config;
		config.statuses.push({id: "role", duration: -1});
		config.statuses.push({id: "fraction", duration: -1});
		config.statuses.push({id: "player", duration: -1});
		config.statuses.push({id: "controlledBy", duration: -1});
		this.expMap = new Map();
		this.checker = new ConfigChecker();
		this.state = {};
		this.count = 0;
		this.branch = 0;
		this.config.roles.forEach((role) => {this.count += role.count;});
		
		this.state.status_mask = new Map();
		this.state.statuses = [];
		this.state.status_count = [];
		for (let i = 0; i < this.count; i++)
			this.state.status_count.push(new Map());
		
		this.state.time = this.config.times[0].id;
		this.state.day_counter = 1;
		this.state.all_mask = (1 << this.count) - 1;
		
		this.outputBuilder = new OutputBuilder(this.config, this.getMaskFromSelector, this.formatText);
		
		let permutation = Array(this.count - 1).fill().map((_, index) => index + 1);
		this.randomShuffle(permutation);
		permutation = [0].concat(permutation);
		let index = 0;
		
		for (const role of this.config.roles) {
			for (let i = 0; i < role.count; i++) {
				this.addStatus("role/" + role.id, -1, permutation[index], permutation[index]);
				this.addStatus("fraction/" + role.fraction, -1, permutation[index], permutation[index]);
				this.addStatus("player/Игрок #" + permutation[index], -1, permutation[index], permutation[index]);
				index++;
			}
		}
		
		index = 0;
		for (const role of this.config.roles) {
			for (let i = 0; i < role.count; i++) {
				
				if (role.revealRoles) {
					let mask = this.getMaskFromSelector(this.formatText(role.revealRoles, permutation[index], null));
					let str = "";
					
					for (let j = 0; j < this.count; j++) {
						if (mask & (1 << j)) {
							str += "У Игрока #" + j + " роль " + this.getRoleByPindex(j) + ".\n";
						}
					}
					
					this.outputBuilder.addMessage(permutation[index], str);
				}
				
				if (role.statuses) {
					for (const status of role.statuses) {
						this.addStatus(this.formatText(status, permutation[index], null), this.getStatus(status).duration, permutation[index], permutation[index]);
					}
				}
				
				this.outputBuilder.addMessage(permutation[index], role.description);
				index++;
			}
		}
		
		let output = this.outputBuilder.build(
			this.state.time + " #" + this.state.day_counter + " @" + this.branch, 
			this.config.times[0].duration, 
			true);
			
		this.state.output = output.initState;
		
		return output;
	}
	
	getSelected(user_mask, table,  ability) {
		let votes = Array(this.count).fill(0);
		let selected = [];
		
		for (var i = 0; i < this.count; i++) {
			
			if (!(user_mask & (1 << i))) 
				continue;	
			
			for (var j = 0; j < this.count; j++) {
				
				if (table[i] & (1 << j)) {
					votes[j]++;	
				}
			}
		}
		
		if (ability.rule.startsWith("most_voted")) {
			let max = -1, second_max = -1, max_index;
			for (let i = 0; i < this.count; i++) {
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
			
			if (max <= 0)
				return [];
			
			if (ability.rule === "most_voted - draw_random") {
				
				let arr = [];
				
				for (let i = 0; i < this.count; i++) {
					if (votes[i] === max)
						arr.push(i);
				}
				
				this.randomShuffle(arr);
				max_index = arr[0];
			}
			
			if (ability.rule === "most_voted - draw_none" && second_max === max)
				return [];
			
			let users = [];
			let direct_users = [];
			for (let i = 0; i < this.count; i++) {
				if (user_mask & (1 << i)) {
					users.push(i);
					
					if (table[i] & (1 << max_index))
						direct_users.push(i);
				}
			}
			
			selected = [{id: max_index, users: users, direct_users: direct_users}];
			
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
	
	getRoleByPindex = (pindex) => {
		let res = this.config.roles.find(role => 
					this.state.status_mask.get("role/" + role.id) & (1 << pindex));
		return res? res.id : null;
	}
	
	getFractionByPindex = (pindex) => {
		let res = this.config.fractions.find(fraction => 
			this.state.status_mask.get("fraction/" + fraction.id) & (1 << pindex));
			
		return res? res.id : null;
	}
	
	formatText = (text, target, user) => {
		
		if (typeof(target) === "number") {
			text = text.replaceAll("$target.name", "Игрок #" + target);
			text = text.replaceAll("$target.fraction", this.getFractionByPindex(target));
			text = text.replaceAll("$target.role", this.getRoleByPindex(target));
		}
		if (typeof(user) === "number") {
			text = text.replaceAll("$user.name", "Игрок #" + user);
			text = text.replaceAll("$user.fraction", this.getFractionByPindex(user));
			text = text.replaceAll("$user.role", this.getRoleByPindex(user));
		}
		
		return text;
	}
	
	addStatus(status, duration, target, user) {
		this.state.statuses.push({id: status, duration: duration, target: target, user: user});
		
		let parts = status.split("/");
		let path = "";
		
		for (const part of parts) {
			path += part;
			if (this.state.status_count[target].has(path)) {
				let count = this.state.status_count[target].get(path);
				this.state.status_count[target].set(path, count + 1);
			} else {
				this.state.status_count[target].set(path, 1);
				
				if (this.state.status_mask.has(path)) {
					this.state.status_mask.set(path, this.state.status_mask.get(path) ^ (1 << target));
				} else {
					this.state.status_mask.set(path, 1 << target);
				}
			}
			
			path += "/";
		}
		
		//console.log("@@@@" + status + " " + target + " " + user);
	}
	
	removeStatus(status, target, user) {
		status = this.formatText(status, target, user);
		
		let index = this.state.statuses.findIndex(item => (item.target === target && (item.id === status || item.id.startsWith(status + "/"))));

		if (index === -1)
			return;

		status = this.state.statuses[index].id;
		//console.log("####" + status + " " + this.state.statuses[index].id  + " " + target + " " + user);
		
		this.state.statuses.splice(index, 1);
		
		let parts = status.split("/");
		let path = "";
		
		for (const part of parts) {
			path += part;
			if (this.state.status_count[target].has(path)) {
				let count = this.state.status_count[target].get(path);
				this.state.status_count[target].set(path, count - 1);
				if (count === 1) {
					this.state.status_count[target].delete(path);
					this.state.status_mask.set(path, this.state.status_mask.get(path) ^ (1 << target));
					this.state.status_mask[path] ^= 1 << target;
				}
			}
			path += "/";
		}
	}
	
	updateStatusDuration() {
		
		this.randomShuffle(this.state.statuses);
		
		for (const status of this.state.statuses) {

			if (status.duration < 0)
				continue;
				
			status.duration -= 0.5;
		}
			
		while(true) {
			let index = this.state.statuses.findIndex((item) => item.duration === 0);
			
			if (index === -1)
				break;

			let status = this.state.statuses[index];
			let action = this.getStatus(status.id).expireAction;
			
			if (action)
				this.tryAction({id: status.target, users: [status.user], direct_users: [status.user]}, status.user, action);
			
			this.removeStatus(status.id, status.target, status.user);
		}
	}	
	
	updateControlledByStatus() {
		
		this.randomShuffle(this.state.statuses);

		for (const status of this.state.statuses) {
			
			if (status.id.startsWith("controlledBy/")) {
				
				//console.log("!!!!" + JSON.stringify(status));
				
				let parts = status.id.split("/");
				
				if (parts.length < 2)
					continue;
				
				let user = Number(parts[1].substring("Игрок #".length));
				
				if (isNaN(user))
					continue;
		
				let pollId = null;
				
				if (parts.length > 2)
					pollId = parts[2];
				
				this.outputBuilder.setControlledBy(status.target, user, pollId);
			}
		}
	}	

	updateStatuses(target, user, addStatuses, removeStatuses) {
		
		if (removeStatuses) {
			for (const status of removeStatuses) {				
				this.removeStatus(this.formatText(status, target, user), target, user);
			}
		}
		
		if (addStatuses) {
			for (const status of addStatuses) {
				this.addStatus(this.formatText(status, target, user), this.getStatus(status).duration, target, user);
			}
		}
	}
	
	tryAction(candidate, user, action) {
		
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
			
			if (reaction.affect) {
				for (const group of reaction.affect) {
					let mask = this.getMaskFromSelector(group.address, target, user);
					for (let i = 0; i < this.count; i++) {
						if (mask & (1 << i)) {
							this.updateStatuses(i, target, group.addStatuses, group.removeStatuses);
						}
					}
				}
			}
			
			if (reaction.informTarget)
				this.outputBuilder.addMessage(target, this.formatText(reaction.informTarget, target, user));	
			
			if (reaction.informUser)
				this.outputBuilder.addMessage(user, this.formatText(reaction.informUser, target, user));	
			
			if (reaction.informDirectUsers) {
				for (const id of candidate.direct_users) 
					this.outputBuilder.addMessage(id, this.formatText(reaction.informDirectUsers, target, user));	
			} 
			
			if (reaction.informUsers) {
				for (const id of candidate.users) 
					this.outputBuilder.addMessage(id, this.formatText(reaction.informUsers, target, user));	
			}
			
			if (reaction.inform) {
				for (const group of reaction.inform) {
					let mask = this.getMaskFromSelector(group.address, target, user);

					//console.log("$$$" + action + " " + mask + " " + this.formatText(group.address, target, user));
					
					for (let i = 0; i < this.count; i++) {
						if (mask & (1 << i))
							this.outputBuilder.addMessage(i, this.formatText(group.text, target, user));
					}	
				}
			}
			
			if (reaction.informAll) {
				for (let i = 0; i < this.count; i++)
					this.outputBuilder.addMessage(i, this.formatText(reaction.informAll, target, user));	
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
		this.outputBuilder = new OutputBuilder(this.config, this.getMaskFromSelector, this.formatText);
		
		//Обработка автоматического голосования вместо пользователя (например для Мести Дурака)
		for(const poll_result of poll_results) {
			for (let i = 0; i < this.count; i++) {
				let ability = this.getAbility(poll_result.id);
				let user_mask = this.getMaskFromSelector(ability.canUse);
				
				if (!(user_mask & (1 << i))) 
					continue;	
				
				if (ability.autoVote && poll_result.table[i] === 0) {
					let candidate_mask = this.getMaskFromSelector(this.formatText(ability.candidates, null, i));
					let random_index = this.getRandomIndexFromMask(candidate_mask);

					if (random_index !== null)
						poll_result.table[i] = 1 << random_index;
				}
			}
		}
		
		this.updateStatusDuration();
		
		for(const poll_result of poll_results) {
			let ability = this.getAbility(poll_result.id);
			
			//let candidate_mask = this.getMaskFromSelector(ability.candidates);
			let user_mask = this.getMaskFromSelector(ability.canUse);
			let selected = this.getSelected(user_mask, poll_result.table, ability);
			this.randomShuffle(selected);
			
			for (const candidate of selected) {
				
				if (!ability.actions)
					continue;
				
				for (const action of ability.actions) {
					this.randomShuffle(candidate.users);
					for (const user of candidate.users) {
						if (this.tryAction(candidate, user, action))
							break;
					}
				}
			}
		}
		
		this.updateStatusDuration();
		this.updateControlledByStatus();
		
		var time_index = this.config.times.findIndex((time) => time.id === this.state.time);

		if (time_index + 1 === this.config.times.length) {
			time_index = 0;
			this.state.day_counter++;
		}
		else 
			time_index++;
		
		this.state.time = this.config.times[time_index].id;

		for (let winCase of this.config.finishConditions) {
			
			if(!this.getMaskFromSelector(winCase.condition)) {
				
				let winners_mask = this.getMaskFromSelector(winCase.winners);
				
				//console.log(winCase.winners + " " + this.getMaskFromSelector(winCase.winners)
				//	 + " " + this.getMaskFromSelector("role(Ведьма) and status(Живой)"));
				
				for (let i = 0; i < this.count; i++) {
					if (winners_mask & (1 << i)) {
						this.outputBuilder.addMessage(i, winCase.winText);
					} else {
						this.outputBuilder.addMessage(i, winCase.loseText);
					}
					
					if (winCase.winTextAll)
						this.outputBuilder.addMessage(i, winCase.winTextAll);
				}
				
				this.outputBuilder.setFinish();
				break;	
			}
		}
		
		this.state.output = this.outputBuilder.build(
			this.state.time + " #" + this.state.day_counter + " @" + this.branch,
			this.config.times[time_index].duration,  
			false);
		
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