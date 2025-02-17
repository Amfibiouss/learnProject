package com.example.demo.entities;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class FChannelFCharacterFStageId  implements Serializable {

	private static final long serialVersionUID = 1L;
	
	private FRoom room;
	
	private String channelId;
	
	private String stageId;
	
	private short pindex;

	@Override
	public int hashCode() {
		return Objects.hash(channelId, pindex, room, stageId);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		FChannelFCharacterFStageId other = (FChannelFCharacterFStageId) obj;
		return Objects.equals(channelId, other.channelId) && pindex == other.pindex && Objects.equals(room, other.room)
				&& Objects.equals(stageId, other.stageId);
	}

	public FChannelFCharacterFStageId(FRoom room, String channelId, String stageId, short pindex) {
		super();
		this.room = room;
		this.channelId = channelId;
		this.stageId = stageId;
		this.pindex = pindex;
	}

	public FChannelFCharacterFStageId() {
		super();
	}
}
