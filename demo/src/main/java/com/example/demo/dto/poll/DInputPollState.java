package com.example.demo.dto.poll;

import java.util.List;

public class DInputPollState {
	private String id;
	
	private List<DInputCandidate> candidates;

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
}
