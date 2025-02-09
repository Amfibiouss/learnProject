import ConfigChecker from "../ConfigChecker.js"

let test_config = {
	times: [{id: "День", duration: 10000}, {id: "Ночь", duration: 10000}],
	
	fractions: [
		{
			id: "Горожане",
			win_condition: "fraction(Мафия) and not(effect(Мертвый))",
			win_text: "Горожане искоренили мафию из города."
		},
		 
		{
			id: "Мафия",
			win_condition: "fraction(Горожане) and not(effect(Мертвый))",
			win_text: "Мафия получила полное господство над городом."
		}
	],
	
	roles: [
		{
			id: "Горожанин",
			fraction: "Горожане",
			description: "Вы простой трудяга. Вы принадлежите фракции горожан.",
			count: 11
		},
		
		{
			id: "Мафия",
			fraction: "Мафия",
			description: "Убивай, убивай, убивай!",
			count: 1
		}
	],
	
	abilities: [
		{
			id: "Дневное голосование",
			description: "Умрет тот, за кого проголосовало больше. При равном количество голосов никто не умирает.",
			candidates: "not(effect(Мертвый))",
			canUse: "time(День) and not(effect(Мертвый))",
			self_use: true,
			rule: "most_voted",
			effects: ['Мертвый']
		},
		
		{
			id: "Ночное голосование",
			description: "Умрет тот, за кого проголосовало больше. При равном количество голосов никто не умирает.",
			candidates: "fraction(Горожане) and not(effect(Мертвый))",
			canUse:  "time(Ночь) and fraction(Мафия) and not(effect(Мертвый))",
			self_use: false,
			rule: "most_voted",
			effects: ['Мертвый']
		}
	],
	
	channels: [
		{
			id: "Общий",
			canRead: "all()",
			canWrite:  "time(День) and not(effect(Мертвый))",
			color: "#007700",
		},
		
		{
			id: "Мафия",
			canRead: "fraction(Мафия)",
			canWrite:  "fraction(Мафия) and not(effect(Мертвый))",
			color: "#aa0000"
		}
	],
	
	effects: 
	[
		{
			id: "Мертвый",
			text_to_all: "$target.name погиб.",
			text_to_user: "Вы погибли.",
			duration: -1,
			protectFrom: [] 
		}
	]
};


test("Проверка правильной конфигурации", () => {
	let checker = new ConfigChecker();
	
	expect(checker.checkConfig(test_config)).toBe(true);
});

test("Проверка конфигурации без обязательного поля", () => {
	let config = JSON.parse(JSON.stringify(test_config));
	delete config.channels;
	let checker = new ConfigChecker();
	
	expect(checker.checkConfig(config)).toBe(false);
});

test("Проверка конфигурации с неизвестным полем", () => {
	let config = JSON.parse(JSON.stringify(test_config));
	config.fractions[0]["strange_field"] = "strange_value";
	let checker = new ConfigChecker();
	
	expect(checker.checkConfig(config)).toBe(false);
});

test("Проверка конфигурации с неправильным типом поля", () => {
	let config = JSON.parse(JSON.stringify(test_config));
	config.fractions[0].id = {};
	let checker = new ConfigChecker();
	
	expect(checker.checkConfig(config)).toBe(false);
});

test("Проверка конфигурации с неправильным типом элемента массива", () => {
	let config = JSON.parse(JSON.stringify(test_config));
	config.fractions.push(42);
	let checker = new ConfigChecker();
	
	expect(checker.checkConfig(config)).toBe(false);
});

test("Проверка конфигурации с неприемлемым значением строкового поля", () => {
	let config = JSON.parse(JSON.stringify(test_config));
	config.roles[0].fraction = "uncorrect fraction";
	let checker = new ConfigChecker();
	
	expect(checker.checkConfig(config)).toBe(false);
});

test("Проверка конфигурации с неприемлемым элементом в массиве строк", () => {
	let config = JSON.parse(JSON.stringify(test_config));
	config.abilities[0].effects.push("uncorrect effect");
	let checker = new ConfigChecker();
	
	expect(checker.checkConfig(config)).toBe(false);
});

test("Проверка конфигурации с неприемлемым выражением", () => {
	let config = JSON.parse(JSON.stringify(test_config));
	config.channels[0].canWrite = "uncorrect expression";
	let checker = new ConfigChecker();
	
	expect(checker.checkConfig(config)).toBe(false);
});

test("Проверка конфигурации с неприемлемым числовым полем", () => {
	let config = JSON.parse(JSON.stringify(test_config));
	config.times[0].duration = -1;
	let checker = new ConfigChecker();
	
	expect(checker.checkConfig(config)).toBe(false);
});

