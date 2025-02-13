package com.example.demo.dto.poll;

public class DInputCandidate {
	private short id;
	
	private String name;
	
	private long weight;
	
	private short alias;

	private boolean canVote;
	
	private long candidates;
	
	public long getWeight() {
		return weight;
	}

	public void setWeight(long weight) {
		this.weight = weight;
	}

	public short getAlias() {
		return alias;
	}

	public void setAlias(short alias) {
		this.alias = alias;
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

	public short getId() {
		return id;
	}

	public void setId(short id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
}
