package com.example.demo.dto.poll;

import java.util.List;

public class DInputVote {
	private List<Short> selected;
	
	private long roomId;
	
	private String pollName;

	private String stage;
	
	private short pindex;
	
	private short controlledPindex;
	
	public short getControlledPindex() {
		return controlledPindex;
	}

	public void setControlledPindex(short controlledPindex) {
		this.controlledPindex = controlledPindex;
	}

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

	public List<Short> getSelected() {
		return selected;
	}

	public void setSelected(List<Short> selected) {
		this.selected = selected;
	}
}
