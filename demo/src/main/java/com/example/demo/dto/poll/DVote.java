package com.example.demo.dto.poll;

import java.util.List;

public class DVote {
	private List<Integer> selected;
	
	private long roomId;
	
	private String pollName;

	private String stage;
	
	private short pindex;
	
	
	
	public long getRoomId() {
		return roomId;
	}

	public void setRoomId(long room_id) {
		this.roomId = room_id;
	}

	public String getStage() {
		return stage;
	}

	public void setStage(String stage) {
		this.stage = stage;
	}

	public short getPindex() {
		return pindex;
	}

	public void setPindex(short pindex) {
		this.pindex = pindex;
	}

	public String getPollName() {
		return pollName;
	}

	public void setPollName(String poll_id) {
		this.pollName = poll_id;
	}

	public List<Integer> getSelected() {
		return selected;
	}

	public void setSelected(List<Integer> selected) {
		this.selected = selected;
	}
}
