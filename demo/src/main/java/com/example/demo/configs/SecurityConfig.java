package com.example.demo.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			.authorizeHttpRequests((authorize) -> authorize
					.requestMatchers("/public/**", "/api/**").hasRole("USER")
					.requestMatchers("/**").permitAll()
					.anyRequest().authenticated()
			).formLogin(formLogin -> formLogin
                    .loginPage("/login")
                    .defaultSuccessUrl("/public/rooms", true)
                    .permitAll())
			.logout((logout) -> logout.logoutSuccessUrl("/login"))
			.rememberMe(rememberMe -> rememberMe.key("trololo"))
			.httpBasic(Customizer.withDefaults());

		return http.build();
	}
	
	@Bean
	PasswordEncoder passwordEncoder() throws Exception  {
		return new BCryptPasswordEncoder(4);
	}
}