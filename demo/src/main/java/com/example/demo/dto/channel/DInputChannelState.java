package com.example.demo.dto.channel;

public class DInputChannelState {
	private String id;
	
	private long canRead;

	private long canAnonymousRead;
	
	private long canXRayRead;
	
	private long canWrite;
	
	private long canAnonymousWrite;
	
	private long canXRayWrite;

	public String getId() {
		return id;
	}

	public long getCanAnonymousRead() {
		return canAnonymousRead;
	}

	public void setCanAnonymousRead(long canAnonymousRead) {
		this.canAnonymousRead = canAnonymousRead;
	}

	public long getCanXRayRead() {
		return canXRayRead;
	}

	public void setCanXRayRead(long canXRayRead) {
		this.canXRayRead = canXRayRead;
	}

	public void setId(String id) {
		this.id = id;
	}

	public long getCanRead() {
		return canRead;
	}

	public void setCanRead(long canRead) {
		this.canRead = canRead;
	}

	public long getCanWrite() {
		return canWrite;
	}

	public void setCanWrite(long canWrite) {
		this.canWrite = canWrite;
	}

	public long getCanAnonymousWrite() {
		return canAnonymousWrite;
	}

	public void setCanAnonymousWrite(long canAnonymousWrite) {
		this.canAnonymousWrite = canAnonymousWrite;
	}

	public long getCanXRayWrite() {
		return canXRayWrite;
	}

	public void setCanXRayWrite(long canXRayWrite) {
		this.canXRayWrite = canXRayWrite;
	}
	
	
}
