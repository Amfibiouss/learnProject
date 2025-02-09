package com.example.demo.entities;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class FChannelFStageId implements Serializable {

	private static final long serialVersionUID = 1L;
	
	private FChannel channel;
	
	private FStage stage;

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
		FChannelFStageId other = (FChannelFStageId) obj;
		return Objects.equals(channel, other.channel) && Objects.equals(stage, other.stage);
	}

	public FChannelFStageId(FChannel channel, FStage stage) {
		super();
		this.channel = channel;
		this.stage = stage;
	}

	public FChannelFStageId() {
		super();
	}
	
	
}
