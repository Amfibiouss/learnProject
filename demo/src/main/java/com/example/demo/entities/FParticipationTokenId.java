package com.example.demo.entities;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class FParticipationTokenId  implements Serializable {

	private static final long serialVersionUID = 1L;

	private FRoom room;
	
	private short pindex;

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
		FParticipationTokenId other = (FParticipationTokenId) obj;
		return Objects.equals(pindex, other.pindex) && Objects.equals(room, other.room);
	}
	
	public FParticipationTokenId() {}

	public FParticipationTokenId(FRoom room, short pindex) {
		super();
		this.room = room;
		this.pindex = pindex;
	}
	
}
