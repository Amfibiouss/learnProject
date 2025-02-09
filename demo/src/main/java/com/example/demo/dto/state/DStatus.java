package com.example.demo.dto.state;

public class DStatus {
	private String status;
	
	private long duration;
	
	private long version;
	
	public long getVersion() {
		return version;
	}

	public void setVersion(long version) {
		this.version = version;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public long getDuration() {
		return duration;
	}

	public void setDuration(long duration) {
		this.duration = duration;
	}

	DStatus() {}

	public DStatus(String status, long duration, long version) {
		super();
		this.status = status;
		this.duration = duration;
		this.version = version;
	}
}
