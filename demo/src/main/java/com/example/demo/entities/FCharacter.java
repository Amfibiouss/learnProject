package com.example.demo.entities;
import java.util.Objects;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.ManyToOne;

@Entity
@IdClass(FCharacterId.class)
public class FCharacter {
	@Id
	@ManyToOne(cascade=CascadeType.ALL, fetch=FetchType.LAZY)
	private FRoom room;
	
	@Id
	private short pindex;
	
	@Override
	public int hashCode() {
		return Objects.hash(room, pindex);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		FCharacter other = (FCharacter) obj;
		return Objects.equals(room, other.room) && Objects.equals(pindex, other.pindex);
	}

	public FRoom getRoom() {
		return room;
	}

	public void setRoom(FRoom room) {
		this.room = room;
	}

	public short getPindex() {
		return pindex;
	}

	public void setPindex(short pindex) {
		this.pindex = pindex;
	}
}
