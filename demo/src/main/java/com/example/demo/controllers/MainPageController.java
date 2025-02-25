package com.example.demo.controllers;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.demo.DAOService;
import com.example.demo.configs.RoomConfigProperties;
import com.example.demo.configs.RoomInfoProperties;
import com.example.demo.configs.RoomInitProperties;
import com.example.demo.dto.DRoom;
import com.fasterxml.jackson.databind.ObjectMapper;


@Controller
public class MainPageController {
	
	@Autowired
	DAOService dAOService;

	@Autowired
	RoomConfigProperties roomConfigProperties;
	
	@Autowired
	RoomInitProperties roomInitProperties;
	
	@Autowired
	RoomInfoProperties roomInfoProperties;
	
	@Autowired
	ObjectMapper objectMapper;
	
	@GetMapping("/public/game/{room_id}")
	public String getGamePage(Model model, Principal principal, @PathVariable long room_id) {
		DRoom room = dAOService.getRoom(room_id);
		
		model.addAttribute("username", (principal == null)? "" : principal.getName());
		model.addAttribute("mode", room.getMode());
		model.addAttribute("isHost", room.getCreator().equals(principal.getName()));
		model.addAttribute("room_id", room_id);
		model.addAttribute("players_limit", room.getMax_population());
		
		model.addAttribute("config_room_props", roomConfigProperties.toString());
		
		return "index";
	}
	
	@GetMapping("/public/sandbox")
	public String getSandbox(
			Model model, 
			Principal principal,
			@RequestParam String mode, 
			@RequestParam short limit) {

		model.addAttribute("username", (principal == null)? "" : principal.getName());
		model.addAttribute("mode", mode);
		model.addAttribute("isHost", true);
		model.addAttribute("room_id", -1);
		model.addAttribute("players_limit", limit);
		
		model.addAttribute("config_room_props", roomConfigProperties.toString());
		model.addAttribute("init_room_props", roomInitProperties.toString());
		
		return "index";
	}
	
	@GetMapping("/public/rooms")
	public String getRoomsPage(Model model, Principal principal) {
		model.addAttribute("username", (principal == null)? "" : principal.getName());
		
		model.addAttribute("config_room_props", roomConfigProperties.toString());
		model.addAttribute("room_info_props", roomInfoProperties.toString());
		
		return "index";
	}
	
	@GetMapping("/public/**")
	public String getAnyPage(Model model, Principal principal) {
		model.addAttribute("username", (principal == null)? "" : principal.getName());
		return "index";
	}
	
	@GetMapping("/login")
	public String getLoginPage(Model model, Principal principal) {
		model.addAttribute("username", (principal == null)? "" : principal.getName());
		return "index";
	}
}