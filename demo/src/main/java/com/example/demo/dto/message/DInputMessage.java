package com.example.demo.dto.message;

public class DInputMessage {	
	private String text;

	private long roomId;
	
	private String channelName;
	
	private String stage;
	
	private short pindex;

	
	
	public long getRoomId() {
		return roomId;
	}

	public void setRoomId(long room_id) {
		this.roomId = room_id;
	}

	public String getChannelName() {
		return channelName;
	}

	public void setChannelName(String channelName) {
		this.channelName = channelName;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
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
}
