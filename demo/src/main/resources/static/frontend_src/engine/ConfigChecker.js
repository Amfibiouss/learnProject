import ExpressionChecker from "./ExpressionChecker.js";

class ConfigChecker { 
	
	checkConfig(config) {
		
		this.error = "";
		this.expressionChecker = new ExpressionChecker(config);
		
		const rules = { 
			type: "object",
			fields: 
			[
				{
					id: "times", 
					type: "array",
					items: 
					{
						type: "object",
						fields: [
							{id: "id",  type: "string"},
							{id: "duration", type: "number", min: 10000, max: 300000}
						] 
					}
				},
				
				{
					id: "finishConditions", 
					type: "array",
					items: 
					{
						type: "object",
						fields: [
							{id: "condition",  type: "expression"},
							{id: "winners",  type: "expression"},
							{id: "winText",  type: "string"},
							{id: "loseText",  type: "string"},
							{id: "winTextAll",  type: "string", not_requied: true},
						] 
					}
				},
				
				{
					id: "fractions", 
					type: "array",
					items: 
					{
						type: "object",
						fields: [
							{id: "id",  type: "string"},
						]
					}
				},
				
				{
					id: "roles", 
					type: "array",
					items: 
					{
						type: "object",
						fields:
						[
							{id: "id",  type: "string"},
							{id: "description",  type: "string"},
							{id: "fraction", from: "fractions", type: "string"},
							{id: "statuses",  type: "array", items: {type: "string"}, not_required: true},
							{id: "revealRoles",  type: "expression", not_required: true},
							{id: "count",  type: "number", min: 0},
						]
					}
				},
				
				{
					id: "abilities", 
					type: "array",
					items: 
					{
						type: "object",
						fields:
						[
							{id: "id",  type: "string"},
							{id: "description",  type: "string"},
							{id: "candidates",  type: "expression", not_required: true},
							{id: "canUse",  type: "expression", not_required: true},
							{id: "channel",  type: "string", from: "channels", items: {type: "string"}, not_required: true},
							{id: "rule",  type: "string"},
							{id: "autoVote",  type: "boolean", not_required: true},
							{id: "showVotes",  type: "boolean", not_required: true},
							{id: "actions",  type: "array", from: "actions", items: {type: "string"}, not_required: true},
							
						]
					}
				},
				
				{
					id: "channels", 
					type: "array",
					items: 
					{
						type: "object",
						fields:
						[
							{id: "id",  type: "string"},
							{id: "canRead",  type: "expression", not_required: true},
							{id: "canAnonymousRead",  type: "expression", not_required: true},
							{id: "canWrite",  type: "expression", not_required: true},
							{id: "canAnonymousWrite",  type: "expression", not_required: true},
							{id: "color",  type: "color"},
						]
					}					
				},
				
				{
					id: "actions", 
					type: "array",
					items: 
					{
						type: "object",
						fields:
						[
							{
								id: "id",  
								type: "string"
							},
							{
								id: "switch",  type: "array", items: 
								{
									type: "object",
									fields: [
										{id: "condition", type: "expression"},
										{id: "addTargetStatuses", type: "array", items: {type: "string"}, from: "statuses", not_required: true},
										{id: "addUserStatuses", type: "array", items: {type: "string"}, from: "statuses", not_required: true},
										{id: "addDirectUsersStatuses", type: "array", items: {type: "string"}, from: "statuses", not_required: true},
										{id: "addUsersStatuses", type: "array", items: {type: "string"}, from: "statuses", not_required: true},
										{id: "removeTargetStatuses", type: "array", items: {type: "string"}, from: "statuses", not_required: true},
										{id: "removeUserStatuses", type: "array", items: {type: "string"}, from: "statuses", not_required: true},
										{id: "removeDirectUsersStatuses", type: "array", items: {type: "string"}, from: "statuses", not_required: true},
										{id: "removeUsersStatuses", type: "array", items: {type: "string"}, from: "statuses", not_required: true},	
										{id: "informTarget", type: "string", not_required: true},
										{id: "informUser", type: "string", not_required: true},
										{id: "informDirectUsers", type: "string", not_required: true},
										{id: "informUsers", type: "string", not_required: true},
										{id: "informAll", type: "string", not_required: true},
										{
											id: "affect", 
											type: "array", 
											items: {
												type: "object",
												fields: [
													{id: "address", type: "expression"},
													{
														id: "addStatuses", 
														type: "array", 
														items: {type:"string"}, 
														from: "statuses",
														not_required: true
													},
													{
														id: "removeStatuses", 
														type: "array", 
														items: {type:"string"}, 
														from: "statuses", 
														not_required: true
													},
													
													{
														id: "text", 
														type: "string",
														not_required: true
													},
												]
											},
											not_required: true
										},
										{id: "propagate", type: "boolean", not_required: true},
										{id: "stop", type: "boolean", not_required: true},
									]								
								}
							},
						]
					}		
				},
				
				{
					id: "statuses",
					type: "array",
					items: 
					{
						type: "object",
						fields: [
							{id: "id", type: "string"},
							{id: "duration", type: "number"},
							{id: "expireAction", type: "string", from: "actions",  not_required: true},
						]
					}
				}
			]
		};
		
		if (!config) {
			this.error = "передана пустая конфигурация";
			return false;
		}
		
		config = JSON.parse(JSON.stringify(config));
		
		let fields = ["statuses", "abilities", "actions", "times", "roles", "fractions"];
		
		for (const field of fields) {
			if (typeof(config[field]) === "undefined") {
				this.error = "У конфигурации нету обязательного поля " + field;
				return false;	
			}
			
			if (!(config[field] instanceof Array)) {
				this.error = "поле " + field + " должно быть списком.";
				return false;	
			}
		}
		
		config.statuses.push({id: "role", duration: -1});
		config.statuses.push({id: "fraction", duration: -1});
		config.statuses.push({id: "player", duration: -1});
		config.statuses.push({id: "controlledBy", duration: -1});
		config.statuses.push({id: "earsControlledBy", duration: -1});
		config.statuses.push({id: "tongueControlledBy", duration: -1});
		return this.#check1(rules, config, config);
	}
	
	#formatObject(obj) {
		let res = "{";
		let isFirst = true;
			
		for (const property in obj) {
			
			if (!isFirst) {
				res += ", ";
			}
			
			res += property + ": " + obj[property];
			
			isFirst = false;
		}
		
		res += "}";
		return res;
	}
	
	#check1(rules, config, root_config) {
		
		if (rules.type === "array") {
			
			if (!(config instanceof Array)) {
				this.error = "Поле " + rules.id + " должно хранить " + rules.type + ", но хранит " + config + ".";
				return false;
			}
			
			let res = config.every((item) => this.#check1(rules.items, item, root_config));
			
			if (res && rules.items.type === "string") {
				
				if (rules.from === "statuses" || rules.from === "fractions" || rules.from === "roles") {
					if (!config.every((item) => root_config[rules.from].some(
						(obj) => (obj.id === item || item.startsWith(obj.id + "/"))))) {
						
						let unknown_item = config.find((item) => !root_config[rules.from].find(
							(obj) => (obj.id === item || item.startsWith(obj.id + "/"))));
						this.error = "Поле " + rules.id + " содержит неизвестный элемент " + unknown_item;
						return false;
					}
				} else {
					if (rules.from && !config.every((item) => root_config[rules.from].some((obj) => obj.id === item))) {
						let unknown_item = config.find((item) => !root_config[rules.from].find((obj) => obj.id === item));
						this.error = "Поле " + rules.id + " содержит неизвестный элемент " + unknown_item;	
						return false;
					}
				}
			}
			
			return res;
		}
		
		if (rules.type === "object") {
			if (typeof(config) !== rules.type) {
				this.error = "Поле " + rules.id + " должно хранить " + rules.type + ", но хранит " + config + ".";
				return false;
			}
			
			let keys = Object.keys(config);
			
			if (!rules.fields.filter((field) => !(field.not_required)).every((field) => keys.find((key) => key === field.id))) {
				let skipped_field = rules.fields.filter((field) => !(field.not_required)).find((field) => !keys.find((key) => key === field.id));
								
				this.error = "Обьект " + this.#formatObject(config) + " не содержит обязательное поле: " + skipped_field.id + "."; 
				return false;
			}
			
			return keys.every((key) => {
				
				let field = rules.fields.find((field) => field.id === key);
				
				if (!field) {
					this.error = "Обьект " + this.#formatObject(config) + " хранит поле " + key + ", которого быть не должно.";
					return false;
				}
				
				return this.#check1(field, config[key], root_config);
			});
		}
		
		if (rules.type === "string") {
			if (typeof(config) !== rules.type) {
				
				this.error = "Поле " + rules.id + " должно хранить " + rules.type + ", но хранит " + config + ".";
				return false;
			}
			
			if (rules.from && typeof(root_config[rules.from]) !== "undefined" && (root_config[rules.from] instanceof Array)) {
				
				if (rules.from === "statuses" || rules.from === "fractions" || rules.from === "roles") {
					if (!root_config[rules.from].some((obj) => (obj.id === config || config.startsWith(obj.id + "/")))) {
						
						this.error = "Поле " + rules.id + " содержит неизвестное значение " + config;
						return false;
					}
				} else {
					if (!root_config[rules.from].some((obj) => obj.id === config)) {
						this.error = "Поле " + rules.id + " содержит неизвестное значение " + config;
						return false;
					}
				}
			}
			
			return true;
		}
		
		if (rules.type === "number") {
			if (typeof(config) !== rules.type) {
				
				this.error = "Поле " + rules.id + " должно хранить " + rules.type + ", но хранит " + config + ".";
				return false;
			}
			
			if (rules.min && rules.min > config) {
				this.error = "Поле " + rules.id + " меньше своего минимального значения " + rules.min + ", оно хранит " + config + ".";
				return false;
			}
			
			if (rules.max && rules.max < config) {
				this.error = "Поле " + rules.id + " больше своего максимального значения " + rules.max + ", оно хранит " + config + ".";
				return false;
			}
			
			return true;
		}
		
		if (rules.type === "boolean") {
			if (typeof(config) !== rules.type) {
				this.error = "Поле " + rules.id + " должно хранить " + rules.type + ", но хранит " + config + ".";
				return false;
			}
			return true;
		}
		
		if (rules.type === "color") {
			if (typeof(config) !== "string") {
				this.error = "Поле " + rules.id + " должно хранить " + rules.type + ", но хранит " + config + ".";
				return false;
			}
			if (!(/^#([a-z0-9]{6})$/.test(config))) {
				this.error = "Неправильный формат для цвета. Обнаружено " + config + ", а правильный формат, это #4e5fac например.";
				return false;
			}
			
			return true;
		}
		
		if (rules.type === "expression") {
			if (typeof(config) !== "string") {
				this.error = "Поле " + rules.id + " должно хранить " + rules.type + ", но хранит " + config + ".";
				return false;
			}
			
			if(!this.expressionChecker.computeExpression(config)) {
				this.error = "Поле " + rules.id + " содержит некорректное выражение " + config + ".";
				return false;	
			}
			
			return true;
		}
		
		return false;
	}
}

export default ConfigChecker;

