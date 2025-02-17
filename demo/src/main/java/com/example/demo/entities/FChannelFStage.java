package com.example.demo.entities;

import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.ManyToOne;

@Entity
@IdClass(FChannelFStageId.class)
public class FChannelFStage {

	@Id
	@ManyToOne(fetch=FetchType.LAZY)
	private FRoom room;
	
	@Id
	private String channelId;
	
	@Id
	private String stageId;
	
	private long canAnonymousRead;
	
	private long canRead;
	
	private long canXRayRead;
	
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
		FChannelFStage other = (FChannelFStage) obj;
		return Objects.equals(channelId, other.channelId) && Objects.equals(room, other.room)
				&& Objects.equals(stageId, other.stageId);
	}

	public FRoom getRoom() {
		return room;
	}

	public void setRoom(FRoom room) {
		this.room = room;
	}

	public String getChannelId() {
		return channelId;
	}

	public void setChannelId(String channelId) {
		this.channelId = channelId;
	}

	public String getStageId() {
		return stageId;
	}

	public void setStageId(String stageId) {
		this.stageId = stageId;
	}

	public long getCanAnonymousRead() {
		return canAnonymousRead;
	}

	public void setCanAnonymousRead(long canAnonymousRead) {
		this.canAnonymousRead = canAnonymousRead;
	}

	public long getCanXRayRead() {
		return canXRayRead;
	}

	public void setCanXRayRead(long canXRayRead) {
		this.canXRayRead = canXRayRead;
	}

	public long getCanRead() {
		return canRead;
	}

	public void setCanRead(long canRead) {
		this.canRead = canRead;
	}
}
