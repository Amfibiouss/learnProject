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

test("Проверка действенности лечения", () => {

	let tester = new EngineTester();
	
	var player1 = tester.createPlayer("Игрок 1", "Доктор");
	var player2 = tester.createPlayer("Игрок 2", "Горожанин");
	var player3 = tester.createPlayer("Игрок 3", "Мафия");
	
	player1.vote("Лечение", player2);
	player3.vote("Ночное голосование", player2);
	player2.next().no_status("Мертвый");
	
	tester.play(tester.initialize());
});

test("Проверка сразу 3 докторов", () => {

	let tester = new EngineTester();
	
	let player1 = tester.createPlayer("Игрок 1", "Доктор");
	let player2 = tester.createPlayer("Игрок 2", "Доктор");
	let player3 = tester.createPlayer("Игрок 3", "Доктор");
	let player4 = tester.createPlayer("Игрок 4", "Горожанин");
	let player5 = tester.createPlayer("Игрок 5", "Горожанин");
	let player6 = tester.createPlayer("Игрок 6", "Горожанин");
	let player7 = tester.createPlayer("Игрок 7", "Маньяк");
	let player8 = tester.createPlayer("Игрок 8", "Маньяк");
	let player9 = tester.createPlayer("Игрок 9", "Маньяк");
	let player10 = tester.createPlayer("Игрок 10", "Маньяк");
	let player11 = tester.createPlayer("Игрок 11", "Любовница");
	
	player1.vote("Лечение", player4).next();
	player2.vote("Лечение", player5).next();
	player3.vote("Лечение", player6).next();
	
	player7.vote("Охота", player4).next();
	player8.vote("Охота", player5).next();
	player9.vote("Охота", player6).next();
	
	player10.vote("Охота", player2).next();
	player11.vote("Любовь", player3).next();
	
	player4.next().status("Живой");
	player5.next().status("Мертвый");
	player6.next().status("Мертвый");

	tester.play(tester.initialize());
});

test("Проверка продолжительности лечения", () => {

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
	player2.vote("Ночное голосование", player1).next().cant_vote("Дневное голосование").
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
	
	player1.next().next().cant_vote("Месть Дурака", player3).next().lose();
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
		.message("Вы успешно напали на " + player3 + ".");
	player2.vote("Любовь", player1).next().message("Вы пришли к " + player1 + " и он убил вас!").status("Мертвый");
	player3.next().status("Мертвый");
	player4.vote("Ночное голосование", player1).next().message(player4 + " хотел напасть на " + player1 + ", но цель отбила нападение. Мафия решает отступить.");
	
	player1.vote("Дневное голосование", player4).next().win();
	player4.next().lose();
		
	tester.play(init_data);
});

test("Проверка 2 маньяков", () => {
	let tester = new EngineTester();

	let player1 = tester.createPlayer("Игрок 1", "Горожанин");
	let player2 = tester.createPlayer("Игрок 2", "Горожанин");
	let player3 = tester.createPlayer("Игрок 3", "Маньяк");
	let player4 = tester.createPlayer("Игрок 4", "Маньяк");

	let init_data = tester.initialize();

	player3.vote("Охота", player1).next();
	player4.vote("Охота", player2).next();
	
	player3.vote("Дневное голосование", player4).next().win();
	//player4.vote("Дневное голосование", player3).next();

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

test("Проверка способностей Ведьмы", () => {

	let tester = new EngineTester();

	let player1 = tester.createPlayer("Игрок 1", "Ведьма");
	let player2 = tester.createPlayer("Игрок 2", "Горожанин");
	let player3 = tester.createPlayer("Игрок 3", "Мафия");

	let init_data = tester.initialize();

	player1.next().vote("Контроль", player3).next().vote("Ночное голосование", player2, player3).can_read("Мафия").next().win();
	player2.next().next().next().status("Мертвый");

	tester.play(init_data);
});

test("Проверка способностей Ведьмы 2", () => {

	let tester = new EngineTester();

	let player1 = tester.createPlayer("Игрок 1", "Ведьма");
	let player2 = tester.createPlayer("Игрок 2", "Шериф");

	let init_data = tester.initialize();

	player1.next().vote("Контроль", player2)
		.next().vote("Расследование", player1, player2)
		.next().message("Ваш подчиненный " + player2
			 + " провел расследование в отношении " + player1
			 + ". Он принадлежит фракции Нейтрал.")
		.cant_vote("Дневное голосование", player1, player2);

	tester.play(init_data);
});

test("Проверка способностей Ведьмы на Следопыте", () => {

	let tester = new EngineTester();

	let player1 = tester.createPlayer("Игрок 1", "Ведьма");
	let player2 = tester.createPlayer("Игрок 2", "Следопыт");
	let player3 = tester.createPlayer("Игрок 3", "Шериф");

	let init_data = tester.initialize();

	player1.next().vote("Контроль", player2)
		.next().vote("Слежка", player1, player2)
		.next().message(player3 + " посещал ночью " + player1);
		
	player3.next().next().vote("Расследование", player1);
	player2.next().next().cant_vote("Слежка", player1);
	
	tester.play(init_data);
});

test("Проверка клоунирования", () => {

	let tester = new EngineTester();

	let player1 = tester.createPlayer("Игрок 1", "Администратор");
	let player2 = tester.createPlayer("Игрок 2", "Мафия");
	let player3 = tester.createPlayer("Игрок 3", "Горожанин");
	let player4 = tester.createPlayer("Игрок 4", "Мафия");

	let init_data = tester.initialize();

	player1.vote("Клоунировать", player2);
	player2.next().cant_write("Мафия");
	
	tester.play(init_data);
});

test("КЛОУНИРОВАТЬ ИСПЕПЕЛИТЬ ВОЗРОДИТЬ", () => {

	let tester = new EngineTester();

	let player1 = tester.createPlayer("Игрок 1", "Администратор");
	let player2 = tester.createPlayer("Игрок 2", "Мафия");
	let player3 = tester.createPlayer("Игрок 3", "Горожанин");

	let init_data = tester.initialize();

	player1.vote("Клоунировать", player2);
	player1.vote("Аннигиляция", player2);
	player1.vote("Восстановление", player2);
	player2.next().status("Живой").status("role/Клоун");
	
	tester.play(init_data);
});

test("Проверка способностей вигиланта", () => {

	let tester = new EngineTester();

	let player1 = tester.createPlayer("Игрок 1", "Вигилант");
	let player2 = tester.createPlayer("Игрок 2", "Мафия");
	let player3 = tester.createPlayer("Игрок 3", "Доктор");
	let player4 = tester.createPlayer("Игрок 4", "Горожанин");

	let init_data = tester.initialize();

	player1.vote("Самосуд", player4).next();
	player3.vote("Лечение", player4).next();
	
	player1.next().cant_vote("Самосуд", player3).next().next().vote("Самосуд", player3);
	
	player1.next().next().next().next().cant_vote("Самосуд", player4);
	
	tester.play(init_data);
});

test("Проверка способностей злой личности", () => {

	let tester = new EngineTester();
	
	let player1 = tester.createPlayer("Игрок 1", "Злая личность");
	let player2 = tester.createPlayer("Игрок 2", "Мафия");
	let player3 = tester.createPlayer("Игрок 3", "Доктор");
	let player4 = tester.createPlayer("Игрок 4", "Горожанин");
	let player5 = tester.createPlayer("Игрок 5", "Шериф");
	
	player1.start_vote("Выбрать носителя для злой личности", player3);// Доктор получает злую вторую личность
	
	let init_data = tester.initialize();
	
	//Проверка, что главная личность не видит канал Мафии
	player3.cant_read("Мафия").cant_write("Мафия").cant_vote("Ночное голосование");
	player1.can_read("Мафия").can_write("Мафия").can_vote("Ночное голосование", player4, player3);
	
	//Горожанин и Дон погибают, Побочная личность стоновится новым Дон
	player1.vote("Ночное голосование", player4, player3).next().next();
	player3.next().vote("Дневное голосование", player2).next();
	player5.vote("Расследование", player3).next()
		.message("Вы провели расследование в отношении " + player3 + ". Он принадлежит фракции Мафия.").next()
		.vote("Расследование", player3).next()
		.message("Вы провели расследование в отношении " + player3 + ". Он принадлежит фракции Город.").next()
	
		
	//Шериф погибает и побочная личность побеждает
	player1.vote("Ночное голосование", player5, player3).next()
		.message("Вы новый Дон. Руководите мафией. У вас есть защита от проверок Шерифа.")
		.win();
	
	
	tester.play(init_data);
});
