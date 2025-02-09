package com.example.demo.controllers;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.DaoService;
import com.example.demo.RoomService;
import com.example.demo.dto.DRoom;
import com.example.demo.dto.player.DCharacter;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping(value="/api/rooms")
public class RoomsController {
	
	@Autowired
	RoomService roomService;
	
	@Autowired
	DaoService daoService;
	
	@GetMapping("")
	List<DRoom> getRooms() {
		return roomService.getRooms();
	}
	
	@GetMapping("current")
	DRoom getCurrentRoom(Principal principal) {
		
		Long room_id = daoService.getRoomIdByPlayer(principal.getName());
		
		if (room_id == null)
			return null;
		
		return roomService.getRoom(room_id);
	}
	
	@GetMapping("players/{room_id}")
	List<DCharacter> getPlayers(@PathVariable long room_id) {
		/*
		try {
		Thread.sleep(10000);
		} catch(Exception e) {} 
		*/
		return daoService.getCharacters(room_id);
	}
	
	@PostMapping("create")
	Long createRoom(
			Principal principal,
			HttpServletResponse response,
			String name, 
			String description, 
			String mode, 
			String config,
			short limit) {
		
		try {
			roomService.addRoom(name, description, principal.getName(), mode, config, limit);
		} catch(Exception e) {
			response.setStatus(503);
			return -1L;
		}
		
		return roomService.getRoomIdByCreator(principal.getName());
	}
	
	@PostMapping("enter/{room_id}")
	void enterRoom(Principal principal,
					HttpServletResponse response,
					@PathVariable long room_id) {
		
		if (!roomService.tryEnter(room_id, principal.getName())) {
			response.setStatus(403);
		}
	}
	
	@PostMapping("exit/{room_id}")
	void exitRoom(Principal principal,
					HttpServletResponse response,
					@PathVariable long room_id) {
		
		if (!roomService.tryExit(room_id, principal.getName())) {
			response.setStatus(403);
		}
	}
}
