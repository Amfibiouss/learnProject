package com.example.demo.dto.poll;

public class DInputCandidate {
	private String name;
	
	private long weight;
	
	private short controlledBy;

	private boolean canVote;
	
	private long candidates;
	
	public long getWeight() {
		return weight;
	}

	public void setWeight(long weight) {
		this.weight = weight;
	}

	public short getControlledBy() {
		return controlledBy;
	}

	public void setControlledBy(short controlledBy) {
		this.controlledBy = controlledBy;
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

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
}
