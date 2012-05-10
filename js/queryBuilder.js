// note for me:
// selector and selectorInput=> variable don't have question mark
// triple => have question mark

function init() {

// save all selectors, inclusive undefined
selectors = new Array();
// only save valid selectors
variablesArray = new Array();
// Add first selector
addSelector();
// criteria for lock. elements with this borderSyle are locked
borderStyle = '2px dashed lightgrey';

// Limit for autocomplete
acQueryLimit='100';

/*This section deals with series of SPARQL queries used to retrieve different values from DBPedia so as to get a full list of things on the screen*/
    	var acQuery = "PREFIX ontology: <http://dbpedia.org/ontology/> PREFIX property: <http://dbpedia.org/property/> PREFIX resource: <http://dbpedia.org/resource/> PREFIX position:<http://www.w3.org/2003/01/geo/wgs84_pos#> SELECT DISTINCT ?o WHERE { resource:Bihar <http://dbpedia.org/ontology/leaderName> ?o. }";
	
/*This section prepares queries to issue to DBPedia. This is a lot helpful so as to query DBPedia for the data. This list gets prepared in accordance with the above query fields */
	var REQUEST_URL=getRequestURL(acQuery);


		$( "#autocomplete" ).autocomplete({
			source: function( request, response ) {
				uriCache = new Array();
				$.ajax({
					url: REQUEST_URL,
					dataType: "jsonp",
					data: {
						featureClass: "P",
						style: "full",
						maxRows: 12,
						matchContains: true
					},
					success: function( data ) {
						response( $.map( data.results.bindings, function( item ) {
							parsedUri = parseUri(item.o.value,uriCache);
							return {
								label: parsedUri,
								value: parsedUri
							}
						}));
						$( "#autocomplete" ).autocomplete({source:uriCache});
					}
				});
			},
			minLength: 1,
			select: function( event, ui ) {
				var msg="";
				$("#stuff").append("ui.item.value: "+ui.item.value+ " ... ui: "+ui.item);
				for(var i=0;i< uriCache.length;i++)
					msg+=uriCache[i]+" | ";
				$("#stuff").append("</br>ARRAY: </br>"+msg);
			},
			open: function() {
				$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
			},
			close: function() {
				$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
			}
		});

	// Dialog
	$(".popupAddTriple").dialog({ autoOpen: false });
	$(".popupChangeVariable").dialog({ autoOpen: false });
}

/*Parse uri and add to cache*/
function parseUri(uri,uriCache){
	var buffer = uri;
	index =uri.lastIndexOf('/');
	if(index!=-1){
		var prefix = parsePrefix(buffer.substring(0,index));
		var suffix = buffer.substring(index+1);
		parsed = prefix+suffix;
	}
	else
		parsed = buffer;
	//uriCache.push(parsed);
	//return parsed;
	uriCache.push(uri);	
	return uri;
}

function addPrefix(){
	var newPrefix = $("<div class='prefix'>PREFIX <input class='prefixNamespace'></input> : &lt; <input class='prefixUri'></input> &gt; <a title='Remove this prefix' onclick='removePrefix(this.parentNode)' href='#'>[-]</a></div>").hide().show('drop');

	$('#prefixInput').append(newPrefix);

	
}

function parsePrefix(prefix){
	//
	return ":";
}

function addSelector(){
		
	var selectorsLength = selectors.length;
	var selectorValue='x'+selectorsLength;
	/*if(selectorsLength==0)
		selectorValue='x';
	else{
		for (var i = selectorsLength-1;i>-1;i--){
			//alert(i+" : "+selectors[i]);
			if(selectors[i] != undefined){
				selectorValue=selectors[i];
				break;
			}
		}
	}*/
	var selectorName = "selector"+selectors.length;
	var newSelector = $("<div class='selector' ><button id='"+selectorName+"Button'>? <input id='"+selectorName+"' value='"+selectorValue+"'></input></button><a title='Remove this triple pattern' onclick='removeSelector(this.parentNode,"+selectorName+"Hide,"+selectorsLength+")' href='#'>[-]</a></div>"+
	"<div id='"+selectorName+"Hide' style='margin-left:150px;padding:10px;border:1px solid grey;text-align:center;background-color:white;width:400px'>"+
"<button onClick='showAddTripleOptions("+selectorsLength+")'>Add Triple Pattern</button>"+
"<button onClick='showChangeVariableOptions("+selectorsLength+")'>Change Variable</button>"+"</div>").hide().show('drop');

	selectors.push(selectorValue);
	$('#selectInput').append(newSelector);
	//$('#'+selectorName+'Button').show('drop');
	$("#"+selectorName+"Hide").hide();
	// Set UI button
	$('#'+ selectorName+'Button' ).button().click(function() {
		
		options("#"+selectorName+"Hide");
		
		//var newValue = 'xxx';		
		//$('#'+selectorName).val(newValue);
		//selectors[selectorsLength]=newValue;
		//$('#'+selectorName).attr('disabled', '');
	});
	$('#'+ selectorName+'Button' ).css('background','#AFC7C7');
	$('#'+ selectorName+'Button' ).css('border','1px solid grey');
	$('#'+ selectorName+'Button' ).css('margin','5px');
}

function removePrefix(node){
	$(node).hide('drop',function(){ $(node).remove(); });
}

function removeSelector(node, nodeOption,index){
	var value = '?'+$("#selector"+index).val();
	//alert("val: "+value);
	if($(nodeOption).is(':visible'))
		$(nodeOption).hide('drop',function(){ $(nodeOption).remove(); });
	else
		$(nodeOption).remove();
	$(node).hide('drop',function(){ $(node).remove(); });
	delete selectors[index];
	// delete triple pattterns containing selector
	$('.triple').each(function(index) {
		//alert('subject val: '+$(this).find(".subject").val());
	    if (($(this).find(".subject").val()==value) || ($(this).find(".predicate").val()==value) 
		|| ($(this).find(".object").val()==value))
		removeTriple($(this));		
	});
}

function removeTriple(node){
	$(node).hide('slide',function(){ $(node).remove(); });
}
function showArray(){
	$('#test').html("");	
	var array="";
	for (var i=0;i<selectors.length;i++)
		array+=selectors[i]+' | '
	$('#test').append('<p>length: '+selectors.length+'</p>'+array);
}


function options(selectorName){
	if($(selectorName).is(":visible"))
		$( selectorName).hide("drop",300);
	else
		$( selectorName).show( "bounce", 100);
}

function addTriple(){
	var newTriple =$("<div class='triple'>"+
	"<input class='subject' value='?s'></input>"+
	"<input class='predicate' value='?p'></input>"+
	"<input class='object' value='?o'></input>"+
	"<a title='Remove this triple' onclick='removeTriple(this.parentNode)' href='#'>[-]</a></div>").hide().show('drop');
	$('#whereInput').append(newTriple);
	// Set AC
	alert("bla");
	$(".predicate").keypress(function(event) {
	  if ( event.which == 13 ) {
	     //event.preventDefault();
	   }
	   //var msg = "Handler for .keypress() called time(s).";

	//alert(msg);
	});

	
}

function addTriple(selectorIndex,position){
	var variable = '?'+$('#selector'+selectorIndex).val();
	var subject="value ='?s'";
	var predicate="value ='?p'";
	var object="value ='?o'";
	if(position==1)
		subject="value='"+variable+"' readonly='readonly' style='border:2px dashed lightgrey;background:#F7F6F6;'";
	else if(position==2)
		predicate="value='"+variable+"' readonly='readonly' style='border:2px dashed lightgrey;background:#F7F6F6;'";
	else if(position==3)
		object="value='"+variable+"' readonly='readonly' style='border:2px dashed lightgrey;background:#F7F6F6;'";
	var newTriple =$("<div class='triple'>"+
	"<input class='subject' "+subject+"></input>"+
	"<input class='predicate' "+predicate+"></input>"+
	"<input class='object' "+object+"></input>"+
	"<a title='Remove this prefix' onclick='removeTriple(this.parentNode)' href='#'>[-]</a><img class='load' src='css/images/load.gif' style='display: none;'></div>");
	newTriple.hide().show('drop');
	$('#whereInput').append(newTriple);
	$(".popupAddTriple").dialog('close');
	newTriple.find("input").keydown(function(event) {
		if(event.target.readOnly==false){
			if (event.which == 13) {
				if ((event.target.style.border).length == 0) {			
					event.preventDefault();
					event.target.style.border=borderStyle;
				}else
					event.target.style.border='';
			}else{
				//alert("not enter: " +$(event.target).val()+ " #### "+event.target.value);
				if((event.target.style.border).length == 0) // if this element not locked than set autocomplete
					setAc(event.target);		
			}

		}	
		var msg = "Handler for .keypress(). Element: "+(event.target.style.border);
		//alert(msg);
	});
	
}

function showAddTripleOptions(selectorIndex){
	var variable = $('#selector'+selectorIndex).val();
	$(".popupAddTriple").html( "Add new triple. </br>Use variable = '<b>?"+variable+"</b>' as:</br></br>"+
	"<button onClick='addTriple("+selectorIndex+",1)'>subject</button>"+
	"<button onClick='addTriple("+selectorIndex+",2)'>predicate</button>"+
	"<button onClick='addTriple("+selectorIndex+",3)'>object</button></div>");
	$(".popupAddTriple").dialog('open');
}

function showChangeVariableOptions(selectorIndex){
	variableOldValue = $('#selector'+selectorIndex).val();
	$(".popupChangeVariable").html( "Change variable = '"+variableOldValue+"' into:</br>"+
	"<input id='selectorChangeVariableInput"+selectorIndex+"' value='newValue'></input>"+
	"<button onClick='changeVariable("+selectorIndex+")'>Change</button>");
	$(".popupChangeVariable").dialog('open');
}

/* Watch out for question mark!! */
function changeVariable(selectorIndex){
	var oldValue = '?'+variableOldValue;
	var newValue = $("#selectorChangeVariableInput"+selectorIndex).val();
	selectors[selectorIndex]=newValue; // change selector array value
	$('#selector'+selectorIndex).val(newValue); // change selectorInput 1 value
	// Change all values in whereInput
	$(".triple").each(function(index) {
		var subject = $(this).find(".subject");
		var object = $(this).find(".object");
		var predicate = $(this).find(".predicate");
		if( (subject.val() == oldValue) && (subject.is('[readonly]')==true) )
			subject.val('?'+newValue);
		else if( (predicate.val() == oldValue) && (predicate.is('[readonly]')==true) )
			predicate.val('?'+newValue);
		else if( (object.val() == oldValue) && (object.is('[readonly]')==true) )
			object.find(".object").val('?'+newValue);
	
	});
	$(".popupChangeVariable").dialog('close');
}

function setAc(domElement){
	//alert("parent: " +$(domElement).parent().attr('class'));
	var triple = $(domElement).parent();
	var thisClass = $(domElement).attr('class');
	var subject = $(this).find(".subject");
	var object = $(this).find(".object");
	var predicate = $(this).find(".predicate");	
	var countLocked=0;
	triple.find("input").each(function(index){
		//alert("class: "+$(this).attr('class')+" border: "+$(this).css('border-left-style') + " , value: "+$(this).val());
		if( ($(this).is('[readonly]')) || ($(this).css('border-left-style') == 'dashed') )
			countLocked++;
	});
	//alert("num: "+countLocked);
	//if(thisClass == subject.attr('class'))
		

	//alert(bla+"- child: " +$(domElement).parent().attr('class'));
	if(countLocked ==2){ // if the other remaining fileds are locked, ajax call
		$(domElement).autocomplete({
			source: function( request, response ) {
				uriCache = new Array();
				var url = getAcQuery(domElement);
				url = getRequestURL(url);
				//alert("activate autocomplete: "+url);
				$.ajax({
					url: url,
					dataType: "jsonp",
					data: {
						featureClass: "P",
						style: "full",
						maxRows: 12,
						matchContains: true
					},
					timeout: 13000,
					beforeSend: function(){
						if( ($(domElement).css('border-left-style') == 'dashed') || 
								($(domElement).data('data-ac')=='started') ){ // locked or marked
							return false;
						}else {
								//alert("custom attr: "+$(domElement).data('data-marker'));
								// Mark this element, autocomplete request started
								$(domElement).data('data-ac','started');
								// Show load gif 
								$(domElement).parent().find('.load').show('drop');
								// Set locked
								domElement.style.border = borderStyle;
								return true;
						}
					},
					success: function( data ) {
						// Show buffer image
						//alert("elemt"+$(domElement).parent().find('.load'));
						
						response( $.map( data.results.bindings, function( item ) {
							parsedUri = parseUri(item.acValue.value,uriCache);
							return {
								label: parsedUri,
								value: parsedUri
							}
						}));
						$(domElement).autocomplete({source:uriCache});
						//alert("cahce: "+uriCache);
						// Hide load			
						$(domElement).parent().find('.load').hide();
						// Unmark
						$(domElement).removeData('data-ac');

					},
					 error: function (request, status, error) {
						// Hide load	
						$(domElement).parent().find('.load').hide();
						alert("Error: Timeout (13s) for autocomplete request.");
						$(domElement).val('');
						// Unmark
						$(domElement).removeData('data-ac');
					}

				});
			},
			minLength: 1,
			select: function( event, ui ) {
				// if select (press enter) don't unlock element
				domElement.style.border = borderStyle;
				var msg="";
				$("#stuff").append("ui.item.value: "+ui.item.value+ " ... ui: "+ui.item);
				for(var i=0;i< uriCache.length;i++)
					msg+=uriCache[i]+" | ";
				$("#stuff").append("</br>ARRAY: </br>"+msg);
			},
			open: function() {
				$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
			},
			close: function() {
				$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
			}
		}); // autocomplete end

	} //if end

}

function getAcQuery(domElement){
	// set marker-attribute for getAcQuery(), remove at end
	$(domElement).data('data-marker','marked');
	//var acQuery = "PREFIX ontology: <http://dbpedia.org/ontology/> PREFIX property: <http://dbpedia.org/property/> PREFIX resource: <http://dbpedia.org/resource/> PREFIX position:<http://www.w3.org/2003/01/geo/wgs84_pos#> SELECT DISTINCT ?o WHERE { resource:Bihar <http://dbpedia.org/ontology/leaderName> ?o. }";
	var query ="";
	variables="";
	var limiter = 'Limit '+acQueryLimit;
	var select = 'SELECT DISTINCT ?acValue ';
	var filter = "OPTIONAL { FILTER (lang(?acValue) ='en').} ";


	var patterns="";	
	$('.triple').each(function(index) {
	    patterns+=getAcTriple($(this));
	});
	patterns ="WHERE { "+patterns+filter+" } ";
	if(patterns.length == 0){
		alert("Ooops! Your where section is empty!");
		return;
	}

	query=getPrefix()+select+patterns+limiter;
	$('textarea').val(query);
	
	// unmark
	$(domElement).removeData('data-marker');
	return query;

}

function getAcQuery2(){
var acQuery = "PREFIX ontology: <http://dbpedia.org/ontology/> PREFIX property: <http://dbpedia.org/property/> PREFIX resource: <http://dbpedia.org/resource/> PREFIX position:<http://www.w3.org/2003/01/geo/wgs84_pos#> SELECT DISTINCT ?o WHERE { resource:Bihar <http://dbpedia.org/ontology/leaderName> ?o. }";
return acQuery;
}
function getPatterns(){
	var triplePatterns="";	
	$('.triple').each(function(index) {
	    triplePatterns+=getTriple($(this));
	});
	//alert("triple pattern: "+triplePatterns);
	if(triplePatterns.length == 0)
		return "";
	return "\nWHERE { "+triplePatterns+" } ";
}

function getTriple(triple){
	var subject = triple.find(".subject").val();
	var predicate = triple.find(".predicate").val();
	var object = triple.find(".object").val();
	var triple= subject+" "+predicate+" "+object+". ";
	return triple;
}

function getAcTriple(triple){
	var subject = triple.find(".subject");
	var predicate = triple.find(".predicate");
	var object = triple.find(".object");
	var subjectVal = subject.val();
	var predicateVal = predicate.val();
	var objectVal = object.val();
	if(subject.data('data-marker')=='marked'){
		//alert("same as subject "+subject.data('data-marker'));
		subjectVal='?acValue';
	}else if(object.data('data-marker')=='marked'){
		//alert("same as object "+object.data('data-marker'));
		objectVal='?acValue';
	}else if(predicate.data('data-marker')=='marked'){
		//alert("same as predicate "+predicate.data('data-marker'));
		predicateVal='?acValue';
	}//else alert("Error: Couldn't find marker!");
	var triple= subjectVal+" "+predicateVal+" "+objectVal+". ";
	return triple;
}


function getRequestURL(query){
	var url = "http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=" + escape(query) + "&format=json";
	return url;
}

function setQuery(){
	var query ="";
	variables="";
	var limiter = getLimit();
	var select = getSelect();
	var patterns=getPatterns();	
	if(select.length == 0){
		alert("Ooops! Your select section is empty!");
		return;
	}
	if(patterns.length == 0){
		alert("Ooops! Your where section is empty!");
		return;
	}
	query=getPrefix()+select+patterns+getFilter()+limiter;
	$('textarea').val(query);

}

function getPrefix(){
	var prefix="";
	var defaultPrefix = "PREFIX ontology: <http://dbpedia.org/ontology/>  \nPREFIX property: <http://dbpedia.org/property/> \nPREFIX resource: <http://dbpedia.org/resource/> \nPREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \nPREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \nPREFIX owl: <http://www.w3.org/2002/07/owl#> ";
	$('.prefix').each(function(index) {
	    prefix += "\nPREFIX "+ $(this).find(".prefixNamespace").val()+": <"+$(this).find(".prefixUri").val()+"> ";
	});
	//alert("prefix: "+prefix);
	return defaultPrefix+prefix;
}
function getSelect(){
	variablesArray =new Array();
	var variables ="";
	for (var i=0;i<selectors.length;i++){
		if(selectors[i] != undefined)
			variablesArray.push("?"+selectors[i]);
	}
	for(var j=0;j<variablesArray.length;j++){
		variables += variablesArray[j];
		if(j != variablesArray.length-1)
			variables+=" , ";
	}
	//alert("Vars: "+variables);
	if (variables.length ==0)
		return "";
	return "\nSELECT DISTINCT "+variables+" ";
}


function getFilterTriple(filterTriple){
	var subject = filterTriple.find(".subject").val();
	var predicate = filterTriple.find(".predicate").val();
	var object = filterTriple.find(".object").val();
	var boolOperator = filterTriple.find(".boolOperator").val();
	if(subject.indexOf("?") != -1)
		variables+=","+subject;
	if(object.indexOf("?") != -1)
		variables+=","+object;
	if(predicate.indexOf("?") != -1)
		variables+=","+predicate;
	var triple= " "+subject+" "+predicate+" "+object+" "+boolOperator;
	return triple;
}

function getFilter(){
	if($('.filter').length==0)
		return "";
	var filter="\nFILTER ";	
	$('.filter').each(function(index) {
	    filter+=getFilterTriple($(this));
	});
	//var filter = "FILTER (lang(?Abstract)=\"en\")";
	alert("Filter: "+filter);
	return filter;
}

function getLimit(){
	limit = $('#limit').val();
	var limitPattern="\nLimit "+limit;
	
	//alert("limit: "+limit);
	return limitPattern;
}

function checkAc(){
	
}

function getQuery(){
	var query = $('textarea').val();
	if(query.length == 0)
		setQuery();
	return $('textarea').val();
}

function executeQuery(callback){
	$('#queryLoad').show('drop');
	$('#tripleResult').html(" ");
	$('#tripleResult').append("<strong>Results:</strong>");
	
	table ="";
	tableBody="";
	tableHead="";

	var query = getQuery();
	var URL="http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=" + escape(query) + "&format=json";
	$.ajax({
		url:URL,
		dataType: 'jsonp',
		jsonp: 'callback',
		timeout: 13000,
		success:function(data) {
			for(var i=0;i<data.results.bindings.length;i++){
				addTableRow(data.results.bindings[i]);
			}
			setTable();
			// Hide load	
			$('#queryLoad').hide('slide');

		},
		error: function (request, status, error) {
			// Hide load	
			$('#queryLoad').hide('slide');
			alert("Error: Timeout (13s) for autocomplete request.");
		}
	});
	$('#tripleResult').show();
	
				
}

function setTable(){
	$('#output').html("");
	setTableHead();	
	table+=("<table cellpadding='0' cellspacing='0' border='0' class='display' id='tableResult' width='100%'>");
	table+=(tableHead);
	table+=(tableBody);
	table+=("</table>");
	$('#output').html(table);
	$('#tableResult').dataTable({"bJQueryUI": true,
					"sPaginationType": "full_numbers"});
}
function addTable(){
	
	table.append("<table cellpadding='0' cellspacing='0' border='0' class='display' id='tableResult' width='100%'>");
	
}

function addTableRow(row){
	tableBody+="<tr>";
	$.each(row, function(k, v) {
		tableBody+="<td>"+v.value+"</td>";
					});
	tableBody+="</tr>";
}
function setTableHead(){
	tableHead="<thead><tr id='tableHead'>";
	if(variablesArray.length==0)
		getSelect();
	for(var j=0; j<variablesArray.length;j++){
		addToTableHead(variablesArray[j]);
		//alert("vars: "+vars[j]);
	}
	tableHead+="</tr></thead>";

}
function addToTableHead(value){
	tableHead+="<th>"+value+"</th>";
}

function addToTableBody(value){
	tableBody+="<td>"+value+"</td>";
}

function setButton(){
	$( ".selector" )
						.button()
						.click(function() {
							alert( "Running the last action" );
						});
}
/*Here goes most of the ajax requests for the different things that we are aiming for */
function getAbstract()
{

/*This section deals with series of SPARQL queries used to retrieve different values from DBPedia so as to get a full list of things on the screen*/
    	var bla = "PREFIX ontology: <http://dbpedia.org/ontology/> PREFIX property: <http://dbpedia.org/property/> PREFIX resource: <http://dbpedia.org/resource/> PREFIX position:<http://www.w3.org/2003/01/geo/wgs84_pos#> SELECT DISTINCT ?o WHERE { resource:Bihar <http://dbpedia.org/ontology/leaderName> ?o. }";
	
/*This section prepares queries to issue to DBPedia. This is a lot helpful so as to query DBPedia for the data. This list gets prepared in accordance with the above query fields */
	var URL_FOR_STATE_ABSCRACT="http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=" + escape(bla) + "&format=json";


$.ajax({
		url:URL_FOR_STATE_ABSCRACT,
		dataType: 'jsonp',
		jsonp: 'callback',
		success:function(data) {
				for(var i=0;i<data.results.bindings.length;i++){
				$('#tripleResult').append('<p>'+data.results.bindings[i].o.value+'</p>');
			}
				
		}
		
	
	});
	//$('#tripleResult').show();
}
