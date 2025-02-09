package com.example.demo.repositories;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.message.DOutputMessage;
import com.example.demo.dto.poll.DCandidateState;
import com.example.demo.dto.poll.DPollResult;
import com.example.demo.entities.FMessage;
import com.example.demo.entities.FPoll;
import com.example.demo.entities.FPollId;
import com.example.demo.entities.FPollFStage;
import com.example.demo.entities.FPollFStageId;
import com.example.demo.entities.FRoom;
import com.example.demo.entities.FStage;
import com.example.demo.entities.FStageId;
import com.example.demo.views.UsernamePindex;

@Component
public class PollRepository {
    @Autowired
    SessionFactory sessionFactory;
    
    @Transactional(isolation = Isolation.READ_COMMITTED, readOnly=true)
	public List<DPollResult> getPollResults(long room_id) {
    	Session session = sessionFactory.getCurrentSession();
    	FRoom room =  (FRoom) session.getReference(FRoom.class, room_id);
    	
		List<FPoll> fpolls = session.createSelectionQuery("from FPoll p where p.room = :room and p.currentState is not null", FPoll.class)
				.setParameter("room", room).getResultList();
		
		List<DPollResult> results = new ArrayList<>(fpolls.size());
		
		for (FPoll fpoll : fpolls) {
			DPollResult result = new DPollResult();
			
			result.setId(fpoll.getName());
			result.setTable(fpoll.getCurrentState().getPollTable());
			
			results.add(result);
		}
		
		return results;
	}
    
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public List<DCandidateState> addVote(
    		List<Integer> selected, 
    		long room_id, 
    		String pollName,
    		String stage,
    		short pindex) {
    	
    	Session session = sessionFactory.getCurrentSession();
    	FRoom room = session.getReference(FRoom.class, room_id);
    	FPoll poll =  session.getReference(FPoll.class, new FPollId(pollName, room));
    	FStage fstage = session.getReference(FStage.class, new FStageId(stage, room));
    	FPollFStage poll_state = session.get(FPollFStage.class, new FPollFStageId(fstage, poll));
    	
    	if (selected.size() < poll.getMinSelection() || selected.size() > poll.getMaxSelection())
    		return null;
    	
    	if ((poll_state.getCanVote() & (1L << pindex)) == 0)
    		throw null;
    	
    	List <DCandidateState> candidateStates = new ArrayList<>();
    	
    	for (int index : selected) {
    		
    		if ((poll_state.getCandidatesMask() & (1L << index)) == 0 || (!poll.isSelfUse() && pindex == index))
    			return null;
    		
			long[] table = poll_state.getPollTable();
			table[pindex] |= 1L << index;
			poll_state.setPollTable(table);

			long[] rev_table = poll_state.getReversePollTable();
			rev_table[index] |= 1L << pindex;
			poll_state.setReversePollTable(rev_table);
			
			DCandidateState candidate = new DCandidateState();
			candidate.setPollName(pollName);
			candidate.setCandidateId(index);
			candidate.setVotes(Long.bitCount(rev_table[index]));
			candidate.setStage(stage);
			candidateStates.add(candidate);
    	}
    	
    	return candidateStates;
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
		FPoll fpoll = session.getReference(FPoll.class, new FPollId(pollName, froom));
		FStage fstage = session.getReference(FStage.class, new FStageId(stage, froom));
		FPollFStage poll_state = session.get(FPollFStage.class, new FPollFStageId(fstage, fpoll));
		
		List<UsernamePindex> players = session.createSelectionQuery(
    			"select u.username, u.character.pindex "
    			+ "from FUser u "
    			+ "where u.character.room = :room", UsernamePindex.class)
				.setParameter("room", froom).getResultList()
				.stream().toList();

		return players.stream().filter(player -> (poll_state.getCanVote() & (1 << player.getPindex())) != 0)
				.map(player -> player.getUsername()).toList();
	}
}
