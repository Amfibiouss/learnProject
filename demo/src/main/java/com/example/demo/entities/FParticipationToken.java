package com.example.demo.entities;

import java.util.Objects;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.ManyToOne;

@Entity
@IdClass(FParticipationTokenId.class)
public class FParticipationToken {

	@Id
	@ManyToOne(cascade=CascadeType.ALL, fetch=FetchType.LAZY)
	private FRoom room;
	
	@Id
	private short pindex;
	
	private boolean free;
	
	@Override
	public int hashCode() {
		return Objects.hash(pindex, room);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		FParticipationToken other = (FParticipationToken) obj;
		return pindex == other.pindex && Objects.equals(room, other.room);
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

	public boolean isFree() {
		return free;
	}

	public void setFree(boolean free) {
		this.free = free;
	}
}
