package com.example.demo.entities;

import java.util.List;
import java.util.Objects;

import org.hibernate.annotations.Array;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.ManyToOne;

@Entity
@IdClass(FPollFStageId.class)
public class FPollFStage {
	
	@Id
	@ManyToOne(fetch=FetchType.LAZY)
	private FStage stage;
	
	@Id
	@ManyToOne(fetch=FetchType.LAZY)
	private FPoll poll;
	
	@ElementCollection
	private List<FCandidate> candidates;
	
	private long candidatesMask;
	
	private long canVote;

	@Array(length=32)
	long[] pollTable;
	
	@Array(length=32)
	long[] reversePollTable;

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
		FPollFStage other = (FPollFStage) obj;
		return Objects.equals(poll, other.poll) && Objects.equals(stage, other.stage);
	}

	public FStage getStage() {
		return stage;
	}

	public void setStage(FStage stage) {
		this.stage = stage;
	}

	public FPoll getPoll() {
		return poll;
	}

	public void setPoll(FPoll poll) {
		this.poll = poll;
	}

	public List<FCandidate> getCandidates() {
		return candidates;
	}

	public void setCandidates(List<FCandidate> candidates) {
		this.candidates = candidates;
	}

	public long getCandidatesMask() {
		return candidatesMask;
	}

	public void setCandidatesMask(long candidatesMask) {
		this.candidatesMask = candidatesMask;
	}

	public long getCanVote() {
		return canVote;
	}

	public void setCanVote(long canVote) {
		this.canVote = canVote;
	}

	public long[] getPollTable() {
		return pollTable;
	}

	public void setPollTable(long[] pollTable) {
		this.pollTable = pollTable;
	}

	public long[] getReversePollTable() {
		return reversePollTable;
	}

	public void setReversePollTable(long[] reversePollTable) {
		this.reversePollTable = reversePollTable;
	}
}
