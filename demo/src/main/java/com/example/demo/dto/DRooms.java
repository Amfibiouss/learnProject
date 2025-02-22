package com.example.demo.dto;

import java.util.List;

public class DRooms {
	private long count;
	
	private List<DRoom> rooms;

	public long getCount() {
		return count;
	}

	public void setCount(long count) {
		this.count = count;
	}

	public List<DRoom> getRooms() {
		return rooms;
	}

	public void setRooms(List<DRoom> rooms) {
		this.rooms = rooms;
	}
	
	
}
