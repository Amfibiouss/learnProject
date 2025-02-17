package com.example.demo.dto.channel;

public class DInputReader {
	private short id;
	
	private short tongueControlledBy;
	
	private short earsControlledBy;
	
	private boolean canRead;

	private boolean canAnonymousRead;
	
	private boolean canXRayRead;
	
	private boolean canWrite;
	
	private boolean canAnonymousWrite;
	
	private boolean canXRayWrite;

	public short getId() {
		return id;
	}

	public void setId(short id) {
		this.id = id;
	}

	public short getTongueControlledBy() {
		return tongueControlledBy;
	}

	public void setTongueControlledBy(short tongueControlledBy) {
		this.tongueControlledBy = tongueControlledBy;
	}

	public short getEarsControlledBy() {
		return earsControlledBy;
	}

	public void setEarsControlledBy(short earsControlledBy) {
		this.earsControlledBy = earsControlledBy;
	}

	public boolean isCanRead() {
		return canRead;
	}

	public void setCanRead(boolean canRead) {
		this.canRead = canRead;
	}

	public boolean isCanAnonymousRead() {
		return canAnonymousRead;
	}

	public void setCanAnonymousRead(boolean canAnonymousRead) {
		this.canAnonymousRead = canAnonymousRead;
	}

	public boolean isCanXRayRead() {
		return canXRayRead;
	}

	public void setCanXRayRead(boolean canXRayRead) {
		this.canXRayRead = canXRayRead;
	}

	public boolean isCanWrite() {
		return canWrite;
	}

	public void setCanWrite(boolean canWrite) {
		this.canWrite = canWrite;
	}

	public boolean isCanAnonymousWrite() {
		return canAnonymousWrite;
	}

	public void setCanAnonymousWrite(boolean canAnonymousWrite) {
		this.canAnonymousWrite = canAnonymousWrite;
	}

	public boolean isCanXRayWrite() {
		return canXRayWrite;
	}

	public void setCanXRayWrite(boolean canXRayWrite) {
		this.canXRayWrite = canXRayWrite;
	}
	
	
}
