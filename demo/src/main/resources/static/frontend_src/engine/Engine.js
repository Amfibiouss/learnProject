import ExpressionChecker from "./ExpressionChecker.js";
import OutputBuilder from "./OutputBuilder.js";
import StateManager from "./StateManager.js";

class Engine {
	
	/*
		context = {
			target, user, player,
			status_mask, time, day_counter
		}
	*/
	getMaskFromSelector(selector, user, target, player) {
	
		let context = this.stateManager.getContext(); 
		
		context.target = target;
		context.user = user;
		context.player = player;
		
		return this.expressionChecker.getMaskFromSelector(selector, context);
	}
	
	formatText = (text, user, target, player) => {
		
		let context = this.stateManager.getContext(); 

		context.target = target;
		context.user = user;
		context.player = player;
		
		return this.expressionChecker.formatText(text, context);
	}
	
	bitCount = (num) => {
		
		if (!num)
			return 0;
		
		let count = 0;
		while(num !== 0) {
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
		this.state = {};
		this.branch = 0;
		this.count = this.config.roles.reduce((acc, item) => (acc + item.count), 0);
		this.all_mask = (1 << this.count) - 1;
		
		let permutation = Array(this.count - 1).fill().map((_, index) => index + 1);
		this.randomShuffle(permutation);
		permutation = [0].concat(permutation);
		let index = 0;
		
		for (const role of this.config.roles) {
			for (let i = 0; i < role.count; i++) {
				this.stateManager.addStatus("role/" + role.id, permutation[index], permutation[index]);
				this.stateManager.addStatus("fraction/" + role.fraction, permutation[index], permutation[index]);
				this.stateManager.addStatus("player/Игрок #" + permutation[index], permutation[index], permutation[index]);
				index++;
			}
		}
		
		index = 0;
		for (const role of this.config.roles) {
			for (let i = 0; i < role.count; i++) {
				
				if (role.revealRoles) {
					let mask = this.getMaskFromSelector(role.revealRoles, permutation[index]);
					let str = "";
					
					for (let j = 0; j < this.count; j++) {
						if (mask & (1 << j)) {
							str += this.formatText("У $user.name роль $user.role.\n", j);
						}
					}
					
					this.outputBuilder.addMessage(permutation[index], str);
				}
				
				if (role.statuses) {
					for (const status of role.statuses) {
						this.stateManager.addStatus(
							this.formatText(status, permutation[index]), 
							permutation[index]);
					}
				}
				
				this.outputBuilder.addMessage(permutation[index], this.formatText(role.description, permutation[index]));
				index++;
			}
		}
	}
	
	firstPartStart(config) {
		this.config = config;
		this.stateManager = new StateManager(this.config);
		this.expressionChecker = new ExpressionChecker(this.config);
		this.outputBuilder = new OutputBuilder(this.config, this.expressionChecker);
		this.initialize();
	}
	
	secondPartStart(poll_results) {
		this.update(poll_results);

		let output = this.outputBuilder.build(this.stateManager.getContext(), true);
			
		this.stateManager.setOutput(output.initState);
		return output;
	}
	
	start(config) {
		this.config = config;	
		this.stateManager = new StateManager(this.config);
		this.expressionChecker = new ExpressionChecker(this.config);
		this.outputBuilder = new OutputBuilder(this.config, this.expressionChecker);
		
		this.initialize();
		this.update([]);
		
		let output = this.outputBuilder.build(this.stateManager.getContext(), true);
			
		this.stateManager.setOutput(output.initState);
		return output;
	}
	
	toFuture(poll_results) {
		this.stateManager.save();
		this.outputBuilder = new OutputBuilder(this.config, this.expressionChecker);
		
		this.update(poll_results);	
		
		let output = this.outputBuilder.build(this.stateManager.getContext(), false);
		this.stateManager.setOutput(output);
		return output;
	}
	
	toPast() {
		return this.stateManager.rollback();
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
	
	updateStatuses(target, user, addStatuses, removeStatuses, reverse) {
		
		if (removeStatuses) {
			for (const status of removeStatuses) {
				if (reverse)
					this.stateManager.removeStatus(this.formatText(status, user, target), user, status);
				else			
					this.stateManager.removeStatus(this.formatText(status, user, target), target, user);
			}
		}
		
		if (addStatuses) {
			for (const status of addStatuses) {
				if (reverse)
					this.stateManager.addStatus(this.formatText(status, user, target), user, target);
				else
					this.stateManager.addStatus(this.formatText(status, user, target), target, user);
			}
		}
	}
	
	tryAction(candidate, user, action) {
		
		let target = candidate.id;
		let action_info = this.config.actions.find((item) => item.id === action);
		for (const _case of action_info.switch) {
			let condition = this.getMaskFromSelector(_case.condition, user, target);

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
					let mask = this.getMaskFromSelector(group.address, user, target);
					for (let i = 0; i < this.count; i++) {
						if (mask & (1 << i)) {
							if (i === target) {
								this.updateStatuses(target, user, group.addStatuses, group.removeStatuses, false);
							} else {
								this.updateStatuses(target, i, group.addStatuses, group.removeStatuses, true);
							}
							
							this.outputBuilder.addMessage(i, this.formatText(group.text, user, target, i));
						}
					}
				}
			}
			
			if (_case.informTarget)
				this.outputBuilder.addMessage(target, this.formatText(_case.informTarget, user, target));	
			
			if (_case.informUser)
				this.outputBuilder.addMessage(user, this.formatText(_case.informUser, user, target));	
			
			if (_case.informDirectUsers) {
				for (const id of candidate.direct_users) 
					this.outputBuilder.addMessage(id, this.formatText(_case.informDirectUsers, user, target));	
			} 
			
			if (_case.informUsers) {
				for (const id of candidate.users) 
					this.outputBuilder.addMessage(id, this.formatText(_case.informUsers, user, target));	
			}
			
			if (_case.informAll) {
				for (let i = 0; i < this.count; i++)
					this.outputBuilder.addMessage(i, this.formatText(_case.informAll, user, target));	
			}
			
			if (_case.stop === true)
				return true;
			
			if (!_case.propagate)
				break;	
		}
		
		return false;
	}
	
	handleExpireActions() {
		let statuses = this.stateManager.updateStatusDuration();
		for (const status of statuses) {
			let status_config = this.config.statuses.find(item => (item.id === status.id || status.id.startsWith(item.id + "/")));
			
			if (status_config && status_config.expireAction) {
				this.tryAction({id: status.target, users: [status.user], direct_users: [status.user]}, status.user, status_config.expireAction);
			}
		}
	}
	
	update(poll_results) {
		
		//Обработка автоматического голосования вместо пользователя (например для Мести Дурака)
		for(const poll_result of poll_results) {
			for (let i = 0; i < this.count; i++) {
				let ability = this.config.abilities.find((ability) => ability.id === poll_result.id);
				
				let user_mask = 0;
				for (let j = 0; j < this.count; j++) {
					if (this.getMaskFromSelector(ability.canUse, j) !== 0) {
						user_mask |= 1 << j;
					}
				}
					
				if (!(user_mask & (1 << i))) 
					continue;	
				
				if (ability.rule !== "each" && ability.autoVote && poll_result.table[i] === 0) {
					let candidate_mask = this.getMaskFromSelector(ability.candidates, i);
					let random_index = this.getRandomIndexFromMask(candidate_mask);

					if (random_index !== null)
						poll_result.table[i] = 1 << random_index;
				}
			}
		}
		
		this.handleExpireActions();
		
		for (const ability of this.config.abilities) {
			let poll_result = poll_results.find(item => item.id === ability.id);
			
			if (!poll_result)
				continue;
			
			let candidate_mask = this.getMaskFromSelector(ability.candidates);
			
			let user_mask = 0;
			for (let j = 0; j < this.count; j++) {
				if (this.getMaskFromSelector(ability.canUse, j) !== 0)
					user_mask |= 1 << j;
			}
			
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
		
		this.handleExpireActions();
		
		this.stateManager.updateControlledByStatus(this.outputBuilder);
		
		this.stateManager.nextTime();
		
		for (let winCase of this.config.finishConditions) {
			
			if(!this.getMaskFromSelector(winCase.condition)) {
				
				let winners_mask = this.getMaskFromSelector(winCase.winners);
				
				//console.log(winCase.winners + " " + this.getMaskFromSelector(winCase.winners) + " " + this.getMaskFromSelector(winCase.condition));

				
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