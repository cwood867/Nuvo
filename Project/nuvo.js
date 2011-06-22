var NUVO = {
	
	//constants
	JOINSTART:	 0,
	MasterZone: 0,
	
	setup: function() {
		NUVO.log("Object Created");
		
		CF.watch(CF.FeedbackMatchedEvent, "NUVO", "NUVO_Feedback", NUVO.ProcessFeedback);
		CF.watch(CF.ConnectionStatusChangeEvent, "NUVO", NUVO.onConnectionChange, false);
	},
	
	onConnectionChange: function (system, connected, remote) {
		if (connected) {
			// Connection established
			NUVO.log("Connected!");
		} else {
			// Connection lost
			NUVO.log("Disconnected!!");
		}
	},
	
	zoneStartup: function() {
	
		var msg = "";
		CF.listRemove("l1");
		for (i = 1; i < 17; i++) {
		
			msg = "*zcfg" + i + "status?";
			NUVO.sendCommand(msg);
		}
	},
	
	selectZone: function (list, listIndex) {
		
		CF.listContents(list, listIndex, 1, function(items) {
			for (var i = 0; i < items.length; i++) {
				// log a line with the item index
				var s = "[" + i + "] ";
				var item = items[i];
				for (var join in item) {
					// add the join and value
					s += join + "=" + item[join].value;

					// add the tokens if they exist
					var tokens = "";
					for (var token in item[join].tokens) {
						tokens += token + ": " + item[join].tokens[token];
						if (token == "[zonenum]") {
							NUVO.MasterZone = item[join].tokens[token];
							NUVO.log(NUVO.MasterZone);
						}
					}
					if (tokens.length)
						s += " (" + tokens + ") ";
				}
			NUVO.log(s);
		}
	});
		
},
	
	ProcessFeedback: function (feedbackname, feedbackstring) {
	
		var myCommand = feedbackstring.split(",")
		var configRegex = /#ZCFG(\d+)/g;
		
		
		if (configRegex.test(myCommand[0])) {
			configRegex.lastIndex=0; 
			var zonenum = configRegex.exec(myCommand[0]);
			
			if (myCommand[1] == "ENABLE1") {
			
				configRegex = /NAME\"(.*)\"/;
				var zonename = configRegex.exec(myCommand[2]);
				NUVO.log("matched:" + zonenum[1] + ": " + zonename[1] );
				
				CF.listAdd("l" + (NUVO.JOINSTART + 1), [
					{
						s2: {
							value: zonename[1],
							tokens: {
								"[zonenum]":zonenum[1],
								"[zonename]":zonename[1]
							}
						}
					}
				]);
				
				
			}
		}
	
	},
	
	
	sendCommand: function (command) {
		NUVO.log("Send Command " + command);
		CF.send("NUVO", command + "\r", CF.BINARY);
	},
	
	log: function(message) {
		if (CF.debug) {
			CF.log("NUVO: " + message);
		}
	}
	
}

CF.modules.push({name:"NUVO", setup:NUVO.setup});