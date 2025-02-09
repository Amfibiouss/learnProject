package com.example.demo.dto.poll;

import java.util.List;

public class DInputPollState {
	private String id;
	
	private List<DInputCandidate> candidates;

	private long can_vote;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public List<DInputCandidate> getCandidates() {
		return candidates;
	}

	public void setCandidates(List<DInputCandidate> candidates) {
		this.candidates = candidates;
	}

	public long getCan_vote() {
		return can_vote;
	}

	public void setCan_vote(long can_vote) {
		this.can_vote = can_vote;
	}
}
