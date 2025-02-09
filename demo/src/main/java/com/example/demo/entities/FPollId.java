package com.example.demo.entities;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class FPollId implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private FRoom room;
	
	private String name;
	
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
		FPollId other = (FPollId) obj;
		return Objects.equals(name, other.name) && Objects.equals(room, other.room);
	}

	public FPollId(String name, FRoom room) {
		super();
		this.room = room;
		this.name = name;
	}

	public FPollId() {
		super();
	}
}
