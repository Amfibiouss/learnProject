class ConfigChecker { 
	
	checkConfig(config) {
		
		this.error = "";
		
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
							{id: "count",  type: "number", min: 0},
							{id: "statuses",  type: "array", items: {type: "string"}, not_required: true},
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
								id: "reactions",  type: "array", items: 
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
											id: "inform", 
											type: "array", 
											items: {
												type: "object",
												fields: [
													{id: "address", type: "expression"},
													{id: "text", type: "string"},
												]
											},
											not_required: true
										},
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
				
				if (typeof(root_config[rules.from]) !== "undefined" && (root_config[rules.from] instanceof Array)) {
					switch (rules.from) {
						case "statuses":
							res = config.every((item) => root_config[rules.from].some((obj) => 
								(obj.id === item || item.startsWith(obj.id + "/") 
								|| item.startsWith("player/") || item.startsWith("fraction/") 
								|| item.startsWith("role/") ||  item.startsWith("controlledBy/"))));
							break;
						case "roles":
						case "fractions":
							res = config.every((item) => root_config[rules.from].some(
								(obj) => (obj.id === item || item.startsWith(obj.id + "/"))));
							break;
						default:
							res = config.every((item) => root_config[rules.from].some(
								(obj) => obj.id === item));
					}
				}
				
				if (!res) {
					let unknown_item = config.find((item) => !root_config[rules.from].find((obj) => obj.id === item));
					this.error = "Поле " + rules.id + " содержит не известный элемент " + unknown_item;
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
			
			if(!this.checkExpression(config, root_config)) {
				this.error = "Поле " + rules.id + " содержит некорректное выражение " + config + ".";
				return false;	
			}
			
			return true;
		}
		
		return false;
	}
	
	getExprInBrackets(str) {
		if	(!str.startsWith("("))
			return null;
		
		let balance = 1;
		
		for (let i = 1; i < str.length; i++) {
			if (str.at(i) === "(")
				balance++;	
			
			if (str.at(i) === ")")
				balance--;	
			
			if (balance === 0)
				return str.substring(1, i);
		}
		
		return null;
	}
	
	getFirstOperation(str) {
		const operations = ["and", "or", "xor"];
		let res = operations.find((op) => str.startsWith(op));
		
		return (res)? res : null;
	}
	
	getFirstComp(str, config) {
		let comp = null;
		let tree = null;
		
		const two_argument_functions = ["less", "greather", "equal"];
		for (const keyword of two_argument_functions) {
			if (str.startsWith(keyword)) {
				let expr = this.getExprInBrackets(str.substring(keyword.length));
	
				if (expr === null)
					return [0, null];
					
				let i;
				for (i = expr.length - 1; i >= 0; i--) {
					if (expr.substr(i, 1) === ",")
						break;
				}
				
				if (i === -1)
					return [0, null];
				
				let number = Number(expr.substr(i + 1).trim());
				
				let subtree = this.checkExpression(expr.substr(0, i), config);
				
				if (subtree === null || isNaN(number))
					return [0, null];
					
				comp = keyword + "(" + expr + ")";
				tree = {type: keyword, operand1: subtree, operand2: number};
				break;
			}
		}
		
		const keywords = ["fraction", "role", "status", "time"];
		for (const keyword of keywords) {
			if (str.startsWith(keyword)) {
				let expr = this.getExprInBrackets(str.substring(keyword.length));

				if (expr === null)
					return [0, null];
				
				switch (keyword) {
					case "time":
						if(!config["times"].some((elem) => expr === elem.id))
							return [0, null];
						break;
					case "status":
						if (!expr.startsWith("player/") && !expr.startsWith("role/") 
						&& !expr.startsWith("fraction/") && !expr.startsWith("controlledBy/")
						&& !config["statuses"].some((elem) => (expr === elem.id || expr.startsWith(elem.id + "/"))))
							return [0, null];
						break;
					default:
						if (keyword !== "status" && !config[keyword + "s"].some((elem) => (expr === elem.id || expr.startsWith(elem.id + "/"))))
							return [0, null];
					
				}
						
				comp = keyword + "(" + expr + ")";
				tree = {};
				tree[keyword] = expr;
				break;
			}
		}
				
		if (str.startsWith("(")) {
			let expr =this.getExprInBrackets(str);
			tree = this.checkExpression(expr, config);
			
			if (!tree)
				return [0, null];
					
			comp = "(" + expr + ")";
		}
				
		if (str.startsWith("not")) {
			let expr = this.getExprInBrackets(str.substring("not".length));
			tree = {type: "not", operand1: this.checkExpression(expr, config)};
			
			if (!tree.operand1)
				return [0, null];
					
			if (expr === null)
				return [0, null];
					
			comp = "not(" + expr + ")";
		}		
		
		if (str.startsWith("all()")) {
			tree = {type: "all"};
					
			comp = "all()";
		}	
		
		if (comp === null) {
			return [0, null];
		}
		
		return [comp.length, tree];
	}
	
	checkExpression(str, config) {
		if (!str)
			return null;
		
		let compList = []
		let opList = [];
		
		while(true) {
			str = str.trim();
			const [len, tree] = this.getFirstComp(str, config);
			
			if (!tree)
				return null;
			
			compList.push(tree);
			str = str.substring(len);
			str = str.trim();
			let op = this.getFirstOperation(str);	
			
			if (!op)
				break;
			opList.push(op);
			str = str.substring(op.length);
		}
		
		if (str !== "")
			return null;

		while (opList.length > 0) {
			for (const operation of  ["and", "xor", "or"]) {
				let index = opList.findIndex((op) => op === operation);

				if (index !== -1) {
					opList.splice(index, 1);
					let operand1 = compList.at(index);	
					let operand2 = compList.at(index + 1);
					compList.splice(index, 2, {type: operation, operand1: operand1, operand2: operand2});
					break;
				}
			}
		}
		
		return compList.pop();
	}
}

export default ConfigChecker;

