package com.example.demo.entities;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class FPollFStageId  implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private FStage stage;
	
	private FPoll poll;
	
	@Override
	public int hashCode() {
		return Objects.hash(poll, stage);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		FPollFStageId other = (FPollFStageId) obj;
		return Objects.equals(poll, other.poll) && Objects.equals(stage, other.stage);
	}

	public FPollFStageId(FStage stage, FPoll poll) {
		super();
		this.stage = stage;
		this.poll = poll;
	}
	
	public FPollFStageId() {}
}
