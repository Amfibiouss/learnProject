package com.example.demo.entities;

import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.ManyToOne;

@Entity
@IdClass(FPollFCharacterFStageId.class)
public class FPollFCharacterFStage {
	@Id
	@ManyToOne(fetch=FetchType.LAZY)
	private FRoom room;
	@Id
	private String stageId;
	@Id
	private String pollId;
	@Id
	private short pindex;
	
	private String name;
	
	private short controlledBy;
	
	private long weight;
	
	private boolean canVote;
	
	private long candidates;
	
	private long inVotesMask;
	
	private long outVotesMask;
	
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
		FPollFCharacterFStage other = (FPollFCharacterFStage) obj;
		return pindex == other.pindex && Objects.equals(pollId, other.pollId) && Objects.equals(room, other.room)
				&& Objects.equals(stageId, other.stageId);
	}

	public long getInVotesMask() {
		return inVotesMask;
	}

	public void setInVotesMask(long inVotesMask) {
		this.inVotesMask = inVotesMask;
	}

	public long getOutVotesMask() {
		return outVotesMask;
	}

	public void setOutVotesMask(long outVotesMask) {
		this.outVotesMask = outVotesMask;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public FRoom getRoom() {
		return room;
	}

	public void setRoom(FRoom room) {
		this.room = room;
	}

	public String getStageId() {
		return stageId;
	}

	public void setStageId(String stage_id) {
		this.stageId = stage_id;
	}

	public String getPollId() {
		return pollId;
	}

	public void setPollId(String poll_id) {
		this.pollId = poll_id;
	}

	public short getPindex() {
		return pindex;
	}

	public void setPindex(short pindex) {
		this.pindex = pindex;
	}

	public short getControlledBy() {
		return controlledBy;
	}

	public void setControlledBy(short alias) {
		this.controlledBy = alias;
	}

	public long getWeight() {
		return weight;
	}

	public void setWeight(long weight) {
		this.weight = weight;
	}

	public boolean isCanVote() {
		return canVote;
	}

	public void setCanVote(boolean canVote) {
		this.canVote = canVote;
	}

	public long getCandidates() {
		return candidates;
	}

	public void setCandidates(long candidates) {
		this.candidates = candidates;
	}
}
