package com.example.demo.dto;

import java.time.OffsetDateTime;


public class DRoom {

	private Long id;
	
	private String name;
	
	private String description;
	
    private String creator;
	
	private String mode;
	
	private String status;
	
	private Short population;
	
	private Short max_population;
	
	private Boolean favorite;
	
	private OffsetDateTime creation_date;
	
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Short getPopulation() {
		return population;
	}

	public void setPopulation(Short population) {
		this.population = population;
	}

	public Short getMax_population() {
		return max_population;
	}

	public void setMax_population(Short max_population) {
		this.max_population = max_population;
	}

	public Boolean getFavorite() {
		return favorite;
	}

	public void setFavorite(Boolean favorite) {
		this.favorite = favorite;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getCreator() {
		return creator;
	}

	public void setCreator(String creator) {
		this.creator = creator;
	}

	public String getMode() {
		return mode;
	}

	public void setMode(String mode) {
		this.mode = mode;
	}

	public OffsetDateTime getCreation_date() {
		return creation_date;
	}

	public void setCreation_date(OffsetDateTime creation_date) {
		this.creation_date = creation_date;
	}
}
