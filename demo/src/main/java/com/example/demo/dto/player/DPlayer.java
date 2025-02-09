package com.example.demo.dto.player;

public class DPlayer {
	private String username;
	
	private Boolean online;

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public Boolean getOnline() {
		return online;
	}

	public void setOnline(Boolean online) {
		this.online = online;
	}

	public DPlayer(String username, Boolean online) {
		super();
		this.username = username;
		this.online = online;
	}

	public DPlayer() {
		super();
	}
	
	
}
