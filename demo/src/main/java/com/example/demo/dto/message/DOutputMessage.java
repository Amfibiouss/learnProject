package com.example.demo.dto.message;

import java.time.OffsetDateTime;

public class DOutputMessage {
	private long id;
	
	private String text;
	
	private String username;
	
	private String imageText;
	
	private String channel_name;
	
	private String channel_color;
	
	private String stage;
	
	private OffsetDateTime date;

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}
	
	public String getImageText() {
		return imageText;
	}

	public void setImageText(String imageText) {
		this.imageText = imageText;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getChannel_name() {
		return channel_name;
	}

	public void setChannel_name(String channel_name) {
		this.channel_name = channel_name;
	}

	public String getChannel_color() {
		return channel_color;
	}

	public void setChannel_color(String channel_color) {
		this.channel_color = channel_color;
	}

	public String getStage() {
		return stage;
	}

	public void setStage(String stage) {
		this.stage = stage;
	}

	public OffsetDateTime getDate() {
		return date;
	}

	public void setDate(OffsetDateTime date) {
		this.date = date;
	}
	
	
}
