package com.example.demo.configs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
@ConfigurationProperties(prefix = "app.room.info")
public class RoomInfoProperties {
	@Autowired
	private ObjectMapper objectMapper;
	
	private long max_name_length;
	
	private long max_description_length;
	
	private long min_population;
	
	private long max_population;

	public long getMax_name_length() {
		return max_name_length;
	}

	public void setMax_name_length(long max_name_length) {
		this.max_name_length = max_name_length;
	}

	public long getMax_description_length() {
		return max_description_length;
	}

	public void setMax_description_length(long max_description_length) {
		this.max_description_length = max_description_length;
	}

	public long getMin_population() {
		return min_population;
	}

	public void setMin_population(long min_population) {
		this.min_population = min_population;
	}

	public long getMax_population() {
		return max_population;
	}

	public void setMax_population(long max_population) {
		this.max_population = max_population;
	}
	
	@Override
	public String toString() {
		try {
			return objectMapper.writeValueAsString(this);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
	
}
