package com.example.demo.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.demo.DAOService;

@Component
public class CustomUserDetailsService implements UserDetailsService {

	@Autowired
	PasswordEncoder encoder;
	
	@Autowired
	DAOService dAOService;

    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try {
           // TmplUser user = DAOService.get_user(username);
           // String password = DAOService.get_password(username);

            return User.builder()
            		.username(username)
                    .password(dAOService.getPassword(username))
                    .roles("USER", "ADMIN")
                    .build();
        } catch (Exception e) {
            throw new UsernameNotFoundException("username " + username + " not found");
        }
    }
}
