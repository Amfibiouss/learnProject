package com.example.demo.controllers;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.DAOService;
import com.example.demo.ValidateJsonService;
import com.example.demo.dto.message.DInputMessage;
import com.example.demo.dto.message.DMessages;
import com.example.demo.dto.poll.DPollResult;
import com.example.demo.dto.poll.DInputVote;
import com.example.demo.dto.state.DInitData;
import com.example.demo.dto.state.DInputState;
import com.example.demo.dto.state.DOutputState;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping(value="/api/room/{room_id}")
public class GameController {
	
	@Autowired
	private DAOService dAOService;
	
	@Autowired
	private ValidateJsonService validateJsonService;
	
	@GetMapping("state")
	public DOutputState getState(Principal principal,
							@PathVariable long room_id) {
		
		return dAOService.getState(room_id, principal.getName());
	}
	
	@GetMapping("messages")
	public DMessages getMessages(Principal principal,
							@PathVariable long room_id,
							@RequestParam short pindex) {
		
		return dAOService.getMessages(room_id, principal.getName(), pindex);
	}
	
	@PostMapping("send_message")
	public void sendMessage(Principal principal, 
							HttpServletResponse response,
							@RequestBody String json) {
		
		DInputMessage message = validateJsonService.validateAndParse(json, DInputMessage.class, null);
		
		try {
			dAOService.sendMessage(message, principal.getName());
		} catch(RuntimeException e) {
			if (e.getMessage().equals("Ошибка авторизации"))
				response.setStatus(403);
			else
				throw new RuntimeException(e);
		}
	}
	
	@PostMapping("send_vote")
	public void sendVote(Principal principal, 
							HttpServletResponse response,
							@RequestBody String json) {
		
		DInputVote vote = validateJsonService.validateAndParse(json, DInputVote.class, null);
		
		try {
			//throw new RuntimeException("Ошибка авторизации");
			dAOService.sendVote(vote, principal.getName());
		} catch(RuntimeException e) {
			if (e.getMessage().equals("Ошибка авторизации"))
				response.setStatus(403);
			else
				throw new RuntimeException(e);
		}
	}
	
	@PostMapping("imperius")
	public void spellImperius(Principal principal,
							HttpServletResponse response,
							@PathVariable long room_id,
							@RequestParam String target,
							@RequestParam short pindex) {
		
		if (dAOService.getRoomIdByCreator(principal.getName()) != room_id) {
			response.setStatus(403);
			return;
		}
		
		dAOService.imperius(room_id, target, pindex);
	}
	
	@PostMapping("avada_kedavra")
	public void spellAvadaKedavra(Principal principal,
							HttpServletResponse response,
							@PathVariable long room_id,
							@RequestParam String target) {
		
		if (dAOService.getRoomIdByCreator(principal.getName()) != room_id) {
			response.setStatus(403);
			return;
		}
		
		dAOService.tryExit(room_id, target);
	}
	
	@PostMapping("pause")
	public void pause(Principal principal,
							HttpServletResponse response,
							@PathVariable long room_id) {
		
		if (dAOService.getRoomIdByCreator(principal.getName()) != room_id) {
			response.setStatus(403);
			return;
		}
		
		dAOService.setStatus(room_id, "pause");
	}
	
	@PostMapping("unpause")
	public void unpause(Principal principal,
							HttpServletResponse response,
							@PathVariable long room_id) {
		
		if (dAOService.getRoomIdByCreator(principal.getName()) != room_id) {
			response.setStatus(403);
			return;
		}
		
		dAOService.setStatus(room_id, "run");
	}
	
	@PostMapping("init")
	public void setInitData(Principal principal,
							HttpServletResponse response,
							@PathVariable long room_id,
							@RequestBody String json) {
		
		if (dAOService.getRoomIdByCreator(principal.getName()) != room_id) {
			response.setStatus(403);
			return;
		}
		
		DInitData initData = validateJsonService.validateAndParse(json, DInitData.class, null);
		
		dAOService.initRoom(room_id, initData);
	}
	
	@GetMapping("update")
	public List<DPollResult> getPollResults(Principal principal,
							HttpServletResponse response,
							@PathVariable long room_id) {
		
		if (dAOService.getRoomIdByCreator(principal.getName()) != room_id) {
			response.setStatus(403);
			return null;
		}
		
		return dAOService.getPollResults(room_id);
	}
	
	@PostMapping("update")
	public void setNewState(Principal principal, 
								HttpServletResponse response,
								@PathVariable long room_id,
								@RequestBody String json) {
		
		if (dAOService.getRoomIdByCreator(principal.getName()) != room_id) {
			response.setStatus(403);
			return;
		}
		
		DInputState state = validateJsonService.validateAndParse(json, DInputState.class, null);
		
		dAOService.updateRoom(room_id, state);
		return;
	}
}



