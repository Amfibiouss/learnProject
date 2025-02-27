package com.example.demo.entities;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;


@Embeddable
public class FChannelFStageId implements Serializable {

	private static final long serialVersionUID = 1L;
	
	private FRoom room;
	
	private String channelId;
	
	private String stageId;

	@Override
	public int hashCode() {
		return Objects.hash(channelId, room, stageId);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		FChannelFStageId other = (FChannelFStageId) obj;
		return Objects.equals(channelId, other.channelId) && Objects.equals(room, other.room)
				&& Objects.equals(stageId, other.stageId);
	}

	public FChannelFStageId(FRoom room, String channelId, String stageId) {
		super();
		this.room = room;
		this.channelId = channelId;
		this.stageId = stageId;
	}

	public FChannelFStageId() {
		super();
	}
	
	
}
