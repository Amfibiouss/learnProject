package com.example.demo.dto.player;

public class DPlayer {
	private String username;

	private short token;
	
	private long version;
	
	private Boolean online;
	
	private Short pindex;
	
	public long getVersion() {
		return version;
	}

	public void setVersion(long version) {
		this.version = version;
	}

	public Short getPindex() {
		return pindex;
	}

	public void setPindex(Short pindex) {
		this.pindex = pindex;
	}

	public short getToken() {
		return token;
	}

	public void setToken(short token) {
		this.token = token;
	}

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
