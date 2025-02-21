package com.example.demo.controllers;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.WSHandlerDaoService;
import com.example.demo.DAOService;
import com.example.demo.dto.DRoom;
import com.example.demo.dto.player.DPlayer;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping(value="/api/rooms")
public class RoomsController {
	
	@Autowired
	DAOService dAOService;
	
	
	@GetMapping("")
	List<DRoom> getRooms() {
		return dAOService.getRooms();
	}
	
	@GetMapping("current")
	DRoom getCurrentRoom(Principal principal, HttpServletResponse response) {
		
		Long room_id = dAOService.getRoomIdByPlayer(principal.getName());
		
		if (room_id == null) {
			response.setStatus(404);
			return null;
		}
		
		return dAOService.getRoom(room_id);
	}
	
	@GetMapping("players/{room_id}")
	List<DPlayer> getPlayers(@PathVariable long room_id) {
		return dAOService.getPlayers(room_id);
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
			dAOService.addRoom(name, description, principal.getName(), mode, config, limit);
		} catch(Exception e) {
			response.setStatus(503);
			return -1L;
		}
		
		return dAOService.getRoomIdByCreator(principal.getName());
	}
	
	@PostMapping("enter/{room_id}")
	void enterRoom(Principal principal,
					HttpServletResponse response,
					@PathVariable long room_id) {
		
		try {
			dAOService.tryEnter(room_id, principal.getName());
		} catch(RuntimeException e) {
			if (e.getMessage().equals("В комнате нет свободных мест"))
				response.setStatus(403);
			else if (e.getMessage().equals("Пользователь уже играет")) {
				response.setStatus(403);
			} else {
				throw new RuntimeException();
			}
		}
	}
	
	@PostMapping("exit/{room_id}")
	void exitRoom(Principal principal,
					HttpServletResponse response,
					@PathVariable long room_id) {
		
		if (!dAOService.tryExit(room_id, principal.getName())) {
			response.setStatus(403);
		}
	}
}
