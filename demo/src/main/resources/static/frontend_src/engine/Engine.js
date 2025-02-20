import ConfigChecker from "./ConfigChecker.js";
import OutputBuilder from "./OutputBuilder.js";

class Engine {
	
	calcExpressionByTree = (node, target, user) => {
		if (!node) 
			return 0;
			
		let res = 0;
		
		switch (node.type) {
			case "all":
				res = this.all_mask;
				break;
				
			case "and":
				res = this.calcExpressionByTree(node.operand1, target, user);
				if (res) 
					res &= this.calcExpressionByTree(node.operand2, target, user);
				break;
					
			case "or":
				res = this.calcExpressionByTree(node.operand1, target, user);
				if (res !== this.all_mask)
					res |= this.calcExpressionByTree(node.operand2, target, user);
				break;
				
			case "not":
				res = this.all_mask ^ this.calcExpressionByTree(node.operand1, target, user);
				break;
				
			case "less":
				res = (this.bitCount(this.calcExpressionByTree(node.operand1, target, user)) < node.operand2)? this.all_mask : 0;
				break;
				
			case "greather":
				res = (this.bitCount(this.calcExpressionByTree(node.operand1, target, user)) > node.operand2)? this.all_mask : 0;
				break;
				
			case "equal":
				res = (this.bitCount(this.calcExpressionByTree(node.operand1, target, user)) === node.operand2)? this.all_mask : 0;
				break;
				
			case "user":
				res = (typeof(user) === "number")? 1 << user : 0;
				break;
				
			case "target":
				res = (typeof(target) === "number")? 1 << target : 0;
				break;
				
			case "fraction":
				res = this.state.status_mask.get("fraction/" + node.operand1);
				res = (typeof(res) === "number")? res : 0;
				break;
				
			case "role":
				res = this.state.status_mask.get("role/" + node.operand1);
				res = (typeof(res) === "number")? res : 0;
				break;
				
			case "status":
				res = this.state.status_mask.get(node.operand1);
				res = (typeof(res) === "number")? res : 0;
				break;
				
			case "time":
				res = (this.state.time === node.operand1)? this.all_mask : 0;
				break;
			
			case "cycle":
				res = (this.state.day_counter === node.operand1)? this.all_mask : 0;
				break;
				
			case "user_role":
			case "user_fraction":
			case "user_status":
			case "target_role":
			case "target_fraction":
			case "target_status":	
				let parts = node.type.split("_");
				let keyword = parts[0];
				let func = parts[1];
				
				let status =  ((func === "status")? "" : (func + "/")) + node.operand1;
				let degree = (keyword === "user")? user : target;
				
				if (typeof(degree) !== "number" || !this.state.status_mask.has(status)) {
					res = 0;
					break;
				}
				
				res = (this.state.status_mask.get(status) & (1 << degree))? this.all_mask : 0;

				break;
		}
		
		return res;	
	}
	
	getMaskFromSelector = (selector, target, user) => {
		if (!selector) {
			return 0;
		}
		
		selector = this.formatText(selector, target, user);
		
		let res = this.expMap.get(selector);
		
		if (res) {
			return this.calcExpressionByTree(res, target, user);
		}
		else {
			let tree = this.checker.computeExpression(selector, this.config);
			this.expMap.set(selector, tree);
			let res = this.calcExpressionByTree(tree, target, user);
			if (selector === "time(Ночь) and (role(Мафия) or role(Дон)) and status(Живой) and not(status(Заблокирован))") {
				console.log(JSON.stringify(tree));
			}
			//console.log(JSON.stringify(tree));
			return res;
		}
	}
	
	getTime(id) {
		return this.config.times.find((time) => time.id === id);
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
		
		if (!num)
			return 0;
		
		let count = 0;
		while(num != 0) {
			num = (num & (num - 1));
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
	
	initialize() {
		this.config.statuses.push({id: "role", duration: -1});
		this.config.statuses.push({id: "fraction", duration: -1});
		this.config.statuses.push({id: "player", duration: -1});
		this.config.statuses.push({id: "controlledBy", duration: -1});
		this.config.statuses.push({id: "earsControlledBy", duration: -1});
		this.config.statuses.push({id: "tongueControlledBy", duration: -1});
		this.expMap = new Map();
		this.checker = new ConfigChecker();
		this.state = {};
		this.branch = 0;
		this.count = this.config.roles.reduce((acc, item) => (acc + item.count), 0);
		//this.config.roles.forEach((role) => {this.count += role.count;});
		
		this.state.status_mask = new Map();
		this.state.statuses = [];
		this.state.status_count = [];
		for (let i = 0; i < this.count; i++)
			this.state.status_count.push(new Map());
		
		this.all_mask = (1 << this.count) - 1;
		
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
				
				this.outputBuilder.addMessage(permutation[index], this.formatText(role.description, permutation[index], null));
				index++;
			}
		}
		
		this.state.time = null;//this.config.times[0].id;
		this.state.day_counter = 0;
	}
	
	firstPartStart(config) {
		this.config = config;
		this.outputBuilder = new OutputBuilder(this.config, this.getMaskFromSelector, this.formatText);
		this.initialize();
	}
	
	secondPartStart(poll_results) {
		this.update(poll_results);

		let output = this.outputBuilder.build(
			this.state.time + " #" + this.state.day_counter + " @" + this.branch, 
			this.getTime(this.state.time).duration, 
			true);
			
		this.state.output = output.initState;
		return output;
	}
	
	start(config) {
		this.config = config;	
		this.outputBuilder = new OutputBuilder(this.config, this.getMaskFromSelector, this.formatText);
		
		this.initialize();
		this.update([]);
		
		let output = this.outputBuilder.build(
			this.state.time + " #" + this.state.day_counter + " @" + this.branch, 
			this.getTime(this.state.time).duration, 
			true);
			
		this.state.output = output.initState;
		return output;
	}
	
	toFuture(poll_results) {
		this.state.old_state = structuredClone(this.state);
		this.outputBuilder = new OutputBuilder(this.config, this.getMaskFromSelector, this.formatText);
		
		this.update(poll_results);	
		
		let output = this.state.output = this.outputBuilder.build(
			this.state.time + " #" + this.state.day_counter + " @" + this.branch,
			this.getTime(this.state.time).duration,  
			false);
		
		this.state.output = output;
		return output;
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
	
	getSelected(user_mask, candidate_mask, table,  ability) {
		let votes = Array(this.count).fill(0);
		let selected = [];
		
		for (let i = 0; i < this.count; i++) {
			
			if (!(user_mask & (1 << i))) 
				continue;	
			
			for (let j = 0; j < this.count; j++) {
				
				if (table && (table[i] & (1 << j))) {
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
			
		} else if (ability.rule === "each_voted" || (ability.rule === "start" && table)) {
			
			for (let i = 0; i < this.count; i++) {
				if (!votes[i]) 
					continue;
				
				let users = [];
				let direct_users = [];
				for (let j = 0; j < this.count; j++) {
					if (user_mask & (1 << j)) {
						users.push(j);
						
						if (table[j] & (1 << i)) {
							direct_users.push(j);
						}
					}
				}
				
				selected.push({id: i, users: users, direct_users: direct_users});
			}
		} else if (ability.rule === "start") {
			
			for (let i = 0; i < this.count; i++) {
				
				let users = [];
				let direct_users = [];
				
				if (!(candidate_mask & (1 << i)))
					continue;
				
				for (let j = 0; j < this.count; j++) {
					if (user_mask & (1 << j))  {
						users.push(j);
						direct_users.push(j);
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
		
		if (!text)
			return null;
		
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
		//console.log("####" + status  + " " + target + " " + user);
		
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
			
			if (!status.id.startsWith("controlledBy/") 
				&& !status.id.startsWith("earsControlledBy/") 
				&& !status.id.startsWith("tongueControlledBy/"))
				continue;
			
			let parts = status.id.split("/");
			
			if (parts.length < 2)
				continue;
			
			let user = Number(parts[1].substring("Игрок #".length));
			
			if (isNaN(user))
				continue;
	
			let resourceId = null;
			
			if (parts.length > 2)
				resourceId = parts[2];
			
			if (status.id.startsWith("controlledBy/"))
				this.outputBuilder.setControlledBy(status.target, user, resourceId);
			else if (status.id.startsWith("earsControlledBy/")) {
				this.outputBuilder.setEarsControlledBy(status.target, user, resourceId);
			} else {
				this.outputBuilder.setTongueControlledBy(status.target, user, resourceId);
			}
		}
	}	

	updateStatuses(target, user, addStatuses, removeStatuses, reverse) {
		
		if (removeStatuses) {
			for (const status of removeStatuses) {
				if (reverse)
					this.removeStatus(this.formatText(status, target, user), user, status);
				else			
					this.removeStatus(this.formatText(status, target, user), target, user);
			}
		}
		
		if (addStatuses) {
			for (const status of addStatuses) {
				if (reverse)
					this.addStatus(this.formatText(status, target, user), this.getStatus(status).duration, user, target);
				else
					this.addStatus(this.formatText(status, target, user), this.getStatus(status).duration, target, user);
			}
		}
	}
	
	tryAction(candidate, user, action) {
		
		let target = candidate.id;
		let action_info = this.getAction(action);
		for (const _case of action_info.switch) {
			let condition = this.getMaskFromSelector(_case.condition, target, user);

			if (!condition)
				continue;
			
			
			this.updateStatuses(target, user, _case.addTargetStatuses, _case.removeTargetStatuses, false);
			this.updateStatuses(target, user, _case.addUserStatuses, _case.removeUserStatuses, true);

			for (const direct_user of candidate.direct_users)
				this.updateStatuses(target, direct_user, _case.addDirectUsersStatuses, _case.removeDirectUsersStatuses, true);
			
			for (const _user of candidate.users)
				this.updateStatuses(target, _user, _case.addUsersStatuses, _case.removeUsersStatuses, true);
			
			if (_case.affect) {
				for (const group of _case.affect) {
					let mask = this.getMaskFromSelector(group.address, target, user);
					for (let i = 0; i < this.count; i++) {
						if (mask & (1 << i)) {
							if (i === target) {
								this.updateStatuses(target, user, group.addStatuses, group.removeStatuses, false);
							} else {
								this.updateStatuses(target, i, group.addStatuses, group.removeStatuses, true);
							}
							
							this.outputBuilder.addMessage(i, this.formatText(group.text, target, user));
						}
					}
				}
			}
			
			if (_case.informTarget)
				this.outputBuilder.addMessage(target, this.formatText(_case.informTarget, target, user));	
			
			if (_case.informUser)
				this.outputBuilder.addMessage(user, this.formatText(_case.informUser, target, user));	
			
			if (_case.informDirectUsers) {
				for (const id of candidate.direct_users) 
					this.outputBuilder.addMessage(id, this.formatText(_case.informDirectUsers, target, user));	
			} 
			
			if (_case.informUsers) {
				for (const id of candidate.users) 
					this.outputBuilder.addMessage(id, this.formatText(_case.informUsers, target, user));	
			}
			
			if (_case.informAll) {
				for (let i = 0; i < this.count; i++)
					this.outputBuilder.addMessage(i, this.formatText(_case.informAll, target, user));	
			}
			
			if (_case.stop === true)
				return true;
			
			if (!_case.propagate)
				break;	
		}
		
		return false;
	}
	
	update(poll_results) {
		
		//Обработка автоматического голосования вместо пользователя (например для Мести Дурака)
		for(const poll_result of poll_results) {
			for (let i = 0; i < this.count; i++) {
				let ability = this.getAbility(poll_result.id);
				let user_mask = this.getMaskFromSelector(ability.canUse);
				
				if (!(user_mask & (1 << i))) 
					continue;	
				
				if (ability.rule !== "each" && ability.autoVote && poll_result.table[i] === 0) {
					let candidate_mask = this.getMaskFromSelector(this.formatText(ability.candidates, null, i));
					let random_index = this.getRandomIndexFromMask(candidate_mask);

					if (random_index !== null)
						poll_result.table[i] = 1 << random_index;
				}
			}
		}
		
		this.updateStatusDuration();
		
		for (const ability of this.config.abilities) {
			
			if (ability.rule === "start" && this.state.day_counter > 0)
				continue;
			
			if (ability.rule !== "start" && this.state.day_counter === 0)
				continue;
			
			let poll_result = poll_results.find(item => item.id === ability.id);
			
			let candidate_mask = this.getMaskFromSelector(ability.candidates);
			let user_mask = this.getMaskFromSelector(ability.canUse);
			let selected = this.getSelected(user_mask, candidate_mask, (poll_result)? poll_result.table : null, ability);
			
			this.randomShuffle(selected);
			
			for (const candidate of selected) {
				
				if (!ability.actions)
					continue;
				
				for (const action of ability.actions) {
					this.randomShuffle(candidate.users);
					
					if (ability.rule.startsWith("most_voted")) {
						for (const user of candidate.users) {
							if (this.tryAction(candidate, user, action))
								break;
						}
					} else {
						for (const user of candidate.direct_users) 
							this.tryAction(candidate, user, action);
					}
				}
			}
		}
		
		this.updateStatusDuration();
		this.updateControlledByStatus();
		
		let time_index = this.config.times.findIndex((time) => time.id === this.state.time);

		if (time_index === -1 || time_index + 1 === this.config.times.length) {
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
	}
}

export default Engine;