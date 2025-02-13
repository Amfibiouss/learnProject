package com.example.demo.entities;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class FPollFCharacterFStageId  implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private FRoom room;
	
	private String pollId;
	
	private String stageId;
	
	private short pindex;
	
	@Override
	public int hashCode() {
		return Objects.hash(pindex, pollId, room, stageId);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		FPollFCharacterFStageId other = (FPollFCharacterFStageId) obj;
		return pindex == other.pindex && Objects.equals(pollId, other.pollId) && Objects.equals(room, other.room)
				&& Objects.equals(stageId, other.stageId);
	}

	public FPollFCharacterFStageId(FRoom room, String poll_id, String stage_id, short pindex) {
		super();
		this.room = room;
		this.pollId = poll_id;
		this.stageId = stage_id;
		this.pindex = pindex;
	}

	public FPollFCharacterFStageId() {
		super();
	}
}
