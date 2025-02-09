package com.example.demo.entities;

import java.time.OffsetDateTime;
import java.util.Objects;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.ManyToOne;

@Entity
@IdClass(FStageId.class)
public class FStage {
	@Id
	String name;
	
	@Id
	@ManyToOne(fetch=FetchType.LAZY)
	FRoom room;
	
	long duration;
	
	OffsetDateTime date;
	
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
		FStage other = (FStage) obj;
		return Objects.equals(name, other.name) && Objects.equals(room, other.room);
	}
	
	

	public long getDuration() {
		return duration;
	}

	public void setDuration(long duration) {
		this.duration = duration;
	}

	public OffsetDateTime getDate() {
		return date;
	}

	public void setDate(OffsetDateTime date) {
		this.date = date;
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
}
