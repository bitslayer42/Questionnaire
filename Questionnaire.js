$(function() {
	if (!supportsLocalStorage() || !window.applicationCache) { alert("Offline apps not supported in this browser. <a href='info.html'>Help</a>"); }
	else{
		//If online get latest q and a
		//Then display form
		Initialize();
		
		//Form submit button, go to menu OR save form results
		$('#theform').on( "submit", submitForm);
		
		//Home button
		$('#Home').click(function(){
			LoadForm("HOME");
		});
		
		//DISPLAY results - Show all forms
		$('#ListSavedForms').click(ListSavedForms);			
		
		/////////////////////DEBUG//////////////////////////////////////////
		 //clear storage area
		$('#deleteall').click(function(){
			localStorage.clear();
			Initialize();
		});	
		
		//DISPLAY ALL
		$('#displayall').click(function(){
			$('#content').html($('<ul/>',{id:'ull'}));
			for (var i = 0; i < localStorage.length; i++){
				$('#ull').append('<li>'+localStorage.key(i)+':<b>'+localStorage.getItem(localStorage.key(i))+'</b></li>');
			}
		}); /**/			
		/////////////////////DEBUG//////////////////////////////////////////
		
	}
});
var Questionnaire = (function() { 
	var isMenu = false; //is currently displayed list of questions a menu?
	var resultsCounter = 0; //how many filled-in forms are stored on this computer.
	return {
		setIsMenu: function() {isMenu = true;},
		setNotMenu: function() {isMenu = false;},
		isMenu:  function() {return isMenu;},
		getResultsCount: function() {
			if(localStorage.resultsCounter){
				resultsCounter = localStorage.resultsCounter;
			}
			localStorage.resultsCounter = resultsCounter;
			return resultsCounter;
		},
		getIncrementedResultsCount: function() {
			if(localStorage.resultsCounter){
				resultsCounter = localStorage.resultsCounter;
			}
			localStorage.resultsCounter = ++resultsCounter;
			return resultsCounter;
		}
	}
})();

function clearScreen() {
	$('#theform').empty();
	$('#content').empty();
}

function Initialize() {
	clearScreen();
	//If we are online pull latest questions and answers from server and save them to localStorage.
	if (navigator.onLine) {
		$.ajax({ 
			type: 'GET', 
			url: 'GetQandA.cfm', 			
			dataType: 'json',
			error: errFunc,
			success: saveQandA
		});
	}else{
		//first time through go to home menu
		LoadForm("HOME");		
	}
}

//save newly grabbed questions to localStorage
function saveQandA(data) {	
	localStorage["QandA.length"] = data.length;
	localStorage["QandA.data"] = JSON.stringify(data);
	//first time through go to home menu
	LoadForm("HOME");	
}

//pull Q and A from localStorage, build form
function LoadForm(formName) {
	//var fieldNames = [];
	clearScreen();
	var numQandA = parseInt(localStorage["QandA.length"]); 
	if (numQandA){
		var QuID,Type,InputType,QuestionText,OptionNum,Name,AnswerText,Required,IsMenu;
		var theQandAs = JSON.parse(localStorage["QandA.data"]);
		 for (var i = 0; i < numQandA; i++) { 
			if (formName == theQandAs[i].FormID) {
				QuID = theQandAs[i].QuID; 
				Type = theQandAs[i].Type; 
				InputType = theQandAs[i].InputType;
				QuestionText = theQandAs[i].QuestionText; 
				OptionNum = theQandAs[i].OptionNum; 
				Name = theQandAs[i].Name; 
				AnswerText = theQandAs[i].AnswerText; 
				Required = theQandAs[i].Required; 
				IsMenu = parseInt(theQandAs[i].IsMenu); 
	
				if(IsMenu){
					Questionnaire.setIsMenu();	
				}
				
				if(OptionNum == "1"){ //create div to hold each question
					var divID = '#QAdiv-'+QuID;
					$('<div/>', {'class':"QAdiv",'id':'QAdiv-'+QuID}).appendTo('#theform');
				}

				if(Type == "menu"){
					Questionnaire.setIsMenu();
				}
				
				var inputID = Type+'-'+OptionNum+'-'+QuID;
				var inputName = Type+'-'+QuID;
				var labelID = 'label-'+OptionNum+'-'+QuID;
 
				$('<label/>', {'text':QuestionText,'id':labelID,'for':inputID}).appendTo(divID);
				
				if(Type == "textarea"){
					$('<textarea/>', {'id':inputID,'name':inputName,"rows":"5","cols":"30"}).appendTo(divID);
				}else{	
					$('<input/>', {'id':inputID,'name':inputName,"type":InputType,"value":Name}).appendTo(divID);
				}
				if(Type == "header"){
					$("#"+labelID).addClass("h3"); 
				}
				$('<span/>', {"text":AnswerText}).appendTo(divID);
				$('<br/>').appendTo(divID);
				
				if(Required){
					$("#"+inputID).attr("required", "true");
				}

			}
		}

		$('<input/>', {'type':"submit",'value':'Submit'}).appendTo('#theform');
	}
}

//save entered results of form. (or goto form if menu)
function submitForm(event) {
	event.preventDefault();
	if(Questionnaire.isMenu()){ //go to selected menu
		if($('input:checked').size() > 0){
			Questionnaire.setNotMenu();
			LoadForm($("input:checked").val());
		}
	}else{	//submit data	  

		var arr = [];
		var cblabel; //checkboxes and radios only have labels on the first one.
		//var rowcnt = 0;
		
		$("form").find(':input').each(function(ix){
			if(this.value !== "Submit"){
				var obj = {};
				//obj.num = rowcnt++;
				if(this.type == "checkbox"||this.type == "radio"){
					if($("label[for='"+this.id+"']").text() != ""){
						cblabel =	$("label[for='"+this.id+"']").text();
					}
					if(this.checked){
						obj.id = this.id;
						obj.label = cblabel;
						obj.value = $(this).next().text();
						arr.push(obj);
					}
				}else{
						obj.id = this.id;
						obj.label = $("label[for='"+this.id+"']").text();
						obj.value = this.value;					
						arr.push(obj);
				}
			}
		});
		
		var ResultsNumber = Questionnaire.getIncrementedResultsCount();
		localStorage["Results"+ResultsNumber] = JSON.stringify(arr);
		displayResults(ResultsNumber);
	}
}



//show one form
function displayResults(ResultsNumber){
	var ResultsStr = localStorage["Results"+ResultsNumber];
	if (ResultsStr){
		var theResults = JSON.parse(ResultsStr);
		clearScreen();
		$('#content').append($("<h3/>",{'text':"Saved Form"}))
		.append($('<div/>', {'class':"QAdiv",'id':'QAdiv'}));
		 theResults.forEach(function(anobj){
			if(anobj.id.slice(0,6) === "header"){
				$('#QAdiv').append($("<div/>",{'class':'h3','text':anobj.label}));
			}else{
				$('#QAdiv').append($("<label/>",{'text':anobj.label}))
				.append($("<span/>",{'class':'bold','text':anobj.value}))
				.append('<br>');
			}
		});
	}
}



//show ALL entered forms (no param)
function ListSavedForms(){
	var numResults = parseInt(localStorage["resultsCounter"]); 
	if (numResults && numResults > 0){
		clearScreen();
		$('#content').append('<h3/>',{'text':'List of Saved Forms'});
		for (var i = 1; i <= numResults; i++) { //loop through each result
			var theName;
			var ResultsStr = localStorage["Results"+i];
			if(ResultsStr) {
				var theResults = JSON.parse(ResultsStr);
				theResults.forEach(function(arow){ //loop through each question in this result
					if(arow.label === "Name"){
						theName = arow.value;
						$('#content').append($("<a/>",{'href':'javascript:displayResults('+ i +')','text':arow.value}))
						.append('<br>')

					}
				});
			}
		}
		$('#content').append('<br>').append($("<button/>",{'id':'clear','text':'Delete Stored Forms'}));
		$('#clear').click(function(){
			localStorage.clear();
			Initialize();
		});	
	} else {
		alert("No forms are saved.");
	}
}
	
function supportsLocalStorage() {
	return ('localStorage' in window) && window['localStorage'] !== null;
}

function errFunc(xhr, status, error) {
	$("#content").html(xhr.responseText + '::' + error);
}



