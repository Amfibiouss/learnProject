import EngineTester from "../EngineTester.js"

test("Проверка действенности защиты", () => {

	let tester = new EngineTester();
	
	var player1 = tester.createPlayer("Игрок 1", "Доктор");
	var player2 = tester.createPlayer("Игрок 2", "Горожанин");
	var player3 = tester.createPlayer("Игрок 3", "Мафия");
	
	player1.vote("Лечение", player2);
	player3.vote("Ночное голосование", player2);
	player2.next().no_effect("Мертвый");
	
	tester.play(tester.initialize());
});

test("Проверка продолжительности защиты", () => {

	let tester = new EngineTester();
	
	let player1 = tester.createPlayer("Игрок 1", "Доктор");
	let player2 = tester.createPlayer("Игрок 2", "Горожанин");
	let player3 = tester.createPlayer("Игрок 3", "Мафия");

	player1.vote("Лечение", player2);
	player3.next().vote("Дневное голосование", player2);
	player2.next().next().effect("Мертвый");

	tester.play(tester.initialize());
});

test("Проверка условий победы", () => {

	let tester = new EngineTester();
	
	let player1 = tester.createPlayer("Игрок 1", "Мафия");
	let player2 = tester.createPlayer("Игрок 2", "Горожанин");

	player1.vote("Ночное голосование", player2).next().win();
	player2.next().lose();

	tester.play(tester.initialize());
});

test("Проверка блока", () => {

	let tester = new EngineTester();
	
	let player1 = tester.createPlayer("Игрок 1", "Любовница");
	let player2 = tester.createPlayer("Игрок 2", "Мафия");

	player1.vote("Любовь", player2).next().no_effect("Мертвый")
		.next().next().lose();
	player2.vote("Ночное голосование", player1).next().no_vote("Дневное голосование").
		next().vote("Ночное голосование", player1).next().win();

	tester.play(tester.initialize());
});

test("Проверка способности Следопыта", () => {

	let tester = new EngineTester();
	
	let player1 = tester.createPlayer("Игрок 1", "Следопыт");
	let player2 = tester.createPlayer("Игрок 2", "Мафия");
	let player3 = tester.createPlayer("Игрок 3", "Мафия");
	let player4 = tester.createPlayer("Игрок 4", "Горожанин");

	let init_data = tester.initialize();
	
	player1.vote("Слежка", player4).next()
	.message(player2 + " ночью посетил игрока " + player4 + ".")
	.message(player3 + " ночью посетил игрока " + player4 + ".");
	player2.vote("Ночное голосование", player4).next();
	player3.vote("Ночное голосование", player4).next();

	tester.play(init_data);
});

test("Проверка ограничения на количество голосов", () => {

	let tester = new EngineTester();
	
	let player1 = tester.createPlayer("Игрок 1", "Горожанин");
	let player2 = tester.createPlayer("Игрок 2", "Мафия");
	let player3 = tester.createPlayer("Игрок 3", "Мафия");

	player1.next().vote("Дневное голосование", player2).vote("Дневное голосование", player3).next();
	expect(() => tester.play(tester.initialize())).toThrow(Error);
});

test("Проверка ограничения на использование способности на себе", () => {

	let tester = new EngineTester();
	
	let player1 = tester.createPlayer("Игрок 1", "Доктор");
	let player2 = tester.createPlayer("Игрок 2", "Мафия");

	player1.vote("Лечение", player1);
	expect(() => tester.play(tester.initialize())).toThrow(Error);
});

