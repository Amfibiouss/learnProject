class StateManager {

	StateManager (config) {
		this.statuses = [];
		this.status_counters = new Array(30).fill(new Map());
		this.status_masks = new Map();
		this.config = config;
	}
	
	getRole(pindex) {
		
	}
	
	getFraction(pindex) {
		
	}
	
	addStatus(status, duration, target, user) {
		status = this.formatText(status, target, user);
		this.statuses.push({id: status, duration: duration, target: target, user: user});
		
		let parts = status.split("/");
		let path = "";
		
		for (const part of parts) {
			path += part;
			if (this.status_counters[target].has(path)) {
				let count = this.status_counters[target].get(path);
				this.status_counters[target].set(path, count + 1);
			} else {
				this.status_counters[target].set(path, 1);
				
				if (this.status_masks.has(path)) {
					this.status_masks.set(path, this.status_masks.get(path) ^ (1 << target));
				} else {
					this.status_masks.set(path, 1 << target);
				}
			}
			
			path += "/";
		}
		
		//player.statuses.push({id: status, duration: duration, target: target, user: user});
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
	
}

export default StateManager;