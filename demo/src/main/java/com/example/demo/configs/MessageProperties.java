package com.example.demo.configs;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.message")
public class MessageProperties {
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
}
