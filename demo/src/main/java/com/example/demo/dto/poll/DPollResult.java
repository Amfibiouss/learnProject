package com.example.demo.dto.poll;

import java.util.List;

public class DPollResult {
	private String id;
	
	private List<Long> table;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public List<Long> getTable() {
		return table;
	}

	public void setTable(List<Long> table) {
		this.table = table;
	}
}
