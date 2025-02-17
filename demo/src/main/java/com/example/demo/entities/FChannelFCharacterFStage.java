package com.example.demo.entities;

import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.ManyToOne;

@Entity
@IdClass(FChannelFCharacterFStageId.class)
public class FChannelFCharacterFStage {
	@Id
	@ManyToOne(fetch=FetchType.LAZY)
	private FRoom room;
	
	@Id
	private String channelId;
	
	@Id
	private String stageId;
	
	@Id
	private short pindex;
	
	private short tongueControlledBy;
	
	private short earsControlledBy;
	
	private boolean canAnonymousWrite;
	
	private boolean canWrite;
	
	private boolean canXRayWrite;
	
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
		FChannelFCharacterFStage other = (FChannelFCharacterFStage) obj;
		return Objects.equals(channelId, other.channelId) && pindex == other.pindex && Objects.equals(room, other.room)
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

	public short getPindex() {
		return pindex;
	}

	public void setPindex(short pindex) {
		this.pindex = pindex;
	}

	public short getTongueControlledBy() {
		return tongueControlledBy;
	}

	public void setTongueControlledBy(short tongueControlledBy) {
		this.tongueControlledBy = tongueControlledBy;
	}

	public short getEarsControlledBy() {
		return earsControlledBy;
	}

	public void setEarsControlledBy(short earsControlledBy) {
		this.earsControlledBy = earsControlledBy;
	}

	public boolean isCanAnonymousWrite() {
		return canAnonymousWrite;
	}

	public void setCanAnonymousWrite(boolean canAnonymousWrite) {
		this.canAnonymousWrite = canAnonymousWrite;
	}

	public boolean isCanWrite() {
		return canWrite;
	}

	public void setCanWrite(boolean canWrite) {
		this.canWrite = canWrite;
	}

	public boolean isCanXRayWrite() {
		return canXRayWrite;
	}

	public void setCanXRayWrite(boolean canXRayWrite) {
		this.canXRayWrite = canXRayWrite;
	}
}
