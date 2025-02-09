package com.example.demo.entities;

import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;

@Entity
@IdClass(FChannelId.class)
public class FChannel {
	
	@Id
	@ManyToOne(fetch=FetchType.LAZY)
	private FRoom room;
	
	@Id
	private String name;
	
	@OneToOne(optional=true, fetch=FetchType.LAZY)
	private FChannelFStage currentState;
	
	private String color;

	@Override
	public int hashCode() {
		return Objects.hash(name, room);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		FChannel other = (FChannel) obj;
		return Objects.equals(name, other.name) && Objects.equals(room, other.room);
	}
	
	

	public FChannelFStage getCurrentState() {
		return currentState;
	}

	public void setCurrentState(FChannelFStage currentState) {
		this.currentState = currentState;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public FRoom getRoom() {
		return room;
	}

	public void setRoom(FRoom room) {
		this.room = room;
	}

	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}
}
