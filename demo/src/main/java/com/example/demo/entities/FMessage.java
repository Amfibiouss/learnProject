package com.example.demo.entities;

import java.time.OffsetDateTime;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class FMessage {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE)
	private Long id;
	
	@Column(columnDefinition = "TEXT")
	private String text;
	
	private OffsetDateTime date;
	
	private long readMask;
	
	private long XRayReadMask;
	
	private long anonymousReadMask;
	
	private boolean XRayMessage;
	
	private boolean anonymousMessage;
	
	private Short pindex;
	
	@ManyToOne(fetch=FetchType.LAZY)
	private FUser user;
	
	@ManyToOne(fetch=FetchType.LAZY)
	private FStage stage;
	
	@ManyToOne(fetch=FetchType.LAZY)
	private FChannel channel;
	
	@Override
	public int hashCode() {
		return Objects.hash(id);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		FMessage other = (FMessage) obj;
		return Objects.equals(id, other.id);
	}
	
	

	public Short getPindex() {
		return pindex;
	}

	public void setPindex(Short pindex) {
		this.pindex = pindex;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public OffsetDateTime getDate() {
		return date;
	}

	public void setDate(OffsetDateTime date) {
		this.date = date;
	}

	public long getReadMask() {
		return readMask;
	}

	public void setReadMask(long readMask) {
		this.readMask = readMask;
	}

	public long getXRayReadMask() {
		return XRayReadMask;
	}

	public void setXRayReadMask(long xRayReadMask) {
		XRayReadMask = xRayReadMask;
	}

	public long getAnonymousReadMask() {
		return anonymousReadMask;
	}

	public void setAnonymousReadMask(long anonymousReadMask) {
		this.anonymousReadMask = anonymousReadMask;
	}
	
	public boolean isXRayMessage() {
		return XRayMessage;
	}

	public void setXRayMessage(boolean xRayMessage) {
		XRayMessage = xRayMessage;
	}

	public boolean isAnonymousMessage() {
		return anonymousMessage;
	}

	public void setAnonymousMessage(boolean anonymousMessage) {
		this.anonymousMessage = anonymousMessage;
	}

	public FUser getUser() {
		return user;
	}

	public void setUser(FUser user) {
		this.user = user;
	}

	public FStage getStage() {
		return stage;
	}

	public void setStage(FStage stage) {
		this.stage = stage;
	}

	public FChannel getChannel() {
		return channel;
	}

	public void setChannel(FChannel channel) {
		this.channel = channel;
	}

	public Long getId() {
		return id;
	}
}
