//document.addEventListener("deviceready", onDeviceReady, false);
var globalurl = "http://votesapp.elasticbeanstalk.com";

$(function(){
	var phonenum="";
	var name_key="\"name\":";
	var phonenum_key="\"phone_number\":";
	var member_key="\"members\":";
	var creategroup_key="group=";
	var member_name="";
	var globalContacts = null;
	//alert("In OnDeviceReady");
	sessionStorage.phonenum=getMyPhoneNumber();
	//alert(sessionStorage.phonenum);
	getMyGroups(sessionStorage.phonenum);
	//alert("In OnDeviceReady"+phonenum);
	getContactList();

	document.addEventListener("backbutton", onBackButtonDown, false);

	function onBackButtonDown() {
	    // Handle the back button
		//alert("back button pressed.");
		//if($.mobile.activePage[0].baseURI == )
		//alert($.mobile.activePage[0].baseURI);
		//window.location='./home.html';
	}

	

	function getContactList()
	{
		function sortByContactName(a, b) { var x = a.name.formatted.toLowerCase(); var y = b.name.formatted.toLowerCase(); return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
		function onSuccess(contacts) {
			//alert(contacts);
			contacts.sort(sortByContactName);
			globalContacts = contacts;
			//alert(globalContacts);
			var html="";
			for (var i = 0; i < contacts.length ; i++) {
				if(contacts[i].name != null && contacts[i].phoneNumbers != null) {
					var name=contacts[i].name.formatted;
					for(var j = 0; j< contacts[i].phoneNumbers.length;j++) {
						var phone=contacts[i].phoneNumbers[j].value.replace(/[^\w]/gi, '');		
						//getMemberNameByPhoneNumber(contacts[i].phoneNumbers[j].value);
						//alert(name);
						if(phone.length >= 10)
						html +="<li><label><input type='checkbox' name='checkedContacts' class='checkcontacts' value='"+contacts[i].phoneNumbers[j].value+"'>"+name+" &nbsp;" + phone + "</label></li>";
					}
				}
			}
			$("#contactlist").empty();
			$( html ).appendTo( "#contactlist" );
			$("#contactlist").listview("refresh");
		};
		function onError(contactError) {
			alert('onError!');
		};

		var options      = new ContactFindOptions();
		options.filter	 = "";
		options.multiple = true;
		var fields       =  ["displayName", "name", "phoneNumbers"];
		navigator.contacts.find(fields, onSuccess, onError, options);
	}

	function getCreateGroupJSON(){

		var createGroupString = creategroup_key+"{"+name_key+"\""+($( "#groupname" ).val()+"\","+phonenum_key+sessionStorage.phonenum+","+member_key+"[");


		var selectedContacts = new Array();
		$.each($("input[name='checkedContacts']:checked"), function() {
			selectedContacts.push($(this).val());
		});
		var temp="";
		for(i=0;i<selectedContacts.length;i++)
		{
			temp=temp+"\""+selectedContacts[i].replace(/[^\w]/gi, '').substr(-10)+"\"";
			if(i !=(selectedContacts.length-1))
				temp=temp+",";
		}
		createGroupString=createGroupString+temp+"]}";
		alert(createGroupString);
		return createGroupString;

	}
	
	$("#create-group").click(function() {
		
		$("#groupname").val("");
		//getContactList();
		
	});
	
	
//	{"name":"family","phoneNumber":9960085953,"members":[9985565624,8875598624]}

	$( "#creategroup" ).click(function() {
		alert("Button Clicked");
		var data=getCreateGroupJSON();
		var url = globalurl +"/api/user/group";		
		//var url="http://10.0.2.2:8080/VotesApp/api/user/group";
		$.ajax({
			type: "POST",
			//contentType: "application/json",
			//dataType: "json",
			url: url,
			data: data,
			success: function(msg){
				//$("body").append(msg.d);
				alert("success");
				getMyGroups(sessionStorage.phonenum);
			},
			error: function () {
				alert("Error");
			}
		});
	});
	
	//deletegroup
	$( "#delete-groups" ).click(function() {
		alert("Button Clicked");
		var data="id="+$("#groupid").val();
		//alert("Data:"+data);
		var url = globalurl +"/api/user/group";	
		//var url="http://10.0.2.2:8080/VotesApp/api/user/group";
		$.ajax({
			type: "DELETE",
			//contentType: "application/json",
			//dataType: "json",
			url: url,
			data: data,
			success: function(msg){
				//$("body").append(msg.d);
				//alert("success");
				getMyGroups(sessionStorage.phonenum);
			},
			error: function () {
				alert("Error");
			}
		});
	});
	
	function isEmpty(obj) {
		for(var prop in obj) {
			if(obj.hasOwnProperty(prop))
				return false;
		}

		return true;
	}

	function getMyGroups(phonenum){
		//alert("get my groups:groups" + phonenum);
		var data="phone_number={"+phonenum_key+ "\""+phonenum+"\"}";
		var url = globalurl +"/api/user/groups";	
		//var url="http://10.0.2.2:8080/VotesApp/api/user/groups";
		$.ajax({
			type: "GET",
			url: url,
			data:data,
			success: function(msg){
				var obj = jQuery.parseJSON( ''+ msg +'' );
				var html= "";
				if(!(isEmpty(obj)))
				{
					for(var i=0;i<obj.groups.length;i++) {
						html += '<li class="groupListItem" id= ><a id="' + obj.groups[i]._id.$oid +'" href ="#group-details">'+obj.groups[i].name+'</a></li>';
					}
					
				}
				else
				{
					html += '<li>No Groups Found</li>'; 
				}
				//alert(html);
				$( "#myGroupList" ).empty();
				$( html ).appendTo( "#myGroupList" );
				//$("#myGroupList").html(html);
				$("#myGroupList").listview("refresh");
				//$( ".groupListItem" ).bind( "taphold", tapholdHandler );
				$( ".groupListItem" ).bind( "tap", getMyGroupDetails );
			},
			error: function () {
				alert("Error");
			}
		});
	}


	function getMyPhoneNumber()
	{
		var telephoneNumber = cordova.require("cordova/plugin/telephonenumber");
		var returnval;
		telephoneNumber.get(function(result) {
			returnval = result.substr(-10);
		}, function() {
			alert("telephinenum error");
		});
		return returnval;
	}
	//gets member name by phonenumber
	/*function getMemberName(phonenum)
	{
		var returnval="";
		function onSuccess(contacts) {
			returnval = (contacts[0].name.formatted);
			return returnval;

		};
		function onError(contactError) {
			alert('onError!');
		};

		var options      = new ContactFindOptions();
		options.filter	 = phonenum;
		var fields       =  ["name","phoneNumbers"];
		navigator.contacts.find(fields, onSuccess, onError, options);
	}
*/



	function tapholdHandler( event ){
		var html = "";
		alert("Long press");

		//$( event.target ).addClass( "taphold" );
	}
	
	//group info
	function getMyGroupDetails(event){
		//alert("in get my group details");
		var data="id="+event.target.getAttribute("id");
		var url = globalurl +"/api/user/group";	
		//var url="http://10.0.2.2:8080/VotesApp/api/user/group";
		var temp_mem_name="";
		$.ajax({
			async:false,
			type: "GET",
			url: url,
			data:data,
			success: function(msg){
				var obj = jQuery.parseJSON( ''+ msg +'' );
				var html= "";
				if(obj != null) {
					obj = jQuery.parseJSON( ''+ obj.group +'' );
					
					$("#groupid").val(obj._id.$oid);
					html = "<li data-theme='a'><h1>Group Name:"+obj.name+"</h1></li><li data-role='list-divider'>Group Members</li>";
					for(k=0;k<obj.members.length;k++){
						/*temp_mem_name=(getMemberName(obj.members[k]));
						alert("temp_mem"+temp_mem_name);*/
						var name = getContactNames(obj.members[k]);
						//alert(name);
							html = '<li>'+name+'</li>';
							$(html).appendTo( "#groupmembers" );
							//$("#groupmembers").listview("refresh");
						
						temp_mem_name="";
						
					}
				}	
				location.href="#group-details";
				//alert(html);
				$("#groupmembers").empty();
				//$("#groupmembers").html(html);
				$( html ).appendTo( "#groupmembers" );
				//$("#groupmembers").listview("refresh");
			
				//$( ".groupListItem" ).bind( "taphold", tapholdHandler );
				//alert(msg);
			},
			complete: function() {
				$("#groupmembers").listview("refresh");
			},
			error: function () {
				alert("Error");
			}
		});

	}

	
	//clear contacts
	$("#clearcontacts").click(function() {
		$('.checkcontacts').filter(':checkbox').prop('checked',false).checkboxradio("refresh");
	});

	function getContactNames(phonenum)
	{
		var returnVal='';
		var contacts = globalContacts;
		//alert("getContactNames success:"+phonenum+"<>"+contacts.length);
		for (var i = 0; i < contacts.length ; i++) {
			if(contacts[i].name != null && contacts[i].phoneNumbers != null) {
				var name=contacts[i].name.formatted;

				var phone=(contacts[i].phoneNumbers[0].value).replace(/[^\w]/gi, '');
				phone = phone.substr(-10);
				//alert(phone+":"+phonenum);
				if(phonenum == phone)
				{
					//alert("phone present");
					returnVal= name;
					break;
				}}
		}
		//alert("calling callback");
		return returnVal;
		
		/*function onSuccess(contacts) { 
			alert("getContactNames success:"+phonenum+"<>"+contacts.length);
			for (var i = 0; i < contacts.length ; i++) {
				if(contacts[i].name != null && contacts[i].phoneNumbers != null) {
					var name=contacts[i].name.formatted;

					var phone=(contacts[i].phoneNumbers[0].value).replace(/[^\w]/gi, '');
					phone = phone.substr(-10);
					//alert(phone+":"+phonenum);
					if(phonenum == phone)
					{
						alert("phone present");
						returnVal= name;
						break;
					}}
			}
			alert("calling callback");
			callback(returnVal);
		};
		function onError(contactError) {
			alert('onError!');
		};

		var options      = new ContactFindOptions();
		options.filter	 = "";
		options.multiple = true;
		var fields       =  ["displayName", "name", "phoneNumbers"];
		navigator.contacts.find(fields, onSuccess, onError, options);*/
		
		
	}

});

