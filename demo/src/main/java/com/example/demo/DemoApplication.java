package com.example.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.PropertySource;
import org.springframework.retry.annotation.EnableRetry;

@EnableRetry
@EnableConfigurationProperties
@PropertySource(value = "classpath:/custom_application.properties", encoding = "UTF-8")
@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}
	
	@Bean
	CommandLineRunner runner(PopulateDBService populateDBService) {
		return args -> {
			populateDBService.populate();
		};
	}
}
