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
	DAOService dAOService;
	
	@Autowired
	PasswordEncoder encoder;
	
	void populate() {
		
		ArrayList<String> usernames = new ArrayList<String>(
				Arrays.asList("Twilight_Sparkle", "Applejack", "Fluttershy", "Rainbow_Dash"));
		
		String bad_password = "$2a$04$2ClfiBLxtDw6RvEV/PVCSOagTELgVQL9OtanemfjC9LbPJPMlgVIu";
		dAOService.addUser("Twilight_Sparkle", bad_password, "admin");
		dAOService.addUser("Applejack", bad_password, "user");
		dAOService.addUser("Fluttershy", bad_password, "user");
		dAOService.addUser("Rarity", bad_password, "admin");
		dAOService.addUser("Pinkie_Pie", bad_password, "admin");
		dAOService.addUser("Rainbow_Dash", bad_password, "admin");
		
		for (int i = 0; i < 200; i++) {
			dAOService.createRoomForTests("Room #" + Long.toString(i), 
								"This is Room #" + Long.toString(i),
								usernames.get(i % usernames.size()),
								"classic", (short) 12);
		}
		
	}
}
