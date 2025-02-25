package com.example.demo.configs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
@ConfigurationProperties(prefix = "app.room.init")
public class RoomInitProperties {
	
	@Autowired
	private ObjectMapper objectMapper;
	
	private String first_stage_name;
	
	private String system_channel_name;
	
	private String system_channel_color;
	
	private String lobby_channel_name;
	
	private String lobby_channel_color;

	public String getFirst_stage_name() {
		return first_stage_name;
	}

	public void setFirst_stage_name(String first_stage_name) {
		this.first_stage_name = first_stage_name;
	}

	public String getSystem_channel_name() {
		return system_channel_name;
	}

	public void setSystem_channel_name(String system_channel_name) {
		this.system_channel_name = system_channel_name;
	}

	public String getSystem_channel_color() {
		return system_channel_color;
	}

	public void setSystem_channel_color(String system_channel_color) {
		this.system_channel_color = system_channel_color;
	}

	public String getLobby_channel_name() {
		return lobby_channel_name;
	}

	public void setLobby_channel_name(String lobby_channel_name) {
		this.lobby_channel_name = lobby_channel_name;
	}

	public String getLobby_channel_color() {
		return lobby_channel_color;
	}

	public void setLobby_channel_color(String lobby_channel_color) {
		this.lobby_channel_color = lobby_channel_color;
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
