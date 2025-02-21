package com.example.demo.controllers;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.example.demo.DAOService;
import com.example.demo.dto.DRoom;


@Controller
public class MainPageController {
	
	@Autowired
	DAOService dAOService;

	@GetMapping("/public/game/{room_id}")
	public String getGamePage(Model model, Principal principal, @PathVariable long room_id) {
		DRoom room = dAOService.getRoom(room_id);
		
		model.addAttribute("username", (principal == null)? "" : principal.getName());
		model.addAttribute("mode", room.getMode());
		model.addAttribute("isHost", room.getCreator().equals(principal.getName()));
		model.addAttribute("room_id", room_id);
		model.addAttribute("players_limit", room.getMax_population());
		return "index";
	}
	
	@GetMapping("/public/**")
	public String getMainPage(Model model, Principal principal) {
		model.addAttribute("username", (principal == null)? "" : principal.getName());
		return "index";
	}
	
	@GetMapping("/login")
	public String getLoginPage(Model model, Principal principal) {
		model.addAttribute("username", (principal == null)? "" : principal.getName());
		return "index";
	}
}