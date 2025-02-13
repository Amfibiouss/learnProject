import EngineTester from "../EngineTester.js"

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

test("Проверка действенности защиты", () => {

	let tester = new EngineTester();
	
	var player1 = tester.createPlayer("Игрок 1", "Доктор");
	var player2 = tester.createPlayer("Игрок 2", "Горожанин");
	var player3 = tester.createPlayer("Игрок 3", "Мафия");
	
	player1.vote("Лечение", player2);
	player3.vote("Ночное голосование", player2);
	player2.next().no_status("Мертвый");
	
	tester.play(tester.initialize());
});

test("Проверка продолжительности защиты", () => {

	let tester = new EngineTester();
	
	let player1 = tester.createPlayer("Игрок 1", "Доктор");
	let player2 = tester.createPlayer("Игрок 2", "Горожанин");
	let player3 = tester.createPlayer("Игрок 3", "Мафия");

	player1.vote("Лечение", player2);
	player3.next().vote("Дневное голосование", player2);
	player2.next().next().status("Мертвый");

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

	player1.vote("Любовь", player2).next().no_status("Мертвый")
		.next().next().lose();
	player2.vote("Ночное голосование", player1).next().no_vote("Дневное голосование").
		next().vote("Ночное голосование", player1).next().win();

	tester.play(tester.initialize());
});

test("Проверка способности Шерифа", () => {

	let tester = new EngineTester();
	
	let player1 = tester.createPlayer("Игрок 1", "Шериф");
	let player2 = tester.createPlayer("Игрок 2", "Мафия");
	let player3 = tester.createPlayer("Игрок 3", "Дурак");

	let init_data = tester.initialize();
	
	player1.vote("Расследование", player3).next().message("Вы провели расследование в отношении " + player3 + ". Он принадлежит фракции Нейтрал.");
	player3.next().message("Кто-то раскрыл к какой фракции вы принадлежите");

	tester.play(init_data);
});

test("Проверка способности Следопыта", () => {

	let tester = new EngineTester();
	
	let player1 = tester.createPlayer("Игрок 1", "Следопыт");
	let player2 = tester.createPlayer("Игрок 2", "Мафия");
	let player3 = tester.createPlayer("Игрок 3", "Доктор");
	let player4 = tester.createPlayer("Игрок 4", "Горожанин");

	let init_data = tester.initialize();
	
	player1.vote("Слежка", player4).next()
	.message(player2 + " посещал ночью " + player4)
	.message(player3 + " посещал ночью " + player4);
	player2.vote("Ночное голосование", player4).next();
	player3.vote("Лечение", player4).next();

	tester.play(init_data);
});

test("Проверка способности Дурака", () => {

	let tester = new EngineTester();
	
	let player1 = tester.createPlayer("Игрок 1", "Дурак");
	let player2 = tester.createPlayer("Игрок 2", "Горожанин");
	let player3 = tester.createPlayer("Игрок 3", "Мафия");

	let init_data = tester.initialize();
	
	player1.next().next();
	player2.next().vote("Дневное голосование", player1).next();
	player1.vote("Месть Дурака", player2).next().win();
	player2.next().status("Мертвый/Убит дураком").lose();
	player3.next().next().next().win();
	
	tester.play(init_data);
});

test("Проверка проигрыша Дурака", () => {

	let tester = new EngineTester();
	
	let player1 = tester.createPlayer("Игрок 1", "Дурак");
	let player2 = tester.createPlayer("Игрок 2", "Горожанин");
	let player3 = tester.createPlayer("Игрок 3", "Мафия");

	let init_data = tester.initialize();
	
	player1.next().next().no_vote("Месть Дурака", player3).next().lose();
	player3.vote("Ночное голосование", player1).next().next().vote("Ночное голосование", player2).next().win();
	
	tester.play(init_data);
});

test("Проверка автоголосования Дурака", () => {

	let tester = new EngineTester();

	let player1 = tester.createPlayer("Игрок 1", "Дурак");
	let player2 = tester.createPlayer("Игрок 2", "Горожанин");
	let player3 = tester.createPlayer("Игрок 3", "Мафия");

	let init_data = tester.initialize();

	player1.next().next();
	player2.next().vote("Дневное голосование", player1).next();
	player1.next().win();
	player2.next().status("Мертвый/Убит дураком").lose();
	player3.next().next().next().win();

	tester.play(init_data);
});

test("Проверка способностей маньяка", () => {

	let tester = new EngineTester();
	
	let player1 = tester.createPlayer("Игрок 1", "Маньяк");
	let player2 = tester.createPlayer("Игрок 2", "Любовница");
	let player3 = tester.createPlayer("Игрок 3", "Горожанин");
	let player4 = tester.createPlayer("Игрок 4", "Мафия");

	let init_data = tester.initialize();
	
	player1.vote("Охота", player3).next()
		.message("На вас напали, но вы отбили нападение")
		.message("Вы убили " + player2 + " когда он пришел к вам в гости.")
		.message("Вы напали на " + player3 + ".");
	player2.vote("Любовь", player1).next().message("Вы пришли к " + player1 + " и он убил вас!").status("Мертвый");
	player3.next().status("Мертвый");
	player4.vote("Ночное голосование", player1).next().message("Вы напали на " + player1 + ", но не смогли его убить.");
	
	player1.vote("Дневное голосование", player4).next().win();
	player4.next().lose();
		
	tester.play(init_data);
});

test("Проверка последнего слова", () => {

	let tester = new EngineTester();

	let player1 = tester.createPlayer("Игрок 1", "Горожанин");
	let player2 = tester.createPlayer("Игрок 2", "Горожанин");
	let player3 = tester.createPlayer("Игрок 3", "Мафия");

	let init_data = tester.initialize();

	player3.vote("Ночное голосование", player2).next();
	player2.next().can_write("Последнее слово");

	tester.play(init_data);
});


test("Проверка способностей Дона", () => {

	let tester = new EngineTester();

	let player1 = tester.createPlayer("Игрок 1", "Шериф");
	let player2 = tester.createPlayer("Игрок 2", "Дон");
	let player3 = tester.createPlayer("Игрок 3", "Мафия");

	let init_data = tester.initialize();

	//Ночь 1 Иммунитет к Шерифу
	player1.vote("Расследование", player2).next()
		.message("Вы провели расследование в отношении " + player2 + ". Он принадлежит фракции Город.");
	player3.next();
	//День 1 - День 2 Смерть Дона и назначение нового Дона
	player1.vote("Дневное голосование", player2).next().next().next();
	player3.status("role/Мафия").next().next().status("role/Дон").next();
	//Ночь 3 Убийство Шерифа новым Доном и победа Мафии
	player3.vote("Ночное голосование", player1).next().win();
	

	tester.play(init_data);
});
