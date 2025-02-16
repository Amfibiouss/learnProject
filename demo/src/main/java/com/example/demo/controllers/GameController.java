package com.example.demo.controllers;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.DaoService;
import com.example.demo.GameWebSocketHandler;
import com.example.demo.RoomService;
import com.example.demo.dto.message.DMessages;
import com.example.demo.dto.poll.DPollResult;
import com.example.demo.dto.state.DInitData;
import com.example.demo.dto.state.DInputState;
import com.example.demo.dto.state.DOutputState;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping(value="/api/room/{room_id}")
public class GameController {
	
	@Autowired
	DaoService daoService;
	
	@Autowired
	GameWebSocketHandler wsHandler;
	
	@Autowired
	RoomService roomService;
	
	@GetMapping("state")
	public DOutputState getState(Principal principal,
							@PathVariable long room_id) {
		
		return roomService.getState(room_id, principal.getName());
	}
	
	@GetMapping("messages")
	public DMessages getMessages(Principal principal,
							@PathVariable long room_id,
							@RequestParam short pindex) {
		
		return daoService.getMessages(room_id, principal.getName(), pindex);
	}
	
	@PostMapping("imperius")
	public void spellImperius(Principal principal,
							HttpServletResponse response,
							@PathVariable long room_id,
							@RequestParam String target,
							@RequestParam short pindex) {
		
		if (roomService.getRoomIdByCreator(principal.getName()) != room_id) {
			response.setStatus(403);
			return;
		}
		
		roomService.imperius(room_id, target, pindex);
	}
	
	@PostMapping("avada_kedavra")
	public void spellAvadaKedavra(Principal principal,
							HttpServletResponse response,
							@PathVariable long room_id,
							@RequestParam String target) {
		
		if (roomService.getRoomIdByCreator(principal.getName()) != room_id) {
			response.setStatus(403);
			return;
		}
		
		roomService.tryExit(room_id, target);
	}
	
	@PostMapping("pause")
	public void pause(Principal principal,
							HttpServletResponse response,
							@PathVariable long room_id,
							@RequestParam long interval) {
		
		if (roomService.getRoomIdByCreator(principal.getName()) != room_id) {
			response.setStatus(403);
			return;
		}
		
		roomService.setStatus(room_id, "pause");
	}
	
	@PostMapping("unpause")
	public void unpause(Principal principal,
							HttpServletResponse response,
							@PathVariable long room_id) {
		
		if (roomService.getRoomIdByCreator(principal.getName()) != room_id) {
			response.setStatus(403);
			return;
		}
		
		roomService.setStatus(room_id, "run");
	}
	
	@GetMapping("init")
	public String getConfig(Principal principal,
							HttpServletResponse response,
							@PathVariable long room_id) {
		
		if (roomService.getRoomIdByCreator(principal.getName()) != room_id) {
			response.setStatus(403);
			return "";
		}
		
		return roomService.getRoomConfig(room_id);
	}
	
	@PostMapping("init")
	public void setInitialState(Principal principal, 
								HttpServletResponse response,
								@PathVariable long room_id,
								@RequestBody DInitData initData) {
		
		if (roomService.getRoomIdByCreator(principal.getName()) != room_id) {
			response.setStatus(403);
			return;
		}
		
		roomService.initRoom(room_id, initData);
		return;
	}
	
	@GetMapping("update")
	public List<DPollResult> getPollResults(Principal principal,
							HttpServletResponse response,
							@PathVariable long room_id) {
		
		if (roomService.getRoomIdByCreator(principal.getName()) != room_id) {
			response.setStatus(403);
			return null;
		}
		
		return roomService.getPollResults(room_id);
	}
	
	@PostMapping("update")
	public void setNewState(Principal principal, 
								HttpServletResponse response,
								@PathVariable long room_id,
								@RequestBody DInputState state) {
		
		if (roomService.getRoomIdByCreator(principal.getName()) != room_id) {
			response.setStatus(403);
			return;
		}
		
		roomService.updateRoom(room_id, state);
		return;
	}
}



