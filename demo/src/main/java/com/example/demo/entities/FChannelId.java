package com.example.demo.entities;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class FChannelId implements Serializable {

	private static final long serialVersionUID = 1L;

	private String name;
	
	private FRoom room;
	
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
		FChannelId other = (FChannelId) obj;
		return Objects.equals(name, other.name) && Objects.equals(room, other.room);
	}
	
	public FChannelId() {}

	public FChannelId(String name, FRoom room) {
		super();
		this.name = name;
		this.room = room;
	}
}
