package com.example.demo.configs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
@ConfigurationProperties(prefix = "app.message")
public class MessageProperties {
	
	@Autowired
	private ObjectMapper objectMapper;
	
	private long max_message_length;
	
	private long max_system_message_length;

	public long getMax_message_length() {
		return max_message_length;
	}

	public void setMax_message_length(long max_message_length) {
		this.max_message_length = max_message_length;
	}

	public long getMax_system_message_length() {
		return max_system_message_length;
	}

	public void setMax_system_message_length(long max_system_message_length) {
		this.max_system_message_length = max_system_message_length;
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
