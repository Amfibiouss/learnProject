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
					required: true,
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
					id: "fractions", 
					type: "array",
					required: true,
					items: 
					{
						type: "object",
						fields: [
							{id: "id",  type: "string"},
							{id: "win_condition",  type: "expression"},
							{id: "win_text",  type: "string"},
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
							{id: "self_use",  type: "boolean"},
							{id: "channel",  type: "string", from: "channels", items: {type: "string"}, not_required: true},
							{id: "rule",  type: "string"},
							{id: "showVotes",  type: "boolean", not_required: true},
							{id: "visitor_effects",  type: "array", from: "effects", items: {type: "string"}, not_required: true},
							{id: "effects",  type: "array", from: "effects", items: {type: "string"}, not_required: true},
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
					id: "effects", 
					type: "array",
					items: 
					{
						type: "object",
						fields:
						[
							{id: "id",  type: "string"},
							{id: "text_to_all",  type: "string", not_required: true},
							{id: "text_to_user",  type: "string", not_required: true},
							{id: "text_to_pollers",  type: "string", not_required: true},
							{id: "duration",  type: "number"},
							{id: "protectFrom",  type: "array", from: "effects", items: {type: "string"}, not_required: true},
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
				
				if (typeof(root_config[rules.from]) !== "undefined" && (root_config[rules.from] instanceof Array)) 
					res &= config.every((item) => root_config[rules.from].find((obj) => obj.id === item));
				
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
				if (!root_config[rules.from].find((obj) => obj.id === config)) {
					this.error = "Поле " + rules.id + " содержит неизвестное значение " + config;
					return false;
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
			
			if(!this.checkExpression(config.replaceAll(" ", ""), root_config)) {
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
		
		const keywords = ["fraction", "role", "effect", "time"];
		for (const keyword of keywords) {
			if (str.startsWith(keyword)) {
				let expr = this.getExprInBrackets(str.substring(keyword.length));

				if (expr === null)
					return [0, null];
						
				if (!config[keyword + "s"].find((elem) => expr === elem.id))
					return [0, null];
						
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
			const [len, tree] = this.getFirstComp(str, config);
			
			if (!tree)
				return null;
			
			compList.push(tree);
			str = str.substring(len);
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

