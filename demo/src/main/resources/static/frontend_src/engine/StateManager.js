class StateManager {
	
	constructor(config) {
		this.config = config;
		this.status_mask = new Map();
		this.statuses = [];
		this.status_count = [];
		this.branch = 0;
		
		this.output = null;
		this.previous = null;
		
		this.count = this.config.roles.reduce((acc, item) => (acc + item.count), 0);
		
		for (let i = 0; i < this.count; i++)
			this.status_count.push(new Map());
		
		this.time = null;
		this.day_counter = 0;
	}
	
	#randomShuffle(arr) {
		
		for (let i = 1; i < arr.length; i++) {
			let index = Math.floor(Math.random() * i);
			let temp = arr[i];
			arr[i] = arr[index];
			arr[index] = temp;
		}	
	}
	
	nextTime() {
		let time_index = this.config.times.findIndex((time) => time.id === this.time);

		if (time_index === -1 || time_index + 1 === this.config.times.length) {
			time_index = 0;
			this.day_counter++;
		}
		else time_index++;
		
		this.time = this.config.times[time_index].id;
	}
	
	save() {
		this.previous = structuredClone({
			status_mask: this.status_mask,
			statuses: this.statuses,
			status_count: this.status_count,
			branch: this.branch,
			output: this.output,
			time: this.time,
			day_counter: this.day_counter,
			previous: this.previous
		});
	}
	
	rollback() {
		if (this.previous === null)
			return null;
		
		this.status_mask = this.previous.status_mask;
		this.statuses = this.previous.statuses;
		this.status_count = this.previous.status_count;
		this.branch = this.previous.branch;
		this.day_counter = this.previous.day_counter,
		this.time = this.previous.time;
		this.output = this.previous.output;
		this.previous = this.previous.previous;
		
		this.branch++;
		this.output.stage = this.time + " #" + this.day_counter + " @" + this.branch
		
		return this.output;
	}
	
	setOutput(output) {
		this.output = output;
	}
	
	getContext() {
		return {
			status_mask: this.status_mask,
			time: this.time,
			day_counter: this.day_counter,
			branch: this.branch
		}
	}
	
	addStatus(status, target, user) {
		let status_config = this.config.statuses.find(item => (item.id === status || status.startsWith(item.id + "/")));
		this.statuses.push({id: status, duration: status_config.duration, target: target, user: user});
		
		let parts = status.split("/");
		let path = "";
		
		for (const part of parts) {
			path += part;
			if (this.status_count[target].has(path)) {
				let count = this.status_count[target].get(path);
				this.status_count[target].set(path, count + 1);
			} else {
				this.status_count[target].set(path, 1);
				
				if (this.status_mask.has(path)) {
					this.status_mask.set(path, this.status_mask.get(path) ^ (1 << target));
				} else {
					this.status_mask.set(path, 1 << target);
				}
			}
			
			path += "/";
		}
		
		//console.log("@@@@" + status + " " + target + " " + user);
	}
	
	removeStatus(status, target, user) {
		
		let index = this.statuses.findIndex(item => (item.target === target && (item.id === status || item.id.startsWith(status + "/"))));

		if (index === -1)
			return;

		status = this.statuses[index].id;
		//console.log("####" + status  + " " + target + " " + user);
		
		this.statuses.splice(index, 1);
		
		let parts = status.split("/");
		let path = "";
		
		for (const part of parts) {
			path += part;
			if (this.status_count[target].has(path)) {
				let count = this.status_count[target].get(path);
				this.status_count[target].set(path, count - 1);
				if (count === 1) {
					this.status_count[target].delete(path);
					this.status_mask.set(path, this.status_mask.get(path) ^ (1 << target));
					this.status_mask[path] ^= 1 << target;
				}
			}
			path += "/";
		}
	}

	updateStatusDuration() {
		
		this.#randomShuffle(this.statuses);
		
		for (const status of this.statuses) {

			if (status.duration < 0)
				continue;
				
			status.duration -= 0.5;
		}
		
		let expireStatuses = [];
			
		while(true) {
			let index = this.statuses.findIndex((item) => item.duration === 0);
			
			if (index === -1)
				break;

			let status = this.statuses[index];
			this.removeStatus(status.id, status.target, status.user);
			expireStatuses.push(status);
		}
		
		return expireStatuses;
	}	

	updateControlledByStatus(outputBuilder) {
		
		this.#randomShuffle(this.statuses);

		for (const status of this.statuses) {
			
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
				outputBuilder.setControlledBy(status.target, user, resourceId);
			else if (status.id.startsWith("earsControlledBy/")) {
				outputBuilder.setEarsControlledBy(status.target, user, resourceId);
			} else {
				outputBuilder.setTongueControlledBy(status.target, user, resourceId);
			}
		}
	}	
}

export default StateManager;