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
	private FChannel channel;
	
	@Id
	@ManyToOne(fetch=FetchType.LAZY)
	private FStage stage;
	
	private long canAnonymousRead;
	
	private long canRead;
	
	private long canXRayRead;
	
	private long canAnonymousWrite;
	
	private long canWrite;
	
	private long canXRayWrite;

	@Override
	public int hashCode() {
		return Objects.hash(channel, stage);
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
		return Objects.equals(channel, other.channel) && Objects.equals(stage, other.stage);
	}
	
	public long getCanAnonymousWrite() {
		return canAnonymousWrite;
	}

	public void setCanAnonymousWrite(long canAnonymousWrite) {
		this.canAnonymousWrite = canAnonymousWrite;
	}

	public long getCanXRayWrite() {
		return canXRayWrite;
	}

	public void setCanXRayWrite(long canXRayWrite) {
		this.canXRayWrite = canXRayWrite;
	}

	public FChannel getChannel() {
		return channel;
	}

	public void setChannel(FChannel channel) {
		this.channel = channel;
	}

	public FStage getStage() {
		return stage;
	}

	public void setStage(FStage stage) {
		this.stage = stage;
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

	public long getCanWrite() {
		return canWrite;
	}

	public void setCanWrite(long canWrite) {
		this.canWrite = canWrite;
	}
}
