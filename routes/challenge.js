var Challenge = require('../models/challenge');
var Submission = require('../models/submission');
var error = require('../public/js/uploadErrorCheck.js');
var challengeJSONs = require('../public/js/extractchallenges.js');
var hash = require('../public/js/hash.js');
var visitors = 0

module.exports = function(app, fs, yaml)
{
	app.get('/results', function(req, res)
	{
		if (! req.user.instructor) {
			res.render('unauthorized');
		}
		else {

			// Queries the submission database for all submissions
			Submission.find({}, 'challengeId challengeName result', function(err, submissions)
			{
				// Sorts the submissions by challenge id
				submissions.sort({ challengeId: 1 });

				var challengeIdList = [];
				var challengeNameList = [];
				var attemptedList = [];
				var percentageList = [];
				var numberOfChallenges = 0;

				var currentChalId = -1;
				var currentIndex = -1;
				var found = false;

				// Populate parallel arrays
				for (var i = 0; i < submissions.length; i++) {
					if (submissions[i].challengeId != currentChalId) {
						challengeIdList.push(submissions[i].challengeId);
						challengeNameList.push(submissions[i].challengeName);
						attemptedList.push(1);

						percentageList.push(submissions[i].result);

						currentChalId = submissions[i].challengeId;
						currentIndex += 1;
						numberOfChallenges += 1;
					} else {
						attemptedList[currentIndex] += 1;
						percentageList[currentIndex] += submissions[i].result;
					}
				}

				// Total of results indexed by challenge divided by number of attempted
				for (var i = 0; i < numberOfChallenges; i++) {
					percentageList[i] /= attemptedList[i];
				}

				// Render objects to the jade file
				res.render('allResults',{
					'challengeIdList': challengeIdList,
					'challengeNameList': challengeNameList,
					'attemptedList': attemptedList,
					'percentageList': percentageList,
					'numberOfChallenges': numberOfChallenges
				});
			});
		}
	});

	//results for a paticular challenge
	app.get('/results/:id', function(req, res)
	{
		 Submission.find({ challengeId : Number(req.params.id) }, 'userName result', function(err, submissions)
		 {
			if (err || submissions == null)
			{
				res.redirect('/results');
			}
			else
			{

			 	var userNameList = [];
				var resultList = [];

				console.log("\nBefore Sort:");

				submissions.forEach(function(submiss){

					submiss.first = (submiss.userName).split(" ")[0];
					submiss.last = (submiss.userName).split(" ")[1];
					
					console.log("\t" + submiss.first + " " + submiss.last);
				});

				submissions.sort({ last: 1 });

				console.log("\nAfter Sort:");

				submissions.forEach(function(submiss){

					userNameList.push(submiss.userName);
					resultList.push(submiss.result);
					console.log(submiss);
					console.log("\t" + submiss.first + " " + submiss.last);
				});

				console.log("\n");

				res.render('challengeResults',{
					'userNameList': userNameList,
					'resultList': resultList
				});
			}
		 });
	});

	app.get('/myResults', function(req, res)
	{
		 Submission.find({ userId: Number(req.user.id) }, 'challengeName result', function(err, submissions)
		 {

			var challengeNameList = [];
			var resultList = [];

			submissions.forEach(function(submiss){
				resultList[submiss.challengeId] = submiss.result;
			});

			res.render('myResults',{
				'resultList': resultList,
			});

		 });
	});

	app.get('/tevnchallenge/:id', function(req, res)
	{
		Challenge.findOne({ challengeId: Number(req.params.id) }, 'title challengeId problem functionNames functionHeaders inputArray outputArray', function(err, chal)
		{
			Submission.findOne({ userId: 106516508341319860000, challengeId : Number(req.params.id) }, 'challengeId userId code', function(err, sub)
			{
				var userCode;
				if (sub === null) userCode = setEditorValue(chal.functionHeaders);
				else userCode = sub.code;

				res.render('tevnchallenge', {
					'personsID': 106516508341319860000,
					'theirName': "Tev'n Powers",
					'oldSub': userCode,
					'challengeId': chal.challengeId,
					'challengeName': chal.title,
					'problem': chal.problem,
					'functionNames': chal.functionNames,
					'functionHeaders': chal.functionHeaders,
					'inputArray': chal.inputArray,
					'outputArray': chal.outputArray
				});
			});
		});
	});

	app.get('/challenge/:id', function(req, res)
	{
		if (! req.user) {
			res.redirect('/');
		}
		else {

			Challenge.findOne({ challengeId: Number(req.params.id) }, 'title challengeId problem functionNames functionHeaders inputArray outputArray', function(err, chal)
			{
				if (err || chal == null) {
					res.redirect('/welcome');
				}
				else {
					Submission.findOne({ userId: Number(req.user.id), challengeId : Number(req.params.id) }, 'challengeId userId code', function(err, sub)
					{
						var userCode;
						if (sub === null) userCode = setEditorValue(chal.functionHeaders);
						else userCode = sub.code;

						res.render('challenge', {
							'personsID': Number(req.user.id),
							'theirName': req.user.name,
							'oldSub': userCode,
							'challengeId': chal.challengeId,
							'challengeName': chal.title,
							'problem': chal.problem,
							'functionNames': chal.functionNames,
							'functionHeaders': chal.functionHeaders,
							'inputArray': chal.inputArray,
							'outputArray': chal.outputArray
						});
					});
				}
			});
		}
	});

	function setEditorValue(headers)
	{
		var editorString = '';
		for(var i = 0; i < headers.length; i++)
		{
			editorString += 'function ' + headers[i] + '\n{\n\n}\n\n';
		}
		return editorString;
	}

	app.get('/challengelist', function(req, res) {
		if(req.user)
		{
			if (req.user.instructor)
			{
				Challenge.find(function(err, challenges) {
					if (err) return console.error(err);
					res.render('challengelist', { 'challengelist': challenges });
				});
			}
			else
			{
				res.render('unauthorized');
			}
		}
		else
		{
			res.redirect('/');
		}
	});

	app.get('/editchallengelist', function(req, res) {
		if (req.user.instructor)
		{
			Challenge.find(function(err, challenges) {
				if (err) return console.error(err);
				res.render('editchallengelist', { 'challengelist': challenges });
			});
		} else
		{
			res.render('unauthorized');
		}
	});

	app.get('/studentchallengelist', function(req, res) {
		Challenge.find(function(err, challenges) {
			if (err) return console.error(err);
			res.render('studentchallengelist', { 'challengelist': challenges });
		});
	});


	app.post('/deletechallenge', function(req, res) {
		var challengeId = parseInt(req.body.challengeId);
		var selector = { "challengeId" :  challengeId };

		Submission.find(selector).remove(function(err) {
			if (err) return console.error(err);
		});

		Challenge.findOne(selector).remove(function(err) {
			if (err) return console.error(err);
		});

        // Redirect back to edit challenge list
        res.location("editchallengelist");
        res.redirect("editchallengelist");
	});

	app.get('/newchallenge', function(req, res) {
		if (req.user.instructor)
		{
			res.render('newchallenge', { title: 'Add New Challenge', "iframes": new Array()});
		} else
		{
			res.render('unauthorized');
		}
	});

	app.post('/addchallenge', addChallenge(fs, yaml));

	function addChallenge(fs, yaml) {

		// example code for extracting challenges


		return function(req, res) {
			// Print to console the contents of user uploaded challenge.
			challengeJSONs.extractchallenges(fs, req.files, addChallenges);
		 	function addChallenges(err, data) {
				if (err) throw err;
				for (var i = 0; i < data.length; i++){
					var json = JSON.parse(JSON.stringify(data[i]));
					var docs_id = new Array();
					var htmlSnippets = new Array();
					var msg = error.uploadErrorCheck(json);

					if (msg == true) //check validity of file
					{
						var newChallenge = new Challenge({"challengeId" : json.challengeId, "problem" : json.problem, "functionNames" : json.functionNames, "inputArray" : json.inputArray, "outputArray" : json.outputArray, "title" : json.title, "functionHeaders": json.functionHeaders });
						newChallenge.save();
						updateID(newChallenge);
						renderTemplate();

						function updateID(doc)
						{
							var id_string = new String(doc._id);
							id_string = id_string.concat(doc.title);
							id_string = id_string.concat(doc.problem);
							var code = Math.abs(id_string.hashCode());
							doc.challengeId = code;
							docs_id.push(code);
							doc.update({ '_id': doc._id }, { 'title': doc.title, 'challengeId' : code, 'problem' : doc.problem, 'functionNames' : doc.functionNames, 'inputArray' : doc.inputArray, 'outputArray' : doc.outputArray, 'functionHeaders' : doc.functionHeaders });

						}
						function renderTemplate()
						{
							var htmlSnippet = '<iframe src=' + '"http://interactiveclassroom.herokuapp.com/challenge/' + docs_id[htmlSnippets.length] + '"></iframe>';
							htmlSnippets.push(htmlSnippet);
							res.render('newchallenge', {"errorMsg": "Challenge successfully added!!!", "iframes": htmlSnippets});
						}
					}
					else
					{
						res.render('newchallenge', {"errorMsg": msg, "iframes": new Array() } );
					}
	 			}
				if (data.length < 1){
					res.render('newchallenge', {"errorMsg":"Check file format. Make sure it's a JSON file.", "iframes":new Array() });
				}
			};

		}
	}
}
