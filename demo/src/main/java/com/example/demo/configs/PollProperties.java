package com.example.demo.configs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
@ConfigurationProperties(prefix = "app.poll")
public class PollProperties {
	
	@Autowired
	private ObjectMapper objectMapper;
	
	private long max_selection;
	
	private long max_candidate_name_length;

	public long getMax_selection() {
		return max_selection;
	}

	public void setMax_selection(long max_selection) {
		this.max_selection = max_selection;
	}

	public long getMax_candidate_name_length() {
		return max_candidate_name_length;
	}

	public void setMax_candidate_name_length(long max_candidate_name_length) {
		this.max_candidate_name_length = max_candidate_name_length;
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
