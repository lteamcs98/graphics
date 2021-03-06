var Challenge = require('../models/challenge');
var Submission = require('../models/submission');
var error = require('../public/js/uploadErrorCheck.js');
var challengeJSONs = require('../public/js/extractchallenges.js');
var hash = require('../public/js/hash.js');
var visitors = 0

module.exports = function(app, fs, yaml, root_url)
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

				// Save all properties to results objects
				allResults = [];
				for (var i = 0; i < numberOfChallenges; i++) {
					var result = {
						id: challengeIdList[i],
						name: challengeNameList[i],
						attempted: attemptedList[i],
						percentage: percentageList[i]
					};
					allResults.push(result);
				}

				// Render objects to the jade file
				res.render('allResults',{
					'results': allResults,
					'numberOfChallenges': numberOfChallenges,
					'admin': req.user.admin,
					'instructor': req.user.instructor
				});
			});
		}
	});

	//results for a paticular challenge
	app.get('/results/:id', function(req, res)
	{
		if (! req.user.instructor) {
			res.render('unauthorized');
		}
			else {
			 Submission.find({ challengeId : Number(req.params.id) }, 'userName firstName lastName result', function(err, submissions)
			 {
				if (err || submissions == null)
				{
					res.redirect('/results');
				}
				else
				{

				    var userNameList = [];
					var resultList = [];

					submissions.sort({ lastName: 1 });

					submissions.forEach(function(submiss){

						userNameList.push(submiss.userName);
						resultList.push(submiss.result);

						console.log(submiss.userName);
					});

					// Save all properties to results objects
					allResults = [];
					for (var i = 0; i < resultList.length; i++) {
						var result = {
							username: userNameList[i],
							correct: resultList[i]
						};
						allResults.push(result);
					}

					res.render('challengeResults',{
						'results': allResults,
						'admin': req.user.admin,
						'instructor': req.user.instructor
					});
				}
			 });
		}
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
							'firstName': req.user.firstName,
							'lastName': req.user.lastName,
							'oldSub': userCode,
							'challengeId': chal.challengeId,
							'challengeName': chal.title,
							'problem': chal.problem,
							'functionNames': chal.functionNames,
							'functionHeaders': chal.functionHeaders,
							'inputArray': chal.inputArray,
							'outputArray': chal.outputArray,
							'rootURL': root_url
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
					res.render('challengelist', {
						'challengelist': challenges,
						'rootURL': root_url,
						'admin': req.user.admin,
						'instructor': req.user.instructor});
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

	app.get('/studentchallengelist', function(req, res) {
		Challenge.find(function(err, challenges) {
			if (err) return console.error(err);
			res.render('studentchallengelist', {
				'challengelist': challenges,
				'admin': req.user.admin,
				'instructor': req.user.instructor});
		});
	});


	app.post('/deletechallenge', function(req, res) {

		if (! req.user.instructor) {
			res.render('unauthorized');
		}
		else {
			var challengeId = parseInt(req.body.challengeId);
			var selector = { "challengeId" :  challengeId };

	                //Delete challenge with specified challengeId"
			Submission.find(selector).remove(function(err) {
				if (err) return console.error(err);
			});

			Challenge.findOne(selector).remove(function(err) {
				if (err) return console.error(err);
			});

	        // Redirect back to edit challenge list
	        res.location("editchallengelist");
	        res.redirect("editchallengelist");
	    }
	});

	app.get('/newchallenge', function(req, res) {
		if (req.user.instructor)
		{
			res.render('newchallenge', {
				title: 'Add New Challenge',
				'iframes': new Array(),
				'message': '',
				'admin': req.user.admin,
				'instructor': req.user.instructor});
		} else
		{
			res.render('unauthorized');
		}
	});

	app.post('/addchallenge', addChallenge(fs, yaml, root_url));



	function addChallenge(fs, yaml, root_url) {
		return function(req, res) {
			//Retrieve JSON file(s) selected by user
			challengeJSONs.extractchallenges(fs, req.files, addChallenges);
		 	function addChallenges(err, data) {
				if (err) throw err;
                                //Iterate through array of selected JSON files
				var docs_id = new Array();
				var htmlSnippets = new Array();
				for (var i = 0; i < data.length; i++){
					var json = JSON.parse(JSON.stringify(data[i]));
					var msg = error.uploadErrorCheck(json);
					console.log('loop', i);
					//Check validity of JSON file (uploadErrorCheck.js has more details on this)
					if (msg == true)
					{
						//Create new challenge to insert into database using the JSON file
						var newChallenge = new Challenge({"challengeId" : json.challengeId, "problem" : json.problem, "functionNames" : json.functionNames, "inputArray" : json.inputArray, "outputArray" : json.outputArray, "title" : json.title, "functionHeaders": json.functionHeaders, "visible": false });
						newChallenge.save();
						updateID(newChallenge);

						var htmlSnippet = '<iframe width="100%" height="600" frameBorder="0" src=' + '"'+ root_url + '/challenge/' + docs_id[htmlSnippets.length] + '"></iframe>';
						htmlSnippets.push(htmlSnippet);

						//Give the new challenge a unique challenge ID
						function updateID(doc)
						{
							var id_string = new String(doc._id);
							id_string = id_string.concat(doc.title);
							id_string = id_string.concat(doc.problem);
							var code = Math.abs(id_string.hashCode()); //use hashcode as challenge ID
							doc.challengeId = code;
							docs_id.push(code);
							//Update the challenge with the new challenge ID
							doc.update({ '_id': doc._id }, { 'title': doc.title, 'challengeId' : code, 'problem' : doc.problem, 'functionNames' : doc.functionNames, 'inputArray' : doc.inputArray, 'outputArray' : doc.outputArray, 'functionHeaders' : doc.functionHeaders });
						}
					}
					else
					{
					//Render error message -- upload failed because JSON file(s) wasn't formatted properly
						res.render('newchallenge', {
							"errorMsg": msg,
							"iframes": new Array(),
							'message': '',
						 	'admin': req.user.admin,
							'instructor': req.user.instructor} );
					}
	 			}
				//Print error message for non-JSON files that the user attempted to upload
				if (data.length < 1){
					res.render('newchallenge', {
						"errorMsg":"Check file format. Make sure it's a JSON file.",
						"iframes":new Array(),
						'message': '',
						'admin': req.user.admin,
						'instructor': req.user.instructor});
				}
				else
				{
					console.log(htmlSnippets);
					res.render('newchallenge', {
						"errorMsg": "Challenge(s) successfully added!!!",
						"iframes": htmlSnippets,
						"message": 'Copy and paste the iframe(s) below to embed the challenge(s) in your html page!',
						'admin': req.user.admin,
						'instructor': req.user.instructor });
				}
			};
		}
	}
}
