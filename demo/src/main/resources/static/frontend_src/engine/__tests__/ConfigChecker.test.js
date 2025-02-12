import ConfigChecker from "../ConfigChecker.js"

let test_config = require("../default_room_config.json");

test("Проверка правильной конфигурации", () => {
	let config = JSON.parse(JSON.stringify(test_config));
	let checker = new ConfigChecker();
	let res = checker.checkConfig(config);
	console.log(checker.error);
	expect(res).toBe(true);
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
	config.abilities[0].actions.push("uncorrect action");
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

