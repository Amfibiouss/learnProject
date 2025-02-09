package com.example.demo.entities;
import java.util.Objects;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;

@Entity
public class FUser {
	@Id
	private String username;
	
	private String password;
	
	private String role;
	
	@OnDelete(action = OnDeleteAction.SET_NULL)
	@ManyToOne(optional=true, fetch=FetchType.LAZY)
	private FCharacter character;
	
	@OnDelete(action = OnDeleteAction.SET_NULL)
	@OneToOne(cascade=CascadeType.ALL, fetch=FetchType.LAZY)
	private FParticipationToken token;
	
	private boolean online;
	
	@Override
	public int hashCode() {
		return Objects.hash(username);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		FUser other = (FUser) obj;
		return Objects.equals(username, other.username);
	}
	
	

	public FParticipationToken getToken() {
		return token;
	}

	public void setToken(FParticipationToken token) {
		this.token = token;
	}

	public boolean getOnline() {
		return online;
	}

	public void setOnline(boolean online) {
		this.online = online;
	}

	public FCharacter getCharacter() {
		return character;
	}

	public void setCharacter(FCharacter fCharacter) {
		this.character = fCharacter;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}
}
