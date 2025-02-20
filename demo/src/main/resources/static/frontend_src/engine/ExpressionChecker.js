class ConfigChecker {
	 	
	constructor(config) {
		this.config = config;
		this.expMap = new Map();
		this.all_mask = (1 << 30) - 1;
	}
	
	#bitCount = (num) => {
		
		if (!num)
			return 0;
		
		let count = 0;
		while(num !== 0) {
			num = (num & (num - 1));
			count++;
		}
		
		return count;
	}
	
	#getExprInBrackets(str) {
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
	
	#getFirstOperation(str) {
		const operations = ["and", "or", "xor"];
		let res = operations.find((op) => str.startsWith(op));
		
		return (res)? res : null;
	}
	
	#getFirstComp(str) {
		let comp = null;
		let tree = null;
		
		const two_argument_functions = ["less", "greather", "equal"];
		for (const keyword of two_argument_functions) {
			if (str.startsWith(keyword)) {
				let expr = this.#getExprInBrackets(str.substring(keyword.length));
	
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
				
				let subtree = this.computeExpression(expr.substr(0, i));
				
				if (subtree === null || isNaN(number))
					return [0, null];
					
				comp = keyword + "(" + expr + ")";
				tree = {type: keyword, operand1: subtree, operand2: number};
				return [comp.length, tree];
			}
		}
		
		const one_argument_functions = ["fraction", "role", "status", "time", "cycle"];
		for (const keyword of one_argument_functions) {
			if (str.startsWith(keyword)) {
				let expr = this.#getExprInBrackets(str.substring(keyword.length));

				if (expr === null)
					return [0, null];
				
				comp = keyword + "(" + expr + ")";
				tree = {type: keyword, operand1: expr};
				
				switch(keyword) {
					case "time":
						if(!this.config["times"].some((elem) => expr === elem.id))
							return [0, null];
						break;
						
					case "cycle":
						let number = Number(expr.trim());
						if (isNaN(number))
							return [0, null];
						tree.operand1 = number;
						break;
						
					default:
						if (!this.config[(keyword != "status")? keyword + "s" : "statuses"]
								.some((elem) => (expr === elem.id || expr.startsWith(elem.id + "/"))))
							return [0, null];
						break;
				}

				return [comp.length, tree];
			}
		}
		
		const substitution_string = ["user", "target", "player"];
		for (const keyword of substitution_string) {
			if (str.startsWith(keyword)) {
				
				if (str.startsWith(keyword + "()"))
					return [(keyword + "()").length, {type: keyword}];
				
				const functions = ["status", "role", "fraction"];
				
				for (const func of functions) {		
					
					if (str.startsWith(keyword + "." + func + "(")) {
						
						let expr = this.#getExprInBrackets(str.substring((keyword + "." + func).length));
						
						if (expr === null)
							return [0, null];
						
						if (!this.config[(func !== "status")? func + "s" : "statuses"]
							.some((elem) => (expr === elem.id || expr.startsWith(elem.id + "/"))))
							return [0, null];
							
						comp = keyword + "." + func + "(" + expr + ")";
						tree = {type: keyword + "_" + func, operand1: expr};
						return [comp.length, tree];
					}
				}
			}
		}
		
		if (str.startsWith("all()")) 
			return ["all()".length, {type: "all"}];
				
		if (str.startsWith("(")) {
			let expr =this.#getExprInBrackets(str);
			tree = this.computeExpression(expr);
			
			if (!tree)
				return [0, null];
					
			comp = "(" + expr + ")";
			return [comp.length, tree];
		}
				
		if (str.startsWith("not")) {
			let expr = this.#getExprInBrackets(str.substring("not".length));
			tree = {type: "not", operand1: this.computeExpression(expr)};
			
			if (!tree.operand1)
				return [0, null];
					
			if (expr === null)
				return [0, null];
					
			comp = "not(" + expr + ")";
			return [comp.length, tree];
		}		
		
		return [0, null];
	}
	
	computeExpression(str) {
		if (!str)
			return null;
		
		const input_str = str.trim();
		
		if (this.expMap.has(input_str))
			return this.expMap.get(input_str);
		
		let compList = []
		let opList = [];
		
		while(true) {
			str = str.trim();
			const [len, tree] = this.#getFirstComp(str);
			
			if (!tree)
				return null;
			
			compList.push(tree);
			str = str.substring(len);
			str = str.trim();
			let op = this.#getFirstOperation(str);	
			
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
		
		let tree = compList.pop();
		this.expMap.set(input_str, tree);
		return tree;
	}
	
	#calcExpressionByTree = (node, context) => {
		if (!node) 
			return 0;
			
		let res = 0;
		
		switch (node.type) {
			case "all":
				res = this.all_mask;
				break;
				
			case "and":
				res = this.#calcExpressionByTree(node.operand1, context);
				if (res) 
					res &= this.#calcExpressionByTree(node.operand2, context);
				break;
					
			case "or":
				res = this.#calcExpressionByTree(node.operand1, context);
				if (res !== this.all_mask)
					res |= this.#calcExpressionByTree(node.operand2, context);
				break;
				
			case "not":
				res = this.all_mask ^ this.#calcExpressionByTree(node.operand1, context);
				break;
				
			case "less":
				res = (this.#bitCount(this.#calcExpressionByTree(node.operand1, context)) < node.operand2)? this.all_mask : 0;
				break;
				
			case "greather":
				res = (this.#bitCount(this.#calcExpressionByTree(node.operand1, context)) > node.operand2)? this.all_mask : 0;
				break;
				
			case "equal":
				res = (this.#bitCount(this.#calcExpressionByTree(node.operand1, context)) === node.operand2)? this.all_mask : 0;
				break;
				
			case "user":
				res = (typeof(context.user) === "number")? 1 << context.user : 0;
				break;
				
			case "target":
				res = (typeof(context.target) === "number")? 1 << context.target : 0;
				break;
				
			case "fraction":
				res = context.status_mask.get("fraction/" + this.formatText(node.operand1, context));
				res = (typeof(res) === "number")? res : 0;
				break;
				
			case "role":
				res = context.status_mask.get("role/" + this.formatText(node.operand1, context));
				res = (typeof(res) === "number")? res : 0;
				break;
				
			case "status":
				res = context.status_mask.get(this.formatText(node.operand1, context));
				res = (typeof(res) === "number")? res : 0;
				break;
				
			case "time":
				res = (context.time === node.operand1)? this.all_mask : 0;
				break;
			
			case "cycle":
				res = (context.day_counter === node.operand1)? this.all_mask : 0;
				break;
				
			case "user_role":
			case "user_fraction":
			case "user_status":
			case "target_role":
			case "target_fraction":
			case "target_status":
			case "player_role":
			case "player_fraction":
			case "player_status":		
				let parts = node.type.split("_");
				let keyword = parts[0];
				let func = parts[1];
				
				let status =  ((func === "status")? "" : (func + "/")) + this.formatText(node.operand1, context);
				let degree = (keyword === "user")? context.user : (keyword === "target")? context.target : context.player;
				
				if (typeof(degree) !== "number" || !context.status_mask.has(status)) {
					res = 0;
					break;
				}
				
				res = (context.status_mask.get(status) & (1 << degree))? this.all_mask : 0;

				break;
		}
		
		return res;	
	}
	
	getMaskFromSelector(selector, context) {
		if (!selector) {
			return 0;
		}
		
		let res = this.expMap.get(selector);
		
		if (res) {
			return this.#calcExpressionByTree(res, context);
		}
		else {
			let tree = this.computeExpression(selector, this.config);
			this.expMap.set(selector, tree);
			let res = this.#calcExpressionByTree(tree, context);
			//console.log(selector + " " + res);
			return res;
		}
	}
	
	#getRoleByPindex(pindex, context) {
		let res = this.config.roles.find(role => 
					context.status_mask.get("role/" + role.id) & (1 << pindex));
		return res? res.id : null;
	}
	
	#getFractionByPindex(pindex, context) {
		let res = this.config.fractions.find(fraction => 
			context.status_mask.get("fraction/" + fraction.id) & (1 << pindex));
			
		return res? res.id : null;
	}
	
	formatText = (text, context) => {
		
		if (!text)
			return null;
		
		let fields = ["user", "target", "player"];
		
		for (const field of fields) {
			text = text.replaceAll("$" + field + ".name", "Игрок #" + context[field]);
			text = text.replaceAll("$" + field + ".fraction", this.#getFractionByPindex(context[field], context));
			text = text.replaceAll("$" + field + ".role", this.#getRoleByPindex(context[field], context));
		}
		
		return text;
	}
}

export default ConfigChecker;