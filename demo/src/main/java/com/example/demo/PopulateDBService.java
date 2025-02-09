package com.example.demo;

import java.util.ArrayList;
import java.util.Arrays;

import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PopulateDBService {
	
    @Autowired
    SessionFactory sessionFactory;
	
	@Autowired
	DaoService daoService;
	
	@Autowired
	RoomService roomService;
	
	@Autowired
	PasswordEncoder encoder;
	
	void populate() {
		
		ArrayList<String> usernames = new ArrayList<String>(
				Arrays.asList("Twilight_Sparkle", "Applejack", "Fluttershy", "Rainbow_Dash"));
		
		daoService.addUser("Twilight_Sparkle", encoder.encode("1"), "admin");
		daoService.addUser("Applejack", encoder.encode("1"), "user");
		daoService.addUser("Fluttershy", encoder.encode("1"), "user");
		daoService.addUser("Rarity", encoder.encode("1"), "admin");
		daoService.addUser("Pinkie_Pie", encoder.encode("1"), "admin");
		daoService.addUser("Rainbow_Dash", encoder.encode("1"), "admin");
		
		
		String config ="{\"times\":[{\"id\":\"День\",\"duration\":10000},{\"id\":\"Ночь\",\"duration\":10000}],\"fractions\":[{\"id\":\"Горожане\",\"win_condition\":\"fraction(Мафия) and not(effect(Мертвый))\",\"win_text\":\"Горожане искоренили мафию из города.\"},{\"id\":\"Мафия\",\"win_condition\":\"fraction(Горожане) and not(effect(Мертвый))\",\"win_text\":\"Мафия получила полное господство над городом.\"}],\"roles\":[{\"id\":\"Шериф\",\"fraction\":\"Горожане\",\"description\":\"Вы Шериф. Вы принадлежите фракции горожан. Вы можете узнать ночью является ли игрок мафией\",\"count\":1},{\"id\":\"Доктор\",\"fraction\":\"Горожане\",\"description\":\"Вы Доктор. Вы принадлежите фракции горожан. Вы можете лечить людей ночью и они выживут при покущении\",\"count\":1},{\"id\":\"Горожанин\",\"fraction\":\"Горожане\",\"description\":\"Вы простой трудяга. Вы принадлежите фракции горожан.\",\"count\":11},{\"id\":\"Мафия\",\"fraction\":\"Мафия\",\"description\":\"Убивай, убивай, убивай!\",\"count\":1}],\"abilities\":[{\"id\":\"Дневное голосование\",\"description\":\"Умрет тот, за кого проголосовало больше. При равном количество голосов никто не умирает.\",\"candidates\":\"not(effect(Мертвый))\",\"canUse\":\"not(effect(Мертвый))\",\"self_use\":false,\"times\":[\"День\"],\"rule\":\"most_voted\",\"effects\":[\"Мертвый\"]},{\"id\":\"Расследование\",\"description\":\"Выберите человека, фракцию которого вы хотите узнать ночью.\",\"candidates\":\"not(effect(Мертвый))\",\"canUse\":\"role(Шериф) and not(effect(Мертвый))\",\"self_use\":false,\"times\":[\"Ночь\"],\"rule\":\"each_voted\",\"effects\":[\"Раскрыт\"]},{\"id\":\"Лечение\",\"description\":\"Выберите человека, которого хотите защитить ночью.\",\"candidates\":\"not(effect(Мертвый))\",\"canUse\":\"role(Доктор) and not(effect(Мертвый))\",\"self_use\":false,\"times\":[\"Ночь\"],\"rule\":\"each_voted\",\"effects\":[\"Вылечен\"]},{\"id\":\"Ночное голосование\",\"description\":\"Умрет тот, за кого проголосовало больше. При равном количество голосов никто не умирает.\",\"candidates\":\"fraction(Горожане) and not(effect(Мертвый))\",\"canUse\":\"fraction(Мафия) and not(effect(Мертвый))\",\"self_use\":false,\"times\":[\"Ночь\"],\"rule\":\"most_voted\",\"effects\":[\"Мертвый\"]}],\"channels\":[{\"id\":\"Общий\",\"times\":[\"День\"],\"canWrite\":\"not(effect(Мертвый))\",\"color\":\"#007700\"},{\"id\":\"Мертвые\",\"times\":[\"День\",\"Ночь\"],\"canRead\":\"effect(Мертвый)\",\"canWrite\":\"effect(Мертвый)\",\"color\":\"#880088\"},{\"id\":\"Мафия\",\"times\":[\"День\",\"Ночь\"],\"canRead\":\"fraction(Мафия)\",\"canWrite\":\"fraction(Мафия) and not(effect(Мертвый))\",\"color\":\"#aa0000\"}],\"effects\":[{\"id\":\"Мертвый\",\"text_to_all\":\"$target.name погиб.\",\"text_to_user\":\"Вы погибли.\",\"duration\":-1,\"protectFrom\":[]},{\"id\":\"Вылечен\",\"text_to_user\":\"Вас кто-то лечил ночью.\",\"duration\":1,\"protectFrom\":[\"Мертвый\"]},{\"id\":\"Раскрыт\",\"text_to_user\":\"Вас раскрыли.\",\"text_to_pollers\":\"$target.name принадлежит к фракции $target.fraction\",\"duration\":0}]}";
		/*
		roomService.addRoom("Test Room", 
				"This is Room for tests",
				"Rarity",
				"classic", 
				config, 
				(short) 14);
		*/
		for (int i = 0; i < usernames.size(); i++) {
			roomService.addRoom("Room #" + Long.toString(i), 
								"This is Room #" + Long.toString(i),
								usernames.get(i % usernames.size()),
								"classic", config, (short) 12);
		}
	}
}
