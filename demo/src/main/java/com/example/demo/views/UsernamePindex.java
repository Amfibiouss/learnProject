package com.example.demo.views;

public class UsernamePindex{
	public String username;
	
	public Short pindex;
	
	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public Short getPindex() {
		return pindex;
	}

	public void setPindex(Short pindex) {
		this.pindex = pindex;
	}

	UsernamePindex() {}
	
	UsernamePindex(String username, Short pindex) {
		this.pindex = pindex;
		this.username = username;
	}
}