package com.example.demo.repositories;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.hibernate.LockMode;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.poll.DCandidateState;
import com.example.demo.dto.poll.DPollResult;
import com.example.demo.entities.FPoll;
import com.example.demo.entities.FPollFCharacterFStage;
import com.example.demo.entities.FPollFCharacterFStageId;
import com.example.demo.entities.FPollId;
import com.example.demo.entities.FRoom;
import com.example.demo.entities.FStage;
import com.example.demo.views.UsernamePindex;

@Component
public class PollRepository {
    @Autowired
    SessionFactory sessionFactory;
    
    @Transactional(isolation = Isolation.READ_COMMITTED, readOnly=true)
	public List<DPollResult> getPollResults(long room_id) {
    	Session session = sessionFactory.getCurrentSession();
    	FRoom room =  (FRoom) session.get(FRoom.class, room_id);
    	FStage fstage = room.getCurrentStage();
    	
		List<FPoll> fpolls = session.createSelectionQuery("from FPoll p where p.room = :room", FPoll.class)
				.setParameter("room", room).getResultList();
		
		List<DPollResult> results = new ArrayList<>(fpolls.size());
		
		for (FPoll fpoll : fpolls) {
			DPollResult result = new DPollResult();
			
			result.setId(fpoll.getName());
			
    		List<Long> table = session.createSelectionQuery(
    			  "select pcs.outVotesMask "
  				+ "from FPollFCharacterFStage pcs "
  				+ "where pcs.room = :room and pcs.pollId = :poll_id "
  				+ "and pcs.stageId = :stage_id order by pcs.pindex", Long.class)
  				.setParameter("room", room)
  				.setParameter("poll_id", fpoll.getName())
  				.setParameter("stage_id", fstage.getName())
  				.getResultList();
			
			result.setTable(table);
			
			results.add(result);
		}
		
		return results;
	}
    
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Map.Entry<List<DCandidateState>, Short> addVote(
    		List<Integer> selected, 
    		long room_id, 
    		String pollName,
    		String stage,
    		short pindex) {
    	
    	Session session = sessionFactory.getCurrentSession();
    	FRoom room = session.getReference(FRoom.class, room_id);
    	FPoll poll =  session.getReference(FPoll.class, new FPollId(pollName, room));
    	
		FPollFCharacterFStage voter = session.get(FPollFCharacterFStage.class,
				new FPollFCharacterFStageId(room, pollName, stage, pindex), LockMode.PESSIMISTIC_WRITE);
    	
    	if (selected.size() < poll.getMinSelection() || selected.size() > poll.getMaxSelection())
    		return null;
    	
    	if (!voter.getCanVote())
    		return null;
    	
		FPollFCharacterFStage alias_voter = voter;
		
		if (voter.getAlias() != voter.getPindex())
			alias_voter = session.get(FPollFCharacterFStage.class,
					new FPollFCharacterFStageId(room, pollName, stage, voter.getAlias()), LockMode.PESSIMISTIC_WRITE);
    	
    	if (alias_voter.getOutVotesMask() != 0)
    		return null;
		
    	List <DCandidateState> candidateStates = new ArrayList<>();
    	
    	for (int index : selected) {
    		
    		if ((voter.getCandidates() & (1L << index)) == 0)
    			return null;
    		
    		//session.createNativeMutationQuery("update fpollfcharacterfstage set outvotesmask = outvotesmask | :mask where ");
    		
    		alias_voter.setOutVotesMask(alias_voter.getOutVotesMask() | (1L << index));
    		
    		FPollFCharacterFStage option = session.get(FPollFCharacterFStage.class,
    				new FPollFCharacterFStageId(room, pollName, stage, (short)index), LockMode.PESSIMISTIC_WRITE);
    		
    		option.setInVotesMask(voter.getInVotesMask() | (1L << pindex));
			
			DCandidateState candidate = new DCandidateState();
			candidate.setPollName(pollName);
			candidate.setCandidateId(index);
			candidate.setVotes(Long.bitCount(option.getInVotesMask()));
			candidate.setStage(stage);
			candidateStates.add(candidate);
    	}
    	
    	return Map.entry(candidateStates, voter.getAlias());
    }
    

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public boolean showVotes(long room_id, String pollName) {
    	Session session = sessionFactory.getCurrentSession();
    	FRoom room = session.getReference(FRoom.class, room_id);
    	FPoll poll =  session.get(FPoll.class, new FPollId(pollName, room));
    	
    	return poll.isShowVotes();
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
	public List<String> getPlayersForPoll(long roomId, String pollName, String stage) {
		Session session = sessionFactory.getCurrentSession();
		FRoom froom = session.getReference(FRoom.class, roomId);
		
		List<UsernamePindex> players = session.createSelectionQuery(
  			  "select u.username, u.character.pindex "
				+ "from FUser u, FPollFCharacterFStage pcs "
				+ "where pcs.room = :room and pcs.pollId = :poll_id and pcs.stageId = :stage_id "
				+ "and u.character.room = :room and u.character.pindex = pcs.pindex "
				+ "and pcs.canVote = true", UsernamePindex.class)
				.setParameter("room", froom)
				.setParameter("poll_id", pollName)
				.setParameter("stage_id", stage)
				.getResultList();
		
		return players.stream().map(player -> player.getUsername()).toList();
	}
}
