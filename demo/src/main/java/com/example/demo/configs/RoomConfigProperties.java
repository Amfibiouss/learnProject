package com.example.demo.configs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
@ConfigurationProperties(prefix = "app.room.config")
public class RoomConfigProperties {
	
	@Autowired
	private ObjectMapper objectMapper;
	
	private long max_channels;
	
	private long max_polls;
	
	private long max_channel_name_length;

	private long max_poll_name_length;
	
	private long max_poll_description_length;
	
	private long max_time_name_length;
	
	private long max_stage_name_length;

	private long min_stage_duration;
	
	private long max_stage_duration;

	public long getMax_stage_name_length() {
		return max_stage_name_length;
	}

	public void setMax_stage_name_length(long max_stage_name_length) {
		this.max_stage_name_length = max_stage_name_length;
	}

	public long getMax_channels() {
		return max_channels;
	}

	public void setMax_channels(long max_channels) {
		this.max_channels = max_channels;
	}

	public long getMax_polls() {
		return max_polls;
	}

	public void setMax_polls(long max_polls) {
		this.max_polls = max_polls;
	}

	public long getMax_channel_name_length() {
		return max_channel_name_length;
	}

	public void setMax_channel_name_length(long max_channel_name_length) {
		this.max_channel_name_length = max_channel_name_length;
	}

	public long getMax_poll_name_length() {
		return max_poll_name_length;
	}

	public void setMax_poll_name_length(long max_poll_name_length) {
		this.max_poll_name_length = max_poll_name_length;
	}

	public long getMax_poll_description_length() {
		return max_poll_description_length;
	}

	public void setMax_poll_description_length(long max_poll_description_length) {
		this.max_poll_description_length = max_poll_description_length;
	}

	public long getMax_time_name_length() {
		return max_time_name_length;
	}

	public void setMax_time_name_length(long max_time_name_length) {
		this.max_time_name_length = max_time_name_length;
	}

	public long getMin_stage_duration() {
		return min_stage_duration;
	}

	public void setMin_stage_duration(long min_stage_duration) {
		this.min_stage_duration = min_stage_duration;
	}

	public long getMax_stage_duration() {
		return max_stage_duration;
	}

	public void setMax_stage_duration(long max_stage_duration) {
		this.max_stage_duration = max_stage_duration;
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
	
	
	/*
	public Properties getProperties() {
		Properties props = new Properties();
		
		props.setProperty("max_channels", max_channels.toString());
		props.setProperty("max_polls", max_polls.toString());
		props.setProperty("max_channel_name_length", max_channel_name_length.toString());
		props.setProperty("max_poll_name_length", max_poll_name_length.toString());
		props.setProperty("max_stage_name_length", max_stage_name_length.toString());
		props.setProperty("max_poll_description_length", max_poll_description_length.toString());
		props.setProperty("min_stage_duration", min_stage_duration.toString());
		props.setProperty("max_stage_duration", max_stage_duration.toString());
		return props;
	}
	*/
}

